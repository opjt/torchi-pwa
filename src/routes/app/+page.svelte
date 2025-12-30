<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import { fade, slide } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { ChevronDown, Server, Settings, X } from 'lucide-svelte';

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
	let showUnreadOnly = true; // 기본값을 true로 변경
	let isFilterOpen = false;

	$: filteredList = notifications
		.filter((n) => (selectedServiceId === 'ALL' ? true : n.serviceId === selectedServiceId))
		.filter((n) => (showUnreadOnly ? !n.isRead : true));

	$: currentFilterName =
		selectedServiceId === 'ALL'
			? '모든 서비스'
			: myServices.find((s) => s.id === selectedServiceId)?.name || 'Unknown';

	$: unreadCount = notifications.filter((n) => !n.isRead).length;

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

	// 알림 읽음 처리 핸들러
	function markAsRead(id: number) {
		notifications = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
	}

	// 액션 버튼 클릭 핸들러 (예시)
	function handleAction(notiId: number, actionType: string) {
		console.log(`Notification ${notiId}: Action '${actionType}' clicked`);
		// 실제 로직: API 호출 후 성공 시 알림 읽음 처리
		markAsRead(notiId);
	}
</script>

<div class="bg-base-100 font-sans text-base-content flex min-h-screen flex-col">
	<header
		class="top-0 border-base-content/10 bg-base-100/90 px-6 py-6 backdrop-blur-md sticky z-30 flex items-center justify-between border-b"
	>
		<div>
			<h1 class="text-xl font-black tracking-tight">OhP</h1>
			<p class="font-mono text-[10px] opacity-40">{$auth?.email || 'Guest'}</p>
		</div>

		<div>
			<!-- <button
				title="setting "
				onclick={() => goto('/app/services')}
				class="btn btn-square btn-ghost btn-sm rounded-xl opacity-40 transition-all hover:opacity-100"
			>
				<Server />
			</button> -->
			<button
				title="setting "
				onclick={() => goto('/app/setting')}
				class="btn btn-square rounded-xl btn-ghost btn-sm opacity-40 transition-all hover:opacity-100"
			>
				<Settings />
			</button>
		</div>
	</header>

	<main class="px-4 relative flex-1">
		<div class="top-20 py-2 sticky z-20">
			<div class="gap-2 flex items-center">
				<!-- 서비스 필터 -->
				<div class="relative inline-block">
					<button
						onclick={toggleFilter}
						class="btn h-10 gap-2 rounded-sm border-base-content/10 bg-base-100 pr-3 pl-4 shadow-xs btn-sm hover:border-primary hover:bg-base-100 flex items-center border transition-all"
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
							class="top-12 left-0 w-56 gap-1 rounded-2xl border-white/10 bg-base-100/95 p-1 shadow-xl backdrop-blur-xl absolute flex flex-col overflow-hidden border"
						>
							<button
								onclick={() => selectFilter('ALL')}
								class="rounded-xl px-4 py-3 text-xs font-bold hover:bg-white/5 flex items-center justify-between text-left transition-colors {selectedServiceId ===
								'ALL'
									? 'bg-primary/5 text-primary'
									: 'opacity-60'}"
							>
								모든 서비스
								{#if selectedServiceId === 'ALL'}
									<span class="h-1.5 w-1.5 bg-primary rounded-full"></span>
								{/if}
							</button>
							<div class="mx-2 my-1 bg-white/5 h-px"></div>
							{#each myServices as svc}
								<button
									onclick={() => selectFilter(svc.id)}
									class="rounded-xl px-4 py-3 text-xs font-bold hover:bg-base-content/5 flex items-center justify-between text-left transition-colors {selectedServiceId ===
									svc.id
										? 'bg-primary/5 text-primary'
										: 'opacity-60'}"
								>
									{svc.name}
									{#if selectedServiceId === svc.id}
										<span class="h-1.5 w-1.5 bg-primary rounded-full"></span>
									{/if}
								</button>
							{/each}
						</div>
						<button
							title="close"
							class="inset-0 fixed z-[-1]"
							onclick={() => (isFilterOpen = false)}
						></button>
					{/if}
				</div>

				<!-- 전체보기 필터 토글 -->
				<button
					onclick={() => (showUnreadOnly = !showUnreadOnly)}
					class="btn h-10 gap-2 rounded-sm border-base-content/10 bg-base-100 px-4 shadow-xs btn-sm hover:border-primary hover:bg-base-100 flex items-center transition-all {showUnreadOnly
						? 'border-primary '
						: ''}"
				>
					<span class="text-xs font-bold {showUnreadOnly ? 'text-primary' : 'opacity-60'}">
						안읽음
					</span>
					{#if unreadCount > 0}
						<span
							class="bg-primary text-primary-content px-2 py-0.5 font-bold rounded-full text-[10px]"
						>
							{unreadCount}
						</span>
					{/if}
				</button>
			</div>
		</div>

		<div class="space-y-3 pb-20">
			{#each filteredList as noti (noti.id)}
				<div transition:slide={{ duration: 200, axis: 'y' }}>
					<div
						class="group/card rounded-3xl px-5 py-4 relative border transition-all
						{noti.isRead
							? 'bg-base-content/2 hover:bg-base-content/3 border-transparent opacity-70'
							: 'bg-primary/12 hover:border-primary/30 hover:bg-primary/9 shadow-sm border-base-content/10'}"
					>
						<div class="mb-2 flex items-center justify-between">
							<div class="gap-2 flex items-center">
								<div
									class="h-1.5 w-1.5 rounded-full {noti.isRead
										? 'bg-base-content/15'
										: 'animate-pulse bg-primary shadow-sm shadow-primary/50'}"
								></div>
								<span
									class="font-bold text-[10px] {noti.isRead
										? 'opacity-40'
										: 'opacity-70'} {getServiceInfo(noti.serviceId).color}"
								>
									{getServiceInfo(noti.serviceId).name}
								</span>
							</div>

							<div class="gap-3 flex items-center">
								<span class="font-mono text-[10px] {noti.isRead ? 'opacity-20' : 'opacity-35'}"
									>{noti.timestamp}</span
								>
								<button
									onclick={() => markAsRead(noti.id)}
									class="p-1.5 transition-all hover:opacity-100 active:scale-90 {noti.isRead
										? 'cursor-default opacity-20'
										: 'hover:text-primary opacity-50'}"
									title={noti.isRead ? '읽음' : '읽음 처리'}
									disabled={noti.isRead}
								>
									<X size={18} strokeWidth={2.5} />
								</button>
							</div>
						</div>

						<p
							class="pl-3.5 leading-relaxed font-medium border-l text-[14px] whitespace-pre-wrap
							{noti.isRead
								? 'border-base-content/5 text-base-content/60'
								: 'border-primary/30 text-base-content/95'}"
						>
							{noti.body}
						</p>

						{#if noti.actions && noti.actions.length > 0}
							<div class="mt-4 gap-2 pl-3.5 flex">
								{#each noti.actions as action}
									<button
										onclick={() => handleAction(noti.id, action.type)}
										class="btn h-9 rounded-xl px-4 text-xs font-bold btn-sm border-none transition-transform active:scale-95
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
			<div class="h-100"></div>
		</div>
	</main>
</div>
