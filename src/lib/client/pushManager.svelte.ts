import { browser } from '$app/environment';
import { PUBLIC_API_URL, PUBLIC_VAPID_KEY } from '$lib/config';
import { api } from '$lib/pkg/fetch';

export type PushEvent =
	| { type: 'subscribed' }
	| { type: 'unsubscribed' }
	| { type: 'permission-denied' }
	| { type: 'subscribe-failed'; error: string }
	| { type: 'unsubscribe-failed'; error: string };

class PushNotificationManager {
	isLoading = $state(true);
	isSubscribed = $state(false);
	subscription = $state<PushSubscription | null>(null);
	permissionState = $state<NotificationPermission | null>(browser ? Notification.permission : null);

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
			this.init();
			// 권한 변경 감시 시작
			this.watchPermission();
		}
	}

	private async init() {
		// 브라우저가 아니거나 SW를 지원하지 않으면 로딩 종료
		if (!browser || !('serviceWorker' in navigator)) {
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
		if (!browser || !('permissions' in navigator)) return;

		navigator.permissions.query({ name: 'notifications' }).then((status) => {
			status.onchange = async () => {
				const newState = Notification.permission;
				this.permissionState = newState;
				console.log('[PushManager] Permission changed:', newState);

				// 권한이 취소(denied)되었다면 상태 초기화 및 서버 통보 시도
				if (newState === 'denied' && this.subscription) {
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
		}
	}

	// 구독 해제 로직
	async handleUnsubscribe() {
		// 이미 구독 정보가 없다면 종료
		if (!this.subscription) return;

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
		}
	}

	async loadSubscription() {
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

	// async testNotification() {
	// 	try {
	// 		if (!this.subscription) {
	// 			this.showStatus('구독 정보가 없습니다.', 'warning');
	// 			return;
	// 		}

	// 		await api(`${this.SERVER_URL}/push/push`, {
	// 			method: 'POST',
	// 			// Content-Type 등은 api 유틸 내부 처리에 따름
	// 			body: { subscription: this.subscription.toJSON() } // 백엔드 DTO에 맞게 구조 조정 필요할 수 있음
	// 		});

	// 		this.showStatus('테스트 알림을 보냈습니다!', 'success');
	// 	} catch (e) {
	// 		const message = e instanceof Error ? e.message : '전송 실패';
	// 		this.showStatus(`테스트 실패: ${message}`, 'error');
	// 	}
	// }
}

export const push = new PushNotificationManager();
