<script>
	import '$src/app.css';
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';

	let step = 1; // 1: 시작, 2: 테스트 중, 3: 결과 및 가입유도
	let isPermissionGranted = false;

	async function requestPermission() {
		// 실제 PWA 권한 요청 로직이 들어갈 자리
		const permission = await Notification.requestPermission();
		if (permission === 'granted') {
			isPermissionGranted = true;
			step = 2;

			// 2초 뒤에 성공 화면으로 전환 (실제 푸시가 왔다고 가정하는 시점)
			setTimeout(() => {
				step = 3;
			}, 2500);
		}
	}
</script>

<div class="bg-white text-slate-900 max-w-md p-8 font-sans mx-auto flex min-h-screen flex-col">
	{#if step === 1}
		<div in:fade class="space-y-10 flex flex-1 flex-col items-center justify-center text-center">
			<div class="w-20 h-20 bg-slate-900 shadow-xl flex items-center justify-center rounded-[2rem]">
				<span class="text-white font-black text-3xl italic">OhP</span>
			</div>

			<div class="space-y-4">
				<h1 class="text-3xl font-black tracking-tight leading-tight">
					웹훅을 푸시로<br />1초 만에 받으세요
				</h1>
				<p class="text-slate-500 text-lg leading-relaxed">
					가입 없이 지금 바로<br />테스트 알림을 보내볼까요?
				</p>
			</div>

			<button
				on:click={requestPermission}
				class="btn btn-primary h-16 rounded-2xl text-lg font-bold shadow-lg shadow-blue-100 w-full border-none"
			>
				내 폰으로 알림 쏴보기
			</button>
		</div>
	{:else if step === 2}
		<div in:fade class="space-y-6 flex flex-1 flex-col items-center justify-center text-center">
			<span class="loading loading-ring loading-lg text-blue-600"></span>
			<div class="space-y-2">
				<p class="text-xl font-bold italic">Pushing...</p>
				<p class="text-slate-400 text-sm">기기로 신호를 보내고 있습니다</p>
			</div>
		</div>
	{:else if step === 3}
		<div in:fly={{ y: 20 }} class="flex flex-1 flex-col items-center justify-center text-center">
			<div class="w-20 h-20 bg-green-100 mb-8 flex items-center justify-center rounded-full">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-10 w-10 text-green-600"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="3"
						d="M5 13l4 4L19 7"
					/>
				</svg>
			</div>

			<h2 class="text-2xl font-black mb-4">방금 알림을 받으셨나요?</h2>
			<p class="text-slate-500 mb-12">
				이것이 <strong>OhP</strong>의 속도입니다.<br />
				이제 고유 엔드포인트를 발급받고<br />시스템과 연동해보세요.
			</p>

			<div class="space-y-3 w-full">
				<button
					on:click={() => goto('/auth/github')}
					class="btn btn-neutral h-14 rounded-2xl gap-3 shadow-xl flex w-full items-center justify-center border-none"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						fill="currentColor"
						viewBox="0 0 16 16"
					>
						<path
							d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
						/>
					</svg>
					<span class="font-bold">GitHub로 3초만에 가입</span>
				</button>
				<button class="btn btn-ghost text-slate-400 font-medium">나중에 할게요</button>
			</div>
		</div>
	{/if}
</div>

<style>
	/* daisyUI의 primary 색상을 OhP 브랜드 색상으로 커스텀 (Tailwind config에서 해도 됨) */
	:global(.btn-primary) {
		background-color: #2563eb !important;
		color: white !important;
	}
</style>
