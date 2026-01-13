import { browser } from '$app/environment';
import { PUBLIC_API_URL, PUBLIC_VAPID_KEY } from '$lib/config';
import { api } from '$lib/pkg/fetch';
import { toast } from 'svelte-sonner';

export type PushEvent =
	| { type: 'subscribed' }
	| { type: 'unsubscribed' }
	| { type: 'permission-denied' }
	| { type: 'subscribe-failed'; error: string }
	| { type: 'unsubscribe-failed'; error: string }
	| { type: 'demo-failed'; error: string };

class PushNotificationManager {
	isLoading = $state(true);
	isToggling = $state(false); // 푸시 알림 상태변환 loading...
	isSubscribed = $state(false);
	subscription = $state<PushSubscription | null>(null);
	permissionState = $state<NotificationPermission | null>(null);

	private VAPID_PUBLIC_KEY = PUBLIC_VAPID_KEY;
	private SERVER_URL = PUBLIC_API_URL;

	private events = $state<PushEvent[]>([]);

	private emit(event: PushEvent) {
		this.events = [...this.events, event];
	}

	consumeEvent(): PushEvent | null {
		if (this.events.length === 0) return null;
		const [head, ...rest] = this.events;
		this.events = rest;
		return head;
	}

	constructor() {
		if (browser) {
			// 브라우저가 Notification 기능이 있을 경우만.
			this.permissionState = 'Notification' in window ? Notification.permission : 'default';
			this.init();
			// 권한 변경 감시 시작
			this.watchPermission();
		}
	}

	private async init() {
		// 브라우저가 아니거나 SW를 지원하지 않으면 로딩 종료
		if (!browser || !('serviceWorker' in navigator) || !('Notification' in window)) {
			this.isLoading = false;
			return;
		}

		try {
			// 권한이 denied면 굳이 로딩할 필요 없음 (빠른 종료)
			if (Notification.permission === 'denied') {
				this.permissionState = 'denied';
				return;
			}

			// 1. 서비스 워커 등록
			await navigator.serviceWorker.register('/service-worker.js', {
				type: 'module',
				scope: '/'
			});
			await navigator.serviceWorker.ready;
			console.log('[PushManager] Service Worker Ready');

			// 2. 기존 구독 정보 확인
			await this.loadSubscription();
		} catch (e) {
			console.error('[PushManager] Init failed:', e);
		} finally {
			this.isLoading = false;
		}
	}

	private watchPermission() {
		if (!browser || !('permissions' in navigator) || !('Notification' in window)) return;

		navigator.permissions.query({ name: 'notifications' }).then((status) => {
			status.onchange = async () => {
				const newState = Notification.permission;
				this.permissionState = newState;
				console.log('[PushManager] Permission changed:', newState);

				// 권한이 취소(denied)되었다면 상태 초기화 및 서버 통보 시도
				if ((newState === 'denied' || newState === 'default') && this.subscription) {
					await this.handleUnsubscribe(); // 재사용
				} else if (newState === 'granted' && !this.subscription) {
					await this.loadSubscription();
				}
			};
		});
	}

	private urlBase64ToUint8Array(base64String: string) {
		const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
		const rawData = atob(base64);
		return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
	}

	// 구독 로직
	async handleSubscribe() {
		if (!('Notification' in window)) {
			this.emit({ type: 'subscribe-failed', error: '이 브라우저는 알림을 지원하지 않습니다.' });
			return;
		}
		this.isToggling = true;
		let tempSub: PushSubscription | null = null;

		try {
			const reg = await navigator.serviceWorker.ready;

			// 1. 권한 요청
			const permission = await Notification.requestPermission();
			this.permissionState = permission;
			if (permission !== 'granted') throw new Error('알림 권한이 거부되었습니다.');

			// 2. 브라우저 구독 생성
			// 기존 구독이 있다면 그것을 사용, 없다면 새로 생성
			tempSub = await reg.pushManager.getSubscription();
			if (!tempSub) {
				tempSub = await reg.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: this.urlBase64ToUint8Array(this.VAPID_PUBLIC_KEY)
				});
			}

			// 3. 서버 전송 (중요: this.subscription이 아닌 tempSub를 보냄)
			// PushSubscription 객체는 toJSON()을 가지고 있으므로 이를 명시적으로 호출하거나,
			// JSON.stringify가 내부적으로 호출하도록 객체 자체를 넘깁니다.
			await api<void>(`${this.SERVER_URL}/subscriptions`, {
				// 엔드포인트 이름 통일 권장
				method: 'POST',
				body: tempSub.toJSON() // 명시적으로 JSON 직렬화 데이터 전송
			});

			// 4. 모든 과정 성공 시 상태 업데이트
			this.subscription = tempSub;
			this.isSubscribed = true;
			this.emit({ type: 'subscribed' });
		} catch (e) {
			// 서버 등록 실패 시 브라우저 구독도 취소 (데이터 정합성 유지)
			if (tempSub) {
				await tempSub.unsubscribe().catch(() => {}); // 롤백 실패는 무시
			}

			this.subscription = null;
			this.isSubscribed = false;

			this.emit({
				type: 'subscribe-failed',
				error: e instanceof Error ? e.message : 'unknown error'
			});
		} finally {
			this.isToggling = false;
		}
	}

	// 구독 해제 로직
	async handleUnsubscribe() {
		// 이미 구독 정보가 없다면 종료
		if (!this.subscription) return;
		this.isToggling = true;
		const subToUnsubscribe = this.subscription; // 현재 구독 객체 캡처

		try {
			// 1. 서버에 먼저 알림 (Best Effort)
			// 서버 실패가 브라우저 해제를 막으면 안 되므로 try-catch로 감싸거나,
			// 실패하더라도 진행하도록 로직 구성
			try {
				await api<void>(`${this.SERVER_URL}/subscriptions/unsubscribe`, {
					method: 'POST',
					body: subToUnsubscribe.toJSON()
				});
			} catch (serverError) {
				console.warn('[PushManager] 서버 구독 해제 실패 (무시하고 진행):', serverError);
			}

			// 2. 브라우저 구독 해제 (가장 중요)
			await subToUnsubscribe.unsubscribe();

			this.emit({ type: 'unsubscribed' });
		} catch (e) {
			this.emit({
				type: 'subscribe-failed',
				error: e instanceof Error ? e.message : 'unknown error'
			});
		} finally {
			// 3. 성공하든 실패하든 클라이언트 상태는 초기화 (사용자 입장에서 해제됨)
			this.subscription = null;
			this.isSubscribed = false;

			this.isToggling = false;
		}
	}

	async loadSubscription() {
		if (!browser || !('serviceWorker' in navigator) || !('Notification' in window)) return;
		try {
			const reg = await navigator.serviceWorker.ready;
			const sub = await reg.pushManager.getSubscription();

			this.subscription = sub;
			this.isSubscribed = !!sub;
			this.permissionState = Notification.permission;

			console.log('[PushManager] Loaded subscription:', !!sub);
		} catch (e) {
			console.error('[PushManager] Load failed:', e);
		}
	}

	async testNotification() {
		try {
			if (!this.subscription) {
				return;
			}

			await api<void>(`${this.SERVER_URL}/api/push-test`, {
				method: 'POST',
				body: this.subscription.toJSON()
			});
		} catch (_) {
			toast.error('테스트 푸시 실패.');
		}
	}

	async handleDemoPush() {
		if (!browser || !('Notification' in window) || !('serviceWorker' in navigator)) {
			console.log('지원되지 않는 브라우저');
			// TODO(pjt): 전역 토스트 핸들러 추가 필요
			return;
		}

		this.isToggling = true;
		let tempSub: PushSubscription | null = null;
		let isNewSubscription = false; // 이번에 새로 만들었는지 여부 확인

		try {
			const reg = await navigator.serviceWorker.ready;

			// 1. 권한 요청
			const permission = await Notification.requestPermission();
			this.permissionState = permission;

			if (permission !== 'granted') {
				console.log('[PushManager] Permission denied');
				this.emit({ type: 'permission-denied' });
				return;
			}

			// 2. 구독 정보 확인 및 생성
			// 기존에 구독된 게 있는지 먼저 확인
			tempSub = await reg.pushManager.getSubscription();

			if (!tempSub) {
				// 기존 구독이 없을 때만 새로 생성하고, '새로 만들었다'고 표시
				tempSub = await reg.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: this.urlBase64ToUint8Array(this.VAPID_PUBLIC_KEY)
				});
				isNewSubscription = true;
			}

			// 3. 데모 전용 엔드포인트 호출
			const subJson = tempSub.toJSON();

			await api<void>(`${this.SERVER_URL}/api/push-demo`, {
				method: 'POST',
				body: {
					endpoint: subJson.endpoint,
					auth: subJson.keys?.auth,
					p256dh: subJson.keys?.p256dh,
					message: '짜잔형이야'
				}
			});
		} catch (e) {
			// 에러가 났는데, 만약 이번에 새로 만든 임시 구독이었다면 즉시 삭제
			if (tempSub && isNewSubscription) {
				await tempSub.unsubscribe().catch(() => {});
			}
			console.log(e);

			this.emit({
				type: 'demo-failed',
				error: e instanceof Error ? e.message : 'unknown error'
			});
			toast.error('push failed'); // TODO(pjt): 메세지 수정
		} finally {
			// 기존 유저(이미 구독한 유저)가 데모를 눌렀을 때는 구독을 유지해야 합니다.
			if (tempSub && isNewSubscription) {
				setTimeout(() => {
					tempSub?.unsubscribe().catch(() => {});
				}, 3000);
			}

			this.isToggling = false;
		}
	}
}

export const push = new PushNotificationManager();
