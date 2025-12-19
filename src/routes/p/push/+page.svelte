<script>
	import '$src/app.css';
</script>

<div class="bg-white text-slate-900 max-w-md p-8 font-sans mx-auto flex min-h-screen flex-col">
	<div class="space-y-8 flex flex-1 flex-col items-center justify-center text-center">
		<div class="relative">
			<div
				class="inset-0 bg-blue-400 blur-2xl animate-pulse absolute rounded-full opacity-20"
			></div>
			<div
				class="w-24 h-24 bg-slate-900 rounded-3xl shadow-2xl relative flex items-center justify-center"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="40"
					height="40"
					viewBox="0 0 24 24"
					fill="none"
					stroke="white"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path
						d="M13.73 21a2 2 0 0 1-3.46 0"
					/></svg
				>
			</div>
		</div>

		<div class="space-y-4">
			<h1 class="text-2xl font-black tracking-tight">알림 권한이 필요합니다</h1>
			<p class="text-slate-500 leading-relaxed">
				이 서비스는 외부 시스템의 메시지를 <br />
				<span class="text-slate-900 font-semibold underline underline-offset-4">실시간 푸시</span>로
				전달하기 위한 도구입니다.
			</p>
		</div>

		<div class="bg-slate-50 rounded-2xl p-5 space-y-4 w-full text-left">
			<div class="gap-3 flex items-start">
				<div class="mt-1 text-blue-600">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg
					>
				</div>
				<p class="text-sm font-medium text-slate-700">외부 시스템 발생 즉시 폰으로 알림</p>
			</div>
			<div class="gap-3 flex items-start">
				<div class="mt-1 text-blue-600">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg
					>
				</div>
				<p class="text-sm font-medium text-slate-700">백그라운드 상태에서도 메시지 수신</p>
			</div>
		</div>
	</div>

	<div class="space-y-4 mt-auto">
		<div class="text-center">
			<p class="text-slate-400 mb-4 text-[12px]">권한을 거부하면 서비스 이용이 불가능합니다.</p>
		</div>
		<button
			class="py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 w-full transition-all active:scale-[0.98]"
		>
			지금 바로 알림 활성화
		</button>
	</div>
</div>
