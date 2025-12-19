<script lang="ts">
	import '$src/app.css';
	import { PUBLIC_VAPID_KEY } from '$env/static/public';
	import { onMount } from 'svelte';

	let pushEnabled = false;
	let endpointUrl = 'https://pook.io/api/push/user_unique_id'; // 실제 데이터로 대체 필요
	let copySuccess = false;

	// 1. VAPID 키를 이용한 푸시 구독 및 알림 권한 요청
	async function togglePush() {
		if (!pushEnabled) {
			const permission = await Notification.requestPermission();
			if (permission === 'granted') {
				// TODO: Service Worker 등록 및 Subscription 객체 생성 로직
				pushEnabled = true;
			} else {
				alert('알림 권한이 거부되었습니다.');
				pushEnabled = false;
			}
		} else {
			pushEnabled = false;
		}
	}

	// 2. 클립보드 복사 로직 (curl 명령어)
	async function copyToClipboard() {
		const curlCmd = `curl -X POST "${endpointUrl}" -d "msg=Hello Pook!"`;
		await navigator.clipboard.writeText(curlCmd);
		copySuccess = true;
		setTimeout(() => (copySuccess = false), 2000);
	}

	// 3. 테스트 푸시 발송 API 호출
	async function sendTestPush() {
		console.log('테스트 푸시 발송');
		// fetch('/api/push/test', { method: 'POST' });
	}
</script>

<div class="bg-base-100 text-base-content font-sans flex min-h-screen flex-col">
	<header class="px-6 py-6 top-0 bg-base-100/80 backdrop-blur-md sticky z-10 flex items-center">
		<a class="p-2 -ml-2 mr-2 opacity-50 transition-opacity hover:opacity-100" href="/" title="home">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg
			>
		</a>
		<h1 class="text-xl font-black tracking-tight">설정</h1>
	</header>

	<main class="px-6 pb-10 space-y-10 flex-1">
		<section>
			<h2 class="font-bold mb-4 text-[11px] tracking-[0.2em] uppercase opacity-40">Account</h2>
			<div
				class="gap-4 bg-neutral text-neutral-content p-5 rounded-3xl shadow-sm flex items-center"
			>
				<div
					class="w-14 h-14 bg-base-100/10 rounded-2xl font-black text-xl border-white/10 flex items-center justify-center border italic"
				>
					OHP
				</div>
				<div>
					<p class="font-bold text-[15px]">사용자님</p>
					<p class="text-xs opacity-60">user@example.com</p>
					<div class="badge badge-primary badge-sm mt-1 font-bold text-[10px]">FREE PLAN</div>
				</div>
			</div>
		</section>

		<section>
			<div class="mb-4 flex items-center justify-between">
				<div class="gap-2 flex items-center">
					<h2 class="font-bold text-[11px] tracking-[0.2em] uppercase opacity-40">Endpoint</h2>
				</div>
				{#if copySuccess}
					<span class="text-success font-bold animate-bounce text-[10px]">COPIED!</span>
				{/if}
			</div>
			<div class="space-y-4">
				<p class="leading-relaxed text-[13px] opacity-70">
					아래 URL로 <span class="badge badge-ghost badge-sm font-mono">POST</span> 요청을 보내면 즉시
					푸시가 발송됩니다.
				</p>
				<div class="group relative">
					<input
						type="text"
						readonly
						value={endpointUrl}
						class="bg-neutral text-neutral-content rounded-2xl pl-5 pr-14 py-4 text-xs font-mono border-white/5 w-full border focus:outline-none"
					/>
					<button
						title="copy-url"
						on:click={copyToClipboard}
						class="right-2 top-2 btn btn-square btn-ghost btn-sm text-primary hover:bg-primary/10 rounded-xl absolute"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path
								d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
							/></svg
						>
					</button>
				</div>
			</div>
		</section>

		<section>
			<h2 class="font-bold mb-4 text-[11px] tracking-[0.2em] uppercase opacity-40">Preferences</h2>
			<div class="bg-base-200/50 rounded-3xl p-2">
				<label
					class="p-4 hover:bg-base-200 rounded-2xl flex cursor-pointer items-center justify-between transition-colors"
				>
					<div>
						<p class="text-sm font-bold">푸시 알림 활성화</p>
						<p class="text-[12px] opacity-50">브라우저 알림 권한을 요청합니다</p>
					</div>
					<input
						type="checkbox"
						class="toggle toggle-primary"
						bind:checked={pushEnabled}
						on:change={togglePush}
					/>
				</label>

				<div class="bg-base-content/5 mx-4 h-px"></div>

				<button
					on:click={sendTestPush}
					class="p-4 hover:bg-base-200 rounded-2xl group flex w-full items-center justify-between transition-colors"
				>
					<div class="text-left">
						<p class="text-sm font-bold">테스트 전송</p>
						<p class="text-[12px] opacity-50">설정이 올바른지 확인해보세요</p>
					</div>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="group-active:translate-x-1 opacity-30 transition-transform"
						><path d="m9 18 6-6-6-6" /></svg
					>
				</button>
			</div>
		</section>

		<section class="pt-6 space-y-6">
			<button
				class="btn btn-outline btn-error h-14 rounded-2xl font-bold w-full border-2 opacity-60 transition-all hover:opacity-100"
			>
				로그아웃
			</button>
			<div class="space-y-1 text-center">
				<p class="font-mono text-[10px] opacity-30">v1.0.0-beta.build.02</p>
			</div>
		</section>
	</main>
</div>
