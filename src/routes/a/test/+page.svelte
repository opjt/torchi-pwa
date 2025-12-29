<script>
	import { goto } from '$app/navigation';
	import '$src/app.css';
	import { Bell } from 'lucide-svelte';
	import { onMount } from 'svelte';
	onMount(async () => {
		setTimeout(async () => {
			await console.log('onmopunt test1');
		}, 0);
	});
</script>

<div class="">
	<header class="px-6 py-5 top-0 backdrop-blur-md sticky z-10 flex items-center justify-between">
		<h1 class="text-xl font-bold tracking-tight">OhP</h1>
		<Bell />11
		<button
			title="back"
			onclick={() => goto('/p/services')}
			class="p-2 -mr-2 text-slate-500 hover:text-black transition-colors"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="22"
				height="22"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><path
					d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
				/><circle cx="12" cy="12" r="3" /></svg
			>
		</button>
	</header>
	<main class="flex-1">
		<section>
			<div
				class="px-6 py-2 bg-base-200 border-slate-100 font-bold text-slate-400 tracking-widest border-y text-[11px] uppercase"
			>
				오늘
			</div>

			<div
				class="px-6 py-5 gap-4 bg-blue-50/30 border-slate-50 transition-active active:bg-slate-50 relative flex overflow-hidden border-b-2"
			>
				<div class="w-1.5 h-1.5 bg-blue-600 mt-2.5 shrink-0 rounded-full"></div>
				<div class="flex-1 overflow-hidden">
					<div class="mb-1 gap-2 flex items-baseline justify-between">
						<h2 class="font-semibold text-sm truncate">시스템 업데이트 완료</h2>
						<span class="text-slate-400 shrink-0 text-[11px]">14:20</span>
					</div>
					<p class="text-sm text-slate-600 leading-relaxed line-clamp-2">
						새로운 버전 v2.4 가 성공적으로 설치되었습니다. 변경사항을 확인하세요.
					</p>
				</div>
			</div>

			<div
				class="px-6 py-5 gap-4 border-slate-50 transition-active active:bg-slate-50 flex border-b"
			>
				<div class="w-1.5 h-1.5 mt-2.5 shrink-0 rounded-full bg-transparent"></div>
				<div class="flex-1">
					<div class="mb-1 gap-2 flex items-baseline justify-between">
						<h2 class="font-medium text-sm text-slate-800">새 메시지</h2>
						<span class="text-slate-400 shrink-0 text-[11px]">09:15</span>
					</div>
					<p class="text-sm text-slate-500 leading-relaxed">시스템 재기동 알림</p>
				</div>
			</div>
		</section>

		<section>
			<div
				class="px-6 py-2 bg-slate-50 border-slate-100 font-bold text-slate-400 tracking-widest border-y text-[11px] uppercase"
			>
				어제
			</div>

			<div class="px-6 py-5 gap-4 border-slate-50 flex border-b opacity-70">
				<div class="w-1.5 h-1.5 mt-2.5 shrink-0"></div>
				<div class="flex-1">
					<div class="mb-1 flex items-baseline justify-between">
						<h2 class="font-medium text-sm text-slate-800">정기 점검 안내</h2>
						<span class="text-slate-400 text-[11px]">12.17</span>
					</div>
					<p class="text-sm text-slate-500 leading-relaxed">
						안정적인 서비스를 위해 새벽 2시부터 정기 점검이 진행됩니다.
					</p>
				</div>
			</div>
		</section>
	</main>

	<footer class="p-6">
		<button class="btn btn-ghost btn-block btn-sm text-slate-400 no-animation">
			이전 알림 더보기
		</button>
	</footer>
</div>
