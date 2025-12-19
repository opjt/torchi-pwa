<script lang="ts">
	import '$src/app.css';
	import { PUBLIC_VAPID_KEY } from '$env/static/public';
	import { onMount } from 'svelte';

	let pushEnabled = false;
	let endpointUrl = 'https://pook.io/api/push/user_unique_id';
	let copySuccess = false;

	// 알림 권한 상태 관리 ('default', 'granted', 'denied')
	let permissionState = 'granted';

	// script 태그 안에 추가
	onMount(() => {
		permissionState = Notification.permission;
		pushEnabled = permissionState === 'granted';

		// 권한 변경 모니터링 시작
		if ('permissions' in navigator) {
			navigator.permissions.query({ name: 'notifications' }).then((status) => {
				status.onchange = () => {
					// 사용자가 설정을 바꾸면 이 함수가 실행됩니다!
					permissionState = Notification.permission;
					pushEnabled = permissionState === 'granted';
					console.log('권한 상태가 변경됨:', permissionState);
				};
			});
		}
	});

	async function togglePush() {
		if (!pushEnabled) {
			const permission = await Notification.requestPermission();
			permissionState = permission;
			if (permission === 'granted') {
				pushEnabled = true;
				// TODO: Subscription 로직
			} else {
				pushEnabled = false;
			}
		} else {
			pushEnabled = false;
		}
	}

	async function copyToClipboard() {
		const curlCmd = `curl -X POST "${endpointUrl}" -d "msg=Hello Pook!"`;
		await navigator.clipboard.writeText(curlCmd);
		copySuccess = true;
		setTimeout(() => (copySuccess = false), 2000);
	}

	async function sendTestPush() {
		console.log('테스트 푸시 발송');
	}
</script>

<div class="bg-base-100 text-base-content font-sans flex min-h-screen flex-col">
	<header class="px-6 py-6 top-0 bg-base-100/80 backdrop-blur-md sticky z-20 flex items-center">
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

	{#if permissionState !== 'granted'}
		<button
			type="button"
			title="push-notification"
			on:click={togglePush}
			class="bg-warning text-warning-content px-6 py-3 shadow-lg top-22 sticky z-10 flex cursor-pointer items-center justify-between transition-all active:scale-[0.98]"
		>
			<div class="gap-3 flex items-center">
				<span class="h-2 w-2 relative flex">
					<span
						class="animate-ping bg-warning-content absolute inline-flex h-full w-full rounded-full opacity-75"
					></span>
					<span class="h-2 w-2 bg-warning-content relative inline-flex rounded-full"></span>
				</span>
				<p class="font-black tracking-tighter text-[11px] uppercase">
					{permissionState === 'denied' ? '알림 권한이 차단됨' : '알림 권한이 필요합니다'}
				</p>
			</div>
			<div class="gap-1 flex items-center">
				<span class="font-bold text-[10px] underline decoration-2 underline-offset-2">설정하기</span
				>
			</div>
		</button>
	{/if}

	<main class="px-6 pb-10 pt-4 space-y-10 flex-1 overflow-x-hidden">
		<section>
			<h2 class="font-bold mb-4 text-[11px] tracking-[0.2em] uppercase opacity-40">Account</h2>
			<div
				class="gap-4 bg-neutral text-neutral-content p-5 rounded-3xl shadow-sm border-white/5 flex items-center border"
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
					<span
						class="badge {pushEnabled
							? 'badge-success'
							: 'badge-ghost opacity-30'} badge-outline badge-xs font-bold px-1.5 text-[9px]"
					>
						{pushEnabled ? 'ACTIVE' : 'INACTIVE'}
					</span>
				</div>
				{#if copySuccess}
					<span class="text-success font-bold animate-bounce text-[10px]">COPIED!</span>
				{/if}
			</div>
			<div class="group relative">
				<input
					type="text"
					readonly
					value={endpointUrl}
					class="bg-neutral text-neutral-content rounded-2xl pl-5 pr-14 py-4 text-xs font-mono border-white/5 shadow-inner w-full border focus:outline-none"
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
		</section>

		<section>
			<h2 class="font-bold mb-4 text-[11px] tracking-[0.2em] uppercase opacity-40">Preferences</h2>
			<div class="bg-base-200/50 rounded-3xl p-2 border-base-content/5 border">
				<label
					class="p-4 hover:bg-base-200 rounded-2xl flex cursor-pointer items-center justify-between transition-colors"
				>
					<div>
						<p class="text-sm font-bold">푸시 알림 활성화</p>
						<p class="text-[12px] opacity-50">
							{permissionState === 'denied'
								? '브라우저 설정에서 차단을 해제해주세요'
								: '브라우저 알림 권한을 요청합니다'}
						</p>
					</div>
					<input
						type="checkbox"
						class="toggle toggle-primary"
						bind:checked={pushEnabled}
						on:change={togglePush}
						disabled={permissionState === 'denied'}
					/>
				</label>
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
