<script lang="ts">
	import { goto } from '$app/navigation';
	import { fetchEndpoints, type Endpoint } from '$lib/api/endpoints';
	import {
		deleteNotification,
		getNotifications,
		markAsReadUntil,
		transformNotification,
		type DisplayNotification
	} from '$lib/api/notifications';
	import { debugLog } from '$lib/pkg/util';
	import { auth } from '$lib/client/auth/auth';
	import { BellOff, ChevronDown, Settings, X } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	// --- 상태 관리 ---
	let notifications = $state<DisplayNotification[]>([]);
	let nextCursor = $state<string | null>(null);
	let hasMore = $state(false);
	let loading = $state(false);
	let isFilterOpen = $state(false);
	let selectedServiceId = $state<string | 'ALL'>('ALL');

	// 관찰할 하단 요소
	let observerTarget = $state<HTMLElement | null>(null);

	// 엔드포인트 이름 목록 저장
	let endpoints = $state<Endpoint[]>([]);

	// 필터링된 리스트
	let filteredList = $derived(notifications);

	// 💡 선택된 서비스의 "이름"을 찾기 위한 derived
	let currentFilterName = $derived.by(() => {
		if (selectedServiceId === 'ALL') return '모든 서비스';
		return endpoints.find((e) => e.id === selectedServiceId)?.name || '알 수 없는 서비스';
	});

	async function loadEndpoints() {
		try {
			endpoints = await fetchEndpoints();
		} catch (e) {
			console.error('Failed to fetch endpoints:', e);
		} finally {
		}
	}

	// 데이터 로딩 함수
	async function loadNotifications(isFirst = false) {
		if (loading || (!isFirst && !hasMore)) {
			debugLog('Skip loading', { loading, hasMore, isFirst });
			return;
		}

		loading = true;
		debugLog('Start loading', { isFirst, nextCursor });
		try {
			const res = await getNotifications(
				isFirst ? undefined : (nextCursor ?? undefined),
				selectedServiceId
			);
			const newItems = res.items.map(transformNotification);

			if (isFirst) {
				notifications = newItems;
			} else {
				notifications = [...notifications, ...newItems];
			}

			nextCursor = res.next_cursor;
			hasMore = res.has_more;
			if (newItems.length > 0) {
				const lastIdOfBatch = newItems[newItems.length - 1].id;
				await markAsReadUntil(lastIdOfBatch, selectedServiceId);
			}
			debugLog('Load success', { itemsCount: newItems.length, hasMore });
		} catch (e) {
			console.error('Failed:', e);
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (!observerTarget) {
			debugLog('Target element not found yet');
			return;
		}

		debugLog('Setting up IntersectionObserver');
		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				debugLog('Observer Triggered', {
					isIntersecting: entry.isIntersecting, // 관찰영역에 있는지
					hasMore,
					loading
				});

				if (entry.isIntersecting && hasMore && !loading) {
					debugLog('Condition met! Loading more...');
					loadNotifications();
				}
			},
			{
				threshold: 0.1,
				rootMargin: '100px' // 사용자가 바닥에 닿기 100px 전에 미리 로딩 시작
			}
		);

		observer.observe(observerTarget);

		// 클린업: 요소가 사라지면 자동으로 연결 해제
		return () => {
			debugLog('Disconnecting observer');
			observer.disconnect();
		};
	});

	onMount(async () => {
		await Promise.all([loadNotifications(true), loadEndpoints()]);
	});

	function toggleFilter() {
		isFilterOpen = !isFilterOpen;
	}
	function selectFilter(id: string | 'ALL') {
		selectedServiceId = id;
		isFilterOpen = false;

		// 필터가 바뀌면 리스트를 초기화하고 첫 페이지부터 다시 로드
		nextCursor = null;
		hasMore = true;
		loadNotifications(true);
	}
	async function handleDelete(id: string) {
		try {
			await deleteNotification(id);
			notifications = notifications.filter((n) => n.id !== id);
		} catch (e) {
			console.error(e);
		}
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
							class="top-12 left-0 w-56 gap-1 rounded-sm border-white/10 bg-base-100/95 p-1 shadow-xl backdrop-blur-xl absolute flex flex-col overflow-hidden border"
						>
							<button
								onclick={() => selectFilter('ALL')}
								class="rounded-sm px-4 py-3 text-xs font-bold hover:bg-white/5 flex items-center justify-between text-left transition-colors {selectedServiceId ===
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
							{#each endpoints as enp}
								<button
									onclick={() => selectFilter(enp.id)}
									class="rounded-sm px-4 py-3 text-xs font-bold hover:bg-base-content/5 flex items-center justify-between text-left transition-colors {selectedServiceId ===
									enp.name
										? 'bg-primary/5 text-primary'
										: 'opacity-60'}"
								>
									{enp.name}
									{#if selectedServiceId === enp.id}
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
				<!-- <button
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
				</button> -->
			</div>
		</div>

		<div class="space-y-3 pb-20">
			{#each filteredList as noti (noti.id)}
				<div transition:slide={{ duration: 200, axis: 'y' }}>
					<div
						class="group/card rounded-xl px-5 py-4 relative border transition-all
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
								<span class="font-bold text-xs {noti.isRead ? 'opacity-40' : ''} ">
									{noti.endpointName}
								</span>
							</div>

							<div class="gap-3 flex items-center">
								<span class="text-xs opacity-30">
									{#if noti.isMute}
										<BellOff size={14} />
									{/if}
								</span>
								<span class="font-mono text-xs {noti.isRead ? 'opacity-20' : 'opacity-35'}"
									>{noti.timestamp}</span
								>
								<button
									onclick={() => handleDelete(noti.id)}
									class="p-1.5 transition-all hover:opacity-100 active:scale-90 {noti.isRead
										? 'cursor-default opacity-20'
										: 'hover:text-primary opacity-50'}"
									title="삭제"
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

						<!-- {#if noti.actions && noti.actions.length > 0}
							<div class="mt-4 gap-2 pl-3.5 flex">
								{#each noti.actions as action}
									<button
										onclick={() => handleAction(noti.id, action.type)}
										class="btn rounded-xl px-4 text-xs font-bold btn-sm transition-transform active:scale-95
                                        {action.type === 'primary'
											? 'btn-primary hover:bg-primary/90'
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
						{/if} -->
					</div>
				</div>
			{:else}
				<div class="py-24 text-center opacity-30 flex flex-col items-center">
					<p class="text-xs font-mono">NO_NOTIFICATIONS</p>
				</div>
			{/each}
			<div class="flex items-center justify-center" bind:this={observerTarget}>
				{#if loading}
					<span class="loading loading-spinner loading-lg"></span>
				{/if}
			</div>
		</div>
	</main>
</div>
