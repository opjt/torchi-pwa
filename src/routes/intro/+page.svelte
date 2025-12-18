<script>
	import '$src/app.css';
	import { goto } from '$app/navigation';
</script>

<div class="bg-white text-slate-900 max-w-md p-8 font-sans mx-auto flex min-h-screen flex-col">
	<div class="flex flex-1 flex-col items-center justify-center text-center">
		<div class="w-20 h-20 bg-slate-900 mb-8 shadow-xl rounded-4xl flex items-center justify-center">
			<span class="text-white font-black text-3xl italic">OhP</span>
		</div>

		<div class="space-y-3">
			<h1 class="text-3xl font-black tracking-tight text-slate-900">One-tap Push</h1>
			<p class="text-slate-500 leading-relaxed">
				웹훅을 보내고, 폰에서 바로 응답하세요.<br />
				가장 단순한 <span class="text-blue-600 font-semibold">Interactive Push</span> 도구
			</p>
		</div>

		<div class="mt-12 space-y-3 w-full">
			<button
				on:click={() => goto('/auth/github')}
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
				class="btn btn-ghost h-14 rounded-2xl border-slate-100 text-slate-600 hover:bg-slate-50 w-full border transition-all"
			>
				<span class="font-semibold text-[15px]">다른 계정으로 로그인</span>
			</button>
		</div>
	</div>

	<footer class="mt-auto text-center">
		<p class="text-slate-400 text-[12px]">
			계속 진행함으로써 OhP의 <span class="underline">이용약관</span>에 동의하게 됩니다.
		</p>
	</footer>
</div>
