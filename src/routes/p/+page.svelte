<script lang="ts">
	import '$src/app.css';
	import { auth } from '$lib/stores/auth';
	import { fade, slide } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { ChevronDown, Settings, X } from 'lucide-svelte';

	// 1. 서비스 목록
	const myServices = [
		{ id: 'svc_1', name: '운영 서버', color: 'text-primary' },
		{ id: 'svc_2', name: '배포 시스템', color: 'text-secondary' },
		{ id: 'svc_3', name: '결제 승인', color: 'text-accent' }
	];

	// 2. 알림 액션 타입 정의
	interface Action {
		label: string;
		type: 'primary' | 'danger' | 'neutral';
	}

	// 3. 알림 데이터 확장 (액션 포함)
	let notifications = [
		{
			id: 1,
			serviceId: 'svc_3',
			body: '새로운 결제 요청이 들어왔습니다. (₩1,250,000)\n승인하시겠습니까?',
			timestamp: '방금 전',
			isRead: false,
			// 액션 버튼 데이터
			actions: [
				{ label: '승인', type: 'primary' },
				{ label: '거절', type: 'danger' }
			] as Action[]
		},
		{
			id: 2,
			serviceId: 'svc_2',
			body: 'Frontend (v1.3.0) 배포 준비가 완료되었습니다.\n배포를 시작하려면 버튼을 누르세요.',
			timestamp: '10분 전',
			isRead: true,
			actions: [
				{ label: '지금 배포', type: 'primary' },
				{ label: '나중에', type: 'neutral' }
			] as Action[]
		},
		{
			id: 3,
			serviceId: 'svc_1',
			body: '[Warning] CPU 사용률이 95% 이상 유지되고 있습니다. 로그 확인이 필요합니다.',
			timestamp: '1시간 전',
			isRead: true
			// 액션이 없는 일반 알림
		},
		{
			id: 4,
			serviceId: 'svc_1',
			body: '[Warning] CPU 사용률이 95% 이상 유지되고 있습니다. 로그 확인이 필요합니다.\n줄바꿈 테스트',
			timestamp: '1시간 전',
			isRead: true
			// 액션이 없는 일반 알림
		}
	];

	let selectedServiceId: string | 'ALL' = 'ALL';
	let isFilterOpen = false;

	$: filteredList =
		selectedServiceId === 'ALL'
			? notifications
			: notifications.filter((n) => n.serviceId === selectedServiceId);

	$: currentFilterName =
		selectedServiceId === 'ALL'
			? '모든 서비스'
			: myServices.find((s) => s.id === selectedServiceId)?.name || 'Unknown';

	function getServiceInfo(id: string) {
		return myServices.find((s) => s.id === id) || { name: 'Unknown', color: 'text-base-content' };
	}

	function toggleFilter() {
		isFilterOpen = !isFilterOpen;
	}

	function selectFilter(id: string | 'ALL') {
		selectedServiceId = id;
		isFilterOpen = false;
	}

	// 알림 삭제 핸들러
	function removeNotification(id: number) {
		notifications = notifications.filter((n) => n.id !== id);
	}

	// 액션 버튼 클릭 핸들러 (예시)
	function handleAction(notiId: number, actionType: string) {
		console.log(`Notification ${notiId}: Action '${actionType}' clicked`);
		// 실제 로직: API 호출 후 성공 시 알림 삭제 또는 상태 업데이트
		removeNotification(notiId);
	}
</script>

<div class="bg-base-100 text-base-content font-sans flex min-h-screen flex-col">
	<header
		class="px-6 py-6 top-0 bg-base-100/90 backdrop-blur-md border-base-content/5 sticky z-30 flex items-center justify-between border-b"
	>
		<div>
			<h1 class="text-xl font-black tracking-tight">OhP</h1>
			<p class="font-mono text-[10px] opacity-40">{$auth?.email || 'Guest'}</p>
		</div>

		<button
			title="setting "
			onclick={() => goto('/p/setting')}
			class="btn btn-square btn-ghost btn-sm rounded-xl opacity-40 transition-all hover:opacity-100"
		>
			<Settings />
		</button>
	</header>

	<main class="px-4 relative flex-1">
		<div class="py-2 mb-2 top-20 sticky z-20">
			<div class="relative inline-block">
				<button
					onclick={toggleFilter}
					class="btn btn-sm h-10 pl-4 pr-3 bg-base-100 border-base-content/10 shadow-xs hover:border-primary hover:bg-base-100 gap-2 flex items-center rounded-full border transition-all"
				>
					<span class="text-xs font-bold opacity-60">Filter:</span>
					<span class="text-xs font-black text-primary">{currentFilterName}</span>
					<ChevronDown
						size={14}
						class="opacity-40 transition-transform {isFilterOpen ? 'rotate-180' : ''}"
					/>
				</button>
				{#if isFilterOpen}
					<div
						transition:slide={{ duration: 150 }}
						class="top-12 left-0 w-56 bg-base-100/95 backdrop-blur-xl border-white/10 rounded-2xl shadow-xl p-1 gap-1 absolute flex flex-col overflow-hidden border"
					>
						<button
							onclick={() => selectFilter('ALL')}
							class="px-4 py-3 rounded-xl hover:bg-white/5 text-xs font-bold flex items-center justify-between text-left transition-colors {selectedServiceId ===
							'ALL'
								? 'text-primary bg-primary/5'
								: 'opacity-60'}"
						>
							모든 서비스
							{#if selectedServiceId === 'ALL'}
								<span class="w-1.5 h-1.5 bg-primary rounded-full"></span>
							{/if}
						</button>
						<div class="bg-white/5 mx-2 my-1 h-px"></div>
						{#each myServices as svc}
							<button
								onclick={() => selectFilter(svc.id)}
								class="px-4 py-3 rounded-xl hover:bg-white/5 text-xs font-bold flex items-center justify-between text-left transition-colors {selectedServiceId ===
								svc.id
									? 'text-primary bg-primary/5'
									: 'opacity-60'}"
							>
								{svc.name}
								{#if selectedServiceId === svc.id}
									<span class="w-1.5 h-1.5 bg-primary rounded-full"></span>
								{/if}
							</button>
						{/each}
					</div>
					<button title="close" class="inset-0 fixed z-[-1]" onclick={() => (isFilterOpen = false)}
					></button>
				{/if}
			</div>
		</div>

		<div class="space-y-3 pb-20">
			{#each filteredList as noti (noti.id)}
				<div transition:slide={{ duration: 200, axis: 'y' }}>
					<div
						class="group/card px-5 py-4 rounded-3xl bg-base-content/3 hover:border-base-content/5 hover:bg-base-content/5 relative border border-transparent transition-all"
					>
						<div class="mb-2 flex items-center justify-between">
							<div class="gap-2 flex items-center">
								<div
									class="w-1.5 h-1.5 rounded-full {noti.isRead
										? 'bg-base-content/20'
										: 'bg-primary animate-pulse'}"
								></div>
								<span
									class="font-bold text-[10px] opacity-60 {getServiceInfo(noti.serviceId).color}"
								>
									{getServiceInfo(noti.serviceId).name}
								</span>
							</div>

							<div class="gap-3 flex items-center">
								<span class="font-mono text-[10px] opacity-30">{noti.timestamp}</span>
								<button
									onclick={() => removeNotification(noti.id)}
									class="p-1 -mr-2 opacity-0 transition-opacity group-hover/card:opacity-40 hover:opacity-100!"
									title="알림 삭제"
								>
									<X size={16} />
								</button>
							</div>
						</div>

						<p
							class="leading-relaxed font-medium text-base-content/90 pl-3.5 border-base-content/10 border-l text-[14px] whitespace-pre-wrap"
						>
							{noti.body}
						</p>

						{#if noti.actions && noti.actions.length > 0}
							<div class="mt-4 pl-3.5 gap-2 flex">
								{#each noti.actions as action}
									<button
										onclick={() => handleAction(noti.id, action.type)}
										class="btn btn-sm h-9 px-4 rounded-xl font-bold text-xs border-none transition-transform active:scale-95
                                        {action.type === 'primary'
											? 'bg-primary text-primary-content hover:bg-primary/90'
											: ''}
                                        {action.type === 'danger'
											? 'bg-error/10 text-error hover:bg-error/20'
											: ''}
                                        {action.type === 'neutral'
											? 'bg-base-content/5 text-base-content/70 hover:bg-base-content/10'
											: ''}"
									>
										{action.label}
									</button>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			{:else}
				<div class="py-24 text-center opacity-30 flex flex-col items-center">
					<p class="text-xs font-mono">NO_NOTIFICATIONS</p>
				</div>
			{/each}
		</div>
	</main>
</div>
