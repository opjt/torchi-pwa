import { browser } from '$app/environment';
import { PUBLIC_SERVER_URL, PUBLIC_VAPID_KEY } from '$env/static/public';

class PushNotificationManager {
	isLoading = $state(true);
	isSubscribed = $state(false);
	subscription = $state<PushSubscription | null>(null);
	permissionState = $state(browser ? Notification.permission : null);

	statusMsg = $state('');
	statusType = $state<'success' | 'error' | 'warning' | ''>('');

	// 상수 설정
	private VAPID_PUBLIC_KEY = PUBLIC_VAPID_KEY;
	private SERVER_URL = PUBLIC_SERVER_URL;

	constructor() {
		if (browser) {
			// 권한이 애초에 없으면 로딩할 필요도 없이 바로 false
			if (Notification.permission !== 'granted') {
				this.isLoading = false;
				this.permissionState = Notification.permission;
			}
			this.init();
			this.watchPermission();
		}
	}

	private async init() {
		if (!browser || !('serviceWorker' in navigator)) {
			this.isLoading = false;
			return;
		}

		try {
			// 1. 앱 시작 시 미리 서비스 워커 등록
			await navigator.serviceWorker.register('/service-worker.js', { type: 'module' });

			// 2. 서비스 워커가 준비될 때까지 기다림
			await navigator.serviceWorker.ready;
			console.log('Service Worker Ready');

			// 3. 기존 구독 정보 확인
			await this.loadSubscription();
		} catch (e) {
			console.error('서비스 워커 등록 실패:', e);
		} finally {
			this.isLoading = false;
		}
	}

	// 핵심: 브라우저 권한 설정을 실시간으로 감시
	private watchPermission() {
		if ('permissions' in navigator) {
			navigator.permissions.query({ name: 'notifications' }).then((status) => {
				status.onchange = () => {
					this.permissionState = Notification.permission;
					// 권한이 취소(denied)되었다면 구독 상태도 업데이트
					if (this.permissionState !== 'granted') {
						this.isSubscribed = false;
						this.subscription = null;
					} else {
						// 만약 권한이 다시 granted로 바뀌었다면 구독 정보를 다시 확인
						this.loadSubscription();
					}
				};
			});
		}
	}

	async loadSubscription() {
		try {
			const reg = await navigator.serviceWorker.ready;
			this.subscription = await reg.pushManager.getSubscription();
			this.isSubscribed = !!this.subscription;
			this.permissionState = Notification.permission;
		} catch (e) {
			console.error('구독 정보 로드 실패:', e);
		}
	}

	showStatus(msg: string, type: typeof this.statusType) {
		this.statusMsg = msg;
		this.statusType = type;
	}

	private urlBase64ToUint8Array(base64String: string) {
		const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
		const rawData = atob(base64);
		return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
	}

	async handleSubscribe() {
		try {
			this.showStatus('구독 중...', 'warning');

			const reg = await navigator.serviceWorker.ready;

			const permission = await Notification.requestPermission();
			if (permission !== 'granted') throw new Error('알림 권한 거부됨');
			this.subscription = await reg.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: this.urlBase64ToUint8Array(this.VAPID_PUBLIC_KEY)
			});
			const res = await fetch(`${this.SERVER_URL}/push/subscribe`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(this.subscription)
			});

			if (!res.ok) throw new Error('서버 구독 등록 실패');

			this.isSubscribed = true;
			this.showStatus('✅ 알림 구독 완료!', 'success');
		} catch (e) {
			const message = e instanceof Error ? e.message : '알 수 없는 오류';
			this.showStatus(`❌ 구독 실패: ${message}`, 'error');
		}
	}

	async handleUnsubscribe() {
		try {
			const reg = await navigator.serviceWorker.ready;
			const sub = await reg.pushManager.getSubscription();
			if (sub) await sub.unsubscribe();

			this.subscription = null;
			this.isSubscribed = false;
			this.showStatus('구독 해제 완료', 'warning');
		} catch (e) {
			const message = e instanceof Error ? e.message : '알 수 없는 오류';
			this.showStatus(`❌ 구독 해제 실패: ${message}`, 'error');
		}
	}

	async testNotification() {
		try {
			if (!this.subscription) throw new Error('구독 정보 없음');
			const res = await fetch(`${this.SERVER_URL}/push/push`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(this.subscription)
			});
			if (!res.ok) throw new Error('푸시 전송 실패');
			this.showStatus('✅ 테스트 알림 전송!', 'success');
		} catch (e) {
			const message = e instanceof Error ? e.message : '알 수 없는 오류';
			this.showStatus(` 테스트 실패 : ${message}`, 'error');
		}
	}
}

// 싱글톤으로 인스턴스 생성하여 export
export const push = new PushNotificationManager();
