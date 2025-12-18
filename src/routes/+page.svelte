<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Bell, BellOff } from 'lucide-svelte';

  let isSubscribed = false;
  let subscription: PushSubscription | null = null;
  let statusMsg = '';
  let statusType: 'success' | 'error' | 'warning' | '' = '';

  // Go 서버에서 받은 VAPID Public Key
  const VAPID_PUBLIC_KEY = 'BEi1kAUsyGhZpW2KkFUlteU9G0MYWG_mUoxIKDP427pUFzmsZVsvXBSY_vsk2WQ05Yl4nFQgOaK1KPN5SO4I3Dg';

  // API Base
  const SERVER_URL = 'http://localhost:25565';

  function showStatus(msg: string, type: typeof statusType) {
    statusMsg = msg;
    statusType = type;
  }

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
  }

  async function registerSW() {
    if (!('serviceWorker' in navigator)) {
      throw new Error('ServiceWorker 미지원 브라우저');
    }
    // const reg = await navigator.serviceWorker.register('/service-worker.js',  );
    const reg = await navigator.serviceWorker.register('/service-worker.js',    { type: 'module' }  );
    await navigator.serviceWorker.ready;
    return reg;
  }

  async function loadSubscription() {
    const reg = await navigator.serviceWorker.ready;
    subscription = await reg.pushManager.getSubscription();
    isSubscribed = !!subscription;
  }

  async function handleSubscribe() {
    try {
      showStatus('구독 중...', 'warning');

      const reg = await registerSW();

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('알림 권한 거부됨');
      }

      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      const res = await fetch(`${SERVER_URL}/push/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      if (!res.ok) throw new Error('서버 구독 등록 실패');

      isSubscribed = true;
      showStatus('✅ 알림 구독 완료!', 'success');
    } catch (e: any) {
      console.error(e);
      showStatus(`❌ 구독 실패: ${e.message}`, 'error');
    }
  }

  async function handleUnsubscribe() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();

      subscription = null;
      isSubscribed = false;
      showStatus('구독 해제 완료', 'warning');
    } catch (e: any) {
      showStatus(`❌ 구독 해제 실패: ${e.message}`, 'error');
    }
  }

  async function testNotification() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) throw new Error('구독 정보 없음');

      const res = await fetch(`${SERVER_URL}/push/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub)
      });

      if (!res.ok) throw new Error('푸시 전송 실패');
      showStatus('✅ 테스트 알림 전송!', 'success');
    } catch (e: any) {
      showStatus(`❌ 테스트 실패: ${e.message}`, 'error');
    }
  }

  async function broadcast() {
    try {
      const res = await fetch(`${SERVER_URL}/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '전체 공지',
          body: '모든 구독자에게 보내는 테스트 알림입니다',
        })
      });
      if (!res.ok) throw new Error('Broadcast 실패');
      const json = await res.json();
      showStatus(`📢 전송 완료: ${json.success} / 실패 ${json.failed}`, 'success');
    } catch (e: any) {
      showStatus(`❌ Broadcast 실패: ${e.message}`, 'error');
    }
  }

  onMount(async () => {
    if (!('PushManager' in window)) {
      showStatus('이 브라우저는 Push 미지원', 'error');
      return;
    }
    await loadSubscription();
    if (isSubscribed) showStatus('✅ 이미 구독됨', 'success');
  });
</script>

<div class="container mx-auto p-8 max-w-xl">
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        🔔 Push Notification
      </CardTitle>
      <CardDescription>PWA 푸시 알림 테스트</CardDescription>
    </CardHeader>

    <CardContent class="space-y-4">
      {#if statusMsg}
        <div class={`rounded p-3 text-sm 
          ${statusType === 'success' ? 'bg-green-100 text-green-800' : ''}
          ${statusType === 'error' ? 'bg-red-100 text-red-800' : ''}
          ${statusType === 'warning' ? 'bg-yellow-100 text-yellow-800' : ''}`}
        >
          {statusMsg}
        </div>
      {/if}

      <div class="flex items-center gap-3">
        {#if isSubscribed}
          <BellOff class="w-6 h-6 text-green-500" />
          <span class="text-sm text-muted-foreground">알림 구독 중</span>
        {:else}
          <Bell class="w-6 h-6 text-gray-400" />
          <span class="text-sm text-muted-foreground">알림 미구독</span>
        {/if}
      </div>

      <div class="flex flex-col gap-2">
        {#if !isSubscribed}
          <Button onclick={handleSubscribe}>알림 구독하기</Button>
        {:else}
          <Button variant="outline" onclick={testNotification}>테스트 알림</Button>
          <Button variant="outline" onclick={broadcast}>📢 전체 알림 (테스트)</Button>
          <Button variant="destructive" onclick={handleUnsubscribe}>구독 해제</Button>
        {/if}
      </div>

      {#if subscription}
        <pre class="text-xs bg-muted p-3 rounded overflow-auto max-h-64">
{JSON.stringify(subscription, null, 2)}
        </pre>
      {/if}
    </CardContent>
  </Card>
</div>
