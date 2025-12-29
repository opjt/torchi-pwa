<script lang="ts">
	import { goto } from '$app/navigation';
	import { PUBLIC_API_URL } from '$lib/config';
	import { fetchEndpoints, deleteEndpoint, type Endpoint } from '$lib/api/endpoints';
	import { logout } from '$lib/client/auth/lifecycle';
	import { push } from '$lib/client/pushManager.svelte';
	import { toast } from 'svelte-sonner';
	import { api } from '$lib/pkg/fetch';
	import { auth } from '$lib/stores/auth';

	import { Bell, BellOff, ChevronLeft, Copy, Plus, Trash2 } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	// Svelte 5 $state
	let endpoints = $state<Endpoint[]>([]);

	let isAdding = $state(false);
	let newServiceName = $state('');
	let copiedId: string | null = $state(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	let isToggling = $state(false);

	onMount(async () => {
		await getEndpoints();
	});
	// push.statusMsg를 감시하는 이펙트 추가
	$effect(() => {
		const event = push.consumeEvent();
		if (!event) return;

		switch (event.type) {
			case 'subscribed':
				toast.success('푸시 알림이 활성화되었습니다');
				break;
			case 'unsubscribed':
				toast.success('푸시 알림이 비활성화되었습니다');
				break;
			case 'permission-denied':
				toast.error('알림 권한이 거부되었습니다');
				break;
			case 'subscribe-failed':
				toast.error('구독 실패', { description: event.error });
				break;
		}
	});

	async function getEndpoints() {
		try {
			endpoints = await fetchEndpoints();
		} catch {
			error = 'Failed to fetch endpoints';
		} finally {
			loading = false;
		}
	}

	// 서비스 추가 핸들러
	async function addService() {
		if (!newServiceName.trim()) return;

		try {
			await api<void>(`${PUBLIC_API_URL}/endpoints`, {
				method: 'POST',
				body: {
					serviceName: newServiceName.trim()
				}
			});
		} catch (e) {
			console.error(e);
		}
		loading = true;
		await getEndpoints();
		newServiceName = '';
		isAdding = false;
	}

	// 서비스 삭제 핸들러
	async function deleteService(id: string) {
		if (!confirm('정말 이 엔드포인트를 삭제하시겠습니까?')) return;
		try {
			await deleteEndpoint(id);
		} catch (e) {
			console.error(e);
		}

		await getEndpoints();
	}

	// 서비스 토글 핸들러
	function toggleServiceActive(id: string) {
		return;
		// TODO: 백엔드 API 호출 (알림 수신 여부 변경)
		const idx = endpoints.findIndex((s) => s.id === id);
		if (idx !== -1) {
			endpoints[idx].active = !endpoints[idx].active;
		}
	}

	async function copyEndpoint(token: string, id: string) {
		const url = `${PUBLIC_API_URL}/api/push/${token}`;
		const curlCmd = `curl -X POST "${url}" -d "msg=Hello!"`;

		await navigator.clipboard.writeText(curlCmd);
		copiedId = id;
		setTimeout(() => (copiedId = null), 1000);
	}

	// 글로벌 푸시 토글
	async function handlePushToggle(e: Event) {
		// 1. HTML 기본 동작(체크박스 즉시 변경)을 막습니다.
		e.preventDefault();

		// 2. 이미 작업 중이면 중복 실행 방지
		if (isToggling) return;

		isToggling = true;
		try {
			// 3. 현재 상태의 반대 작업을 수행
			if (push.isSubscribed) {
				await push.handleUnsubscribe();
			} else {
				await push.handleSubscribe();
			}
			// 성공하면 push.isSubscribed가 내부에서 바뀌고,
			// UI는 checked={push.isSubscribed}에 의해 자동으로 업데이트됩니다.
		} finally {
			isToggling = false;
		}
	}
</script>

<div class="bg-base-100 font-sans text-base-content flex min-h-screen flex-col">
	<header
		class="top-0 bg-base-100/80 px-6 py-6 backdrop-blur-md sticky z-20 flex items-center justify-between"
	>
		<div class="flex items-center">
			<button
				onclick={() => goto('/app')}
				class="mr-2 -ml-2 p-2 opacity-50 transition-opacity hover:opacity-100"
				title="home"
			>
				<ChevronLeft />
			</button>
			<h1 class="text-xl font-black tracking-tight">설정</h1>
		</div>
	</header>

	<main class="space-y-10 px-6 pt-4 pb-10 flex-1 overflow-x-hidden">
		<section>
			<h2 class="mb-4 font-bold text-[11px] tracking-[0.2em] uppercase opacity-40">Account</h2>
			<div
				class="gap-4 rounded-3xl border-white/5 bg-neutral p-5 text-neutral-content shadow-sm flex items-center border"
			>
				<div
					class="h-14 w-14 rounded-2xl border-white/10 bg-base-100/10 text-xl font-black flex items-center justify-center border italic"
				>
					OHP
				</div>
				<div>
					<p class="font-bold text-[15px]">사용자님</p>
					<p class="text-xs opacity-60">{$auth?.email ?? ''}</p>
					<div class="mt-1 badge badge-sm font-bold badge-primary text-[10px]">FREE PLAN</div>
				</div>
			</div>
		</section>

		<section>
			<h2 class="mb-4 font-bold text-[11px] tracking-[0.2em] uppercase opacity-40">
				Global Settings
			</h2>
			<div class="gap-1 rounded-3xl border-base-content/5 bg-base-200/50 p-2 flex flex-col border">
				{#if push.isLoading}
					<div class="animate-pulse p-4 flex items-center justify-between">
						<div class="space-y-2">
							<div class="h-4 w-24 rounded bg-base-content/10"></div>
							<div class="h-3 w-40 rounded bg-base-content/5"></div>
						</div>
						<div class="h-6 w-12 bg-base-content/10 rounded-full"></div>
					</div>
				{:else}
					<label
						class="rounded-2xl p-4 hover:bg-base-200 flex cursor-pointer items-center justify-between transition-colors"
					>
						<div>
							<p class="text-sm font-bold">마스터 푸시 알림</p>
							<p class="text-[12px] opacity-50">모든 서비스의 알림을 제어합니다</p>
						</div>
						<div class="gap-3 flex items-center">
							{#if isToggling}
								<span class="loading loading-xs loading-spinner text-primary"></span>
							{/if}

							<input
								type="checkbox"
								class="toggle toggle-primary"
								checked={push.isSubscribed}
								onclick={handlePushToggle}
								disabled={isToggling || push.permissionState === 'denied'}
							/>
						</div>
					</label>
					{#if push.isSubscribed}
						<button
							onclick={() => console.log('테스트 알림 발송')}
							class="group rounded-2xl p-4 hover:bg-base-200 flex items-center justify-between text-left transition-all active:scale-[0.98]"
						>
							<div>
								<p class="text-sm font-bold group-hover:text-primary transition-colors">
									테스트 알림 발송
								</p>
								<p class="text-[12px] opacity-50">현재 기기로 테스트 푸시를 즉시 보냅니다</p>
							</div>
							<div class="text-primary opacity-50 transition-opacity group-hover:opacity-100">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
								</svg>
							</div>
						</button>
					{/if}
				{/if}
			</div>
		</section>

		<section>
			<div class="mb-4 flex items-center justify-between">
				<h2 class="font-bold text-[11px] tracking-[0.2em] uppercase opacity-40">My Endpoints</h2>
				<button
					onclick={() => (isAdding = !isAdding)}
					class="btn btn-circle btn-ghost btn-xs hover:bg-base-200 opacity-60 hover:opacity-100"
				>
					<Plus
						size={16}
						class={isAdding ? 'rotate-45 transition-transform' : 'transition-transform'}
					/>
				</button>
			</div>

			<div class="space-y-3">
				{#if isAdding}
					<div
						transition:slide
						class="mb-4 rounded-3xl border-primary/20 bg-base-200/80 p-4 border"
					>
						<p class="mb-2 ml-1 text-xs font-bold">새 서비스 이름</p>
						<div class="gap-2 flex">
							<input
								type="text"
								bind:value={newServiceName}
								placeholder="ex) 결제 서버 모니터링"
								class="input-bordered input input-sm rounded-xl w-full focus:outline-none"
								onkeydown={(e) => e.key === 'Enter' && addService()}
							/>
							<button onclick={addService} class="btn rounded-xl btn-soft btn-sm btn-primary"
								>등록</button
							>
						</div>
					</div>
				{/if}

				{#if endpoints.length === 0}
					<div
						class="rounded-3xl border-base-content/10 bg-base-200/30 py-8 text-xs border border-dashed text-center opacity-40"
					>
						등록된 서비스가 없습니다.<br />+ 버튼을 눌러 추가해보세요.
					</div>
				{/if}

				{#each endpoints as endpoint (endpoint.id)}
					<div
						class="group rounded-3xl border-base-content/5 bg-base-200/40 p-4 hover:bg-base-200/70 relative overflow-hidden border transition-all"
					>
						<div class="mb-3 flex items-center justify-between">
							<div class="gap-3 flex items-center">
								<div
									class="h-2 w-2 rounded-full {endpoint.active
										? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]'
										: 'bg-base-content/20'}"
								></div>
								<span class="text-sm font-bold {endpoint.active ? '' : 'opacity-50'}"
									>{endpoint.name}</span
								>
							</div>
							<div class="gap-1 flex items-center">
								<button
									onclick={() => toggleServiceActive(endpoint.id)}
									class="btn btn-square btn-ghost btn-xs {endpoint.active
										? 'text-success'
										: 'text-base-content/30'}"
									title={endpoint.active ? 'Active' : 'Paused'}
								>
									{#if endpoint.active}
										<Bell size={14} />
									{:else}
										<BellOff size={14} />
									{/if}
								</button>
								<button
									onclick={() => deleteService(endpoint.token)}
									class="btn btn-square text-error/50 btn-ghost btn-xs hover:bg-error/10 hover:text-error"
									title="Delete"
								>
									<Trash2 size={14} />
								</button>
							</div>
						</div>

						<div class="relative">
							<input
								type="text"
								readonly
								value="{PUBLIC_API_URL}/api/push/{endpoint.token}"
								class="rounded-xl border-base-content/5 bg-base-100 py-2.5 pr-10 pl-3 font-mono w-full truncate border text-[10px] opacity-70 transition-opacity focus:opacity-100 focus:outline-none"
							/>
							<button
								onclick={() => copyEndpoint(endpoint.token, endpoint.id)}
								class="btn top-1 right-1 btn-square rounded-lg btn-ghost btn-xs hover:bg-primary/10 hover:text-primary absolute"
							>
								{#if copiedId === endpoint.id}
									<span class="font-bold text-success text-[9px]">V</span>
								{:else}
									<Copy size={12} />
								{/if}
							</button>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<section class="space-y-6 pt-6">
			<button
				onclick={logout}
				class="btn h-14 rounded-2xl font-bold btn-outline btn-error w-full border-2 opacity-60 transition-all hover:opacity-100"
			>
				로그아웃
			</button>
			<div class="space-y-1 text-center">
				<p class="font-mono text-[10px] opacity-30">v1.0.0-beta.build.02</p>
			</div>
		</section>
	</main>
</div>
