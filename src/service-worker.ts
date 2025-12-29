/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching';

type ManifestEntry = { url: string; revision: string | null; integrity?: string };
const DYNAMIC_CACHE_NAME = 'dynamic-cache-v1';

type CustomServiceWorkerGlobalScope = ServiceWorkerGlobalScope & {
	skipWaiting: () => void;
	clients: Clients;
};
const sw = self as unknown as CustomServiceWorkerGlobalScope;

const precache_list: Array<ManifestEntry> = [
	...((self as unknown as { __WB_MANIFEST: ManifestEntry[] }).__WB_MANIFEST || [])
];
precacheAndRoute(precache_list);

sw.addEventListener('install', () => {
	console.log('[SW] 서비스 워커 설치 중...');

	sw.skipWaiting();
});

sw.addEventListener('activate', (event) => {
	console.log('[SW] 서비스 워커 활성화됨');

	// 동적 캐시 이름 정의 (Fetch 이벤트에서 사용)

	async function deleteOldCaches() {
		const keys = await caches.keys();
		for (const key of keys) {
			// Workbox 캐시와 현재 동적 캐시를 제외한 모든 것을 삭제합니다.
			if (!key.startsWith('workbox-precache-') && key !== DYNAMIC_CACHE_NAME) {
				await caches.delete(key);
			}
		}
	}

	event.waitUntil(deleteOldCaches());
	event.waitUntil(sw.clients.claim());
});

sw.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	async function respond() {
		const cache = await caches.open(DYNAMIC_CACHE_NAME);
		const url = new URL(event.request.url);

		try {
			const response = await fetch(event.request);

			if (response.status === 200 && url.protocol.startsWith('http')) {
				cache.put(event.request, response.clone());
			}

			return response;
		} catch {
			const cachedResponse = await cache.match(event.request);
			if (cachedResponse) {
				return cachedResponse;
			}

			return new Response(null, { status: 503, statusText: 'Service Unavailable' });
		}
	}

	event.respondWith(respond());
});

sw.addEventListener('push', (event) => {
	if (!event.data) return;

	// 기본 데이터 설정 (이전 답변에서 누락된 url, tag, data 등을 추가하여 견고하게 만듦)
	let data = {
		title: '새로운 알림',
		body: '내용이 없습니다.',
		icon: '/logo/icon-192x192.png',
		badge: '/logo/badge-72x72.png',
		url: '/', // 기본 URL
		tag: 'default-tag',
		data: {}
	};

	// 데이터 파싱 (JSON 파싱 실패 대비)
	try {
		const jsonData = event.data.json();
		data = { ...data, ...jsonData };
		console.log('[SW] Push Data:', data);
	} catch (e) {
		console.log('Push 데이터가 JSON이 아닙니다. 텍스트로 처리합니다.', e);
		data.body = event.data.text();
	}

	const options: NotificationOptions = {
		body: data.body,
		icon: data.icon,
		badge: data.badge,
		data: { url: data.url, custom: data.data || {} }, // data 필드에 url 포함
		tag: `push-${Date.now()}`
	};

	event.waitUntil(sw.registration.showNotification(data.title, options));
});

//  알림 클릭 이벤트 (액션 처리 포함)
sw.addEventListener('notificationclick', (event) => {
	event.notification.close();

	if (event.action === 'close') {
		return;
	}

	// notification.data에서 url을 안전하게 추출
	const targetUrl = event.notification.data?.url || '/';

	// 앱 열기 또는 포커스
	event.waitUntil(
		sw.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
			for (const client of clientList) {
				if (client.url.includes(sw.registration.scope) && 'focus' in client) {
					return client.focus();
				}
			}
			if (sw.clients.openWindow) {
				return sw.clients.openWindow(targetUrl);
			}
		})
	);
});

//  백그라운드 동기화 (SyncEvent 타입 정의 및 핸들러)
interface SyncEvent extends ExtendableEvent {
	tag: string;
	lastChance: boolean;
}
sw.addEventListener('sync', (event) => {
	const syncEvent = event as SyncEvent;
	if (syncEvent.tag === 'sync-notifications') {
		console.log('[SW] 알림 동기화 실행');
		// event.waitUntil(doSomething());
	}
});
