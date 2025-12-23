<script lang="ts">
	import '$src/app.css';
	import { goto } from '$app/navigation';
	import { PUBLIC_VAPID_KEY } from '$env/static/public';
	import { loginWithGithub } from '$lib/client/auth/github-auth';
	import { Play } from 'lucide-svelte';

	const VAPID_PUBLIC_KEY = PUBLIC_VAPID_KEY;

	function handleSubscribe() {
		console.log(VAPID_PUBLIC_KEY);
	}
</script>

<div
	class="bg-base-100 text-base-content max-w-md p-8 font-sans mx-auto flex min-h-screen flex-col"
>
	<div class="flex flex-1 flex-col items-center justify-center text-center">
		<div
			class="w-20 h-20 bg-neutral text-neutral-content mb-8 shadow-xl rounded-4xl flex items-center justify-center"
		>
			<span class="font-black text-3xl italic">OHP</span>
		</div>

		<div class="space-y-3">
			<h1 class="text-3xl font-black tracking-tight">On-demand hook Push</h1>
			<p class="leading-relaxed opacity-70">
				웹훅을 보내고, 폰에서 바로 응답하세요.<br />
				가장 단순한 <span class="text-primary font-semibold">Interactive Push</span> 도구
			</p>
		</div>

		<div class="mt-10 space-y-4 w-full">
			<div class="px-1 flex items-center justify-between">
				<span class="font-bold tracking-widest text-[11px] uppercase opacity-50">Quick Test</span>
				<span class="badge badge-success badge-outline badge-xs font-bold text-[9px]">READY</span>
			</div>

			<div class="group relative">
				<div class="top-2 left-3 absolute z-10">
					<div class="gap-1 flex">
						<span class="w-2 h-2 bg-error rounded-full"></span>
						<span class="w-2 h-2 bg-warning rounded-full"></span>
						<span class="w-2 h-2 bg-success rounded-full"></span>
					</div>
				</div>

				<div
					class="bg-neutral text-neutral-content rounded-2xl p-5 pt-7 font-mono shadow-2xl relative overflow-hidden text-left text-[13px]"
				>
					<span class="text-info">curl</span><span class="">&nbsp;-X POST</span>
					<div class="break-all opacity-90">"https://ohp.io/api/demo" \</div>
					<div>
						-d <span class="text-success">"msg=Hello World!"</span>
					</div>

					<button
						on:click={handleSubscribe}
						class="right-3 bottom-3 btn btn-primary btn-sm rounded-xl gap-2 shadow-lg absolute normal-case transition-transform hover:scale-105"
					>
						<Play size={14} strokeWidth={2} />
						Run
					</button>
				</div>
			</div>

			<p class="text-[11px] opacity-60">Run 버튼을 누르면 push 알림이 발송됩니다.</p>
		</div>

		<div class="mt-12 space-y-3 w-full">
			<button
				on:click={loginWithGithub}
				class="btn btn-neutral h-14 rounded-2xl gap-3 flex w-full items-center justify-center border-none transition-all hover:opacity-90"
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
				<span class="font-bold text-[15px]">GitHub로 시작하기</span>
			</button>

			<button
				class="btn btn-outline h-14 rounded-2xl w-full opacity-70 transition-all hover:opacity-100"
			>
				<span class="font-semibold text-[15px]">다른 계정으로 로그인</span>
			</button>
		</div>
	</div>

	<footer class="py-4 mt-auto text-center">
		<p class="text-[12px] opacity-40">
			계속 진행함으로써 OhP의 <span class="cursor-pointer underline">이용약관</span>에 동의하게
			됩니다.
		</p>
	</footer>
</div>
