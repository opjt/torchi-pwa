<script lang="ts">
	import '$src/app.css';
	import { auth } from '$lib/stores/auth';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';

	// 1. 사용자가 등록한 서비스 목록 (설정 페이지에서 등록한 것들)
	const myServices = [
		{ id: 'svc_1', name: '내 서버 모니터링', color: 'badge-primary' },
		{ id: 'svc_2', name: '당근 키워드 알림', color: 'badge-secondary' },
		{ id: 'svc_3', name: '배포 파이프라인', color: 'badge-accent' }
	];

	// 2. 수신된 알림 데이터 (curl로 본문만 날아온 상태)
	let notifications = [
		{
			id: 1,
			serviceId: 'svc_1',
			body: 'CPU 사용량이 90%를 초과했습니다. 확인이 필요합니다.',
			timestamp: '방금 전',
			isRead: false
		},
		{
			id: 2,
			serviceId: 'svc_2',
			body: '설정하신 키워드 [맥북 프로] 관련 새 글이 올라왔습니다.',
			timestamp: '10분 전',
			isRead: true
		},
		{
			id: 3,
			serviceId: 'svc_3',
			body: 'Frontend 배포가 성공적으로 완료되었습니다. (v1.2.0)',
			timestamp: '1시간 전',
			isRead: true
		},
		{
			id: 4,
			serviceId: 'svc_1',
			body: '메모리 부족으로 프로세스가 재시작되었습니다.',
			timestamp: '3시간 전',
			isRead: true
		}
	];

	// 필터 상태 관리
	let selectedServiceId: string | 'ALL' = 'ALL';

	// 선택된 필터에 따라 알림 목록 정제
	$: filteredList =
		selectedServiceId === 'ALL'
			? notifications
			: notifications.filter((n) => n.serviceId === selectedServiceId);

	// 서비스 ID로 서비스 정보(이름, 색상) 찾기 헬퍼
	function getServiceInfo(id: string) {
		return myServices.find((s) => s.id === id) || { name: 'Unknown', color: 'badge-ghost' };
	}
</script>

<div class="bg-base-100 text-base-content font-sans flex min-h-screen flex-col">
	<header
		class="px-6 py-6 top-0 bg-base-100/80 backdrop-blur-md sticky z-20 flex items-center justify-between"
	>
		<div>
			<h1 class="text-xl font-black tracking-tight">대시보드</h1>
			<p class="font-mono text-[10px] opacity-40">{$auth?.email || 'Guest'} Workspace</p>
		</div>

		<button
			title="setting"
			onclick={() => goto('/p/setting')}
			class="btn btn-square btn-ghost btn-sm rounded-xl hover:bg-base-content/5 opacity-50 transition-all hover:opacity-100"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><circle cx="12" cy="12" r="3" /><path
					d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
				/></svg
			>
		</button>
	</header>

	<main class="px-6 pb-10 space-y-8 flex-1">
		<section>
			<div class="gap-2 no-scrollbar pb-2 flex overflow-x-auto">
				<button
					onclick={() => (selectedServiceId = 'ALL')}
					class="btn btn-sm font-bold rounded-full border-none transition-all
                    {selectedServiceId === 'ALL'
						? 'bg-base-content text-base-100'
						: 'bg-base-200 text-base-content/50'}"
				>
					전체
				</button>
				{#each myServices as svc}
					<button
						onclick={() => (selectedServiceId = svc.id)}
						class="btn btn-sm font-bold rounded-full border-none whitespace-nowrap transition-all
                        {selectedServiceId === svc.id
							? 'bg-base-content text-base-100'
							: 'bg-base-200 text-base-content/50'}"
					>
						{svc.name}
					</button>
				{/each}
			</div>
		</section>

		<section class="space-y-4">
			{#each filteredList as noti (noti.id)}
				<div in:fade={{ duration: 200 }} class="group relative">
					<div
						class="bg-neutral text-neutral-content p-5 rounded-3xl shadow-sm border-white/5 border transition-transform active:scale-[0.98]"
					>
						<div class="mb-2 flex items-start justify-between">
							<div
								class="badge {getServiceInfo(noti.serviceId)
									.color} badge-sm font-bold py-2 px-3 bg-opacity-20 border-none text-[10px] text-current"
							>
								{getServiceInfo(noti.serviceId).name}
							</div>

							{#if !noti.isRead}
								<div class="w-2 h-2 bg-error rounded-full shadow-[0_0_5px_rgba(255,0,0,0.5)]"></div>
							{/if}
						</div>

						<p class="leading-relaxed font-medium text-white/90 text-[15px] whitespace-pre-wrap">
							{noti.body}
						</p>

						<div class="mt-3 flex items-center justify-between">
							<span class="font-mono tracking-tighter text-[11px] opacity-40">
								{noti.timestamp}
							</span>
						</div>
					</div>
				</div>
			{:else}
				<div class="py-20 text-center opacity-30 flex flex-col items-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="48"
						height="48"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="mb-4"
						><path d="M10.268 21a2 2 0 0 0 3.464 0" /><path
							d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"
						/></svg
					>
					<p class="text-sm">도착한 알림이 없습니다</p>
				</div>
			{/each}
		</section>
	</main>
</div>

<style>
	/* 가로 스크롤바 숨김 (깔끔한 UI용) */
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
