<script lang="ts">
	import { goto } from '$app/navigation';
	import { PUBLIC_SERVER_URL } from '$env/static/public';
	import { fetchEndpoints, deleteEndpoint, type Endpoint } from '$lib/api/endpoints';
	import { logout } from '$lib/client/auth/lifecycle';
	import { push } from '$lib/client/pushManager.svelte';
	import { api } from '$lib/pkg/fetch';
	import { auth } from '$lib/stores/auth';
	import '$src/app.css';
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

	onMount(async () => {
		await getEndpoints();
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
			await api<void>(`${PUBLIC_SERVER_URL}/endpoints`, {
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
		if (!confirm('정말 이 서비스를 삭제하시겠습니까?')) return;
		try {
			await deleteEndpoint(id);
		} catch (e) {
			console.error(e);
		}

		await getEndpoints();
	}

	// 서비스 토글 핸들러
	function toggleServiceActive(id: string) {
		// TODO: 백엔드 API 호출 (알림 수신 여부 변경)
		const idx = endpoints.findIndex((s) => s.id === id);
		if (idx !== -1) {
			endpoints[idx].active = !endpoints[idx].active;
		}
	}

	async function copyEndpoint(token: string, id: string) {
		const url = `https://pook.io/api/push/${token}`;
		const curlCmd = `curl -X POST "${url}" -d "msg=Hello!"`;

		await navigator.clipboard.writeText(curlCmd);
		copiedId = id;
		setTimeout(() => (copiedId = null), 2000);
	}

	// 글로벌 푸시 토글
	async function handlePushToggle(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.checked) {
			await push.handleSubscribe();
		} else {
			await push.handleUnsubscribe();
		}
	}
</script>

<div class="bg-base-100 text-base-content font-sans flex min-h-screen flex-col">
	<header
		class="px-6 py-6 top-0 bg-base-100/80 backdrop-blur-md sticky z-20 flex items-center justify-between"
	>
		<div class="flex items-center">
			<button
				onclick={() => goto('/p')}
				class="p-2 -ml-2 mr-2 opacity-50 transition-opacity hover:opacity-100"
				title="home"
			>
				<ChevronLeft />
			</button>
			<h1 class="text-xl font-black tracking-tight">설정</h1>
		</div>
	</header>

	<main class="px-6 pb-10 pt-4 space-y-10 flex-1 overflow-x-hidden">
		<section>
			<h2 class="font-bold mb-4 text-[11px] tracking-[0.2em] uppercase opacity-40">Account</h2>
			<div
				class="gap-4 bg-neutral text-neutral-content p-5 rounded-3xl shadow-sm border-white/5 flex items-center border"
			>
				<div
					class="w-14 h-14 bg-base-100/10 rounded-2xl font-black text-xl border-white/10 flex items-center justify-center border italic"
				>
					OHP
				</div>
				<div>
					<p class="font-bold text-[15px]">사용자님</p>
					<p class="text-xs opacity-60">{$auth?.email ?? ''}</p>
					<div class="badge badge-primary badge-sm mt-1 font-bold text-[10px]">FREE PLAN</div>
				</div>
			</div>
		</section>

		<section>
			<h2 class="font-bold mb-4 text-[11px] tracking-[0.2em] uppercase opacity-40">
				Global Settings
			</h2>
			<div class="bg-base-200/50 rounded-3xl p-2 border-base-content/5 gap-1 flex flex-col border">
				{#if push.isLoading}
					<div class="p-4 animate-pulse flex items-center justify-between">
						<div class="space-y-2">
							<div class="h-4 w-24 bg-base-content/10 rounded"></div>
							<div class="h-3 w-40 bg-base-content/5 rounded"></div>
						</div>
						<div class="h-6 w-12 bg-base-content/10 rounded-full"></div>
					</div>
				{:else}
					<label
						class="p-4 hover:bg-base-200 rounded-2xl flex cursor-pointer items-center justify-between transition-colors"
					>
						<div>
							<p class="text-sm font-bold">마스터 푸시 알림</p>
							<p class="text-[12px] opacity-50">모든 서비스의 알림을 제어합니다</p>
						</div>
						<input
							type="checkbox"
							class="toggle toggle-primary"
							checked={push.isSubscribed}
							onchange={handlePushToggle}
							disabled={push.permissionState === 'denied'}
						/>
					</label>
					{#if push.isSubscribed}
						<button
							onclick={() => push.testNotification()}
							class="p-4 hover:bg-base-200 rounded-2xl group flex items-center justify-between text-left transition-all active:scale-[0.98]"
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
			{#if push.statusMsg}
				<div class="px-4 mt-3">
					<p
						class="font-bold text-[11px] {push.statusType === 'error'
							? 'text-error'
							: 'text-primary'}"
					>
						{push.statusMsg}
					</p>
				</div>
			{/if}
		</section>

		<section>
			<div class="mb-4 flex items-center justify-between">
				<h2 class="font-bold text-[11px] tracking-[0.2em] uppercase opacity-40">My Endpoints</h2>
				<button
					onclick={() => (isAdding = !isAdding)}
					class="btn btn-xs btn-circle btn-ghost hover:bg-base-200 opacity-60 hover:opacity-100"
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
						class="bg-base-200/80 p-4 rounded-3xl border-primary/20 mb-4 border"
					>
						<p class="text-xs font-bold mb-2 ml-1">새 서비스 이름</p>
						<div class="gap-2 flex">
							<input
								type="text"
								bind:value={newServiceName}
								placeholder="ex) 결제 서버 모니터링"
								class="input input-sm input-bordered rounded-xl w-full focus:outline-none"
								onkeydown={(e) => e.key === 'Enter' && addService()}
							/>
							<button onclick={addService} class="btn btn-sm btn-primary rounded-xl">등록</button>
						</div>
					</div>
				{/if}

				{#if endpoints.length === 0}
					<div
						class="py-8 text-xs bg-base-200/30 rounded-3xl border-base-content/10 border border-dashed text-center opacity-40"
					>
						등록된 서비스가 없습니다.<br />+ 버튼을 눌러 추가해보세요.
					</div>
				{/if}

				{#each endpoints as endpoint (endpoint.id)}
					<div
						class="group bg-base-200/40 hover:bg-base-200/70 border-base-content/5 rounded-3xl p-4 relative overflow-hidden border transition-all"
					>
						<div class="mb-3 flex items-center justify-between">
							<div class="gap-3 flex items-center">
								<div
									class="w-2 h-2 rounded-full {endpoint.active
										? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]'
										: 'bg-base-content/20'}"
								></div>
								<span class="font-bold text-sm {endpoint.active ? '' : 'opacity-50'}"
									>{endpoint.name}</span
								>
							</div>
							<div class="gap-1 flex items-center">
								<button
									onclick={() => toggleServiceActive(endpoint.id)}
									class="btn btn-square btn-xs btn-ghost {endpoint.active
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
									class="btn btn-square btn-xs btn-ghost text-error/50 hover:bg-error/10 hover:text-error"
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
								value="https://pook.io/api/push/{endpoint.token}"
								class="bg-base-100 rounded-xl pl-3 pr-10 py-2.5 font-mono border-base-content/5 w-full truncate border text-[10px] opacity-70 transition-opacity focus:opacity-100 focus:outline-none"
							/>
							<button
								onclick={() => copyEndpoint(endpoint.token, endpoint.id)}
								class="right-1 top-1 btn btn-square btn-ghost btn-xs rounded-lg hover:bg-primary/10 hover:text-primary absolute"
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

		<section class="pt-6 space-y-6">
			<button
				onclick={logout}
				class="btn btn-outline btn-error h-14 rounded-2xl font-bold w-full border-2 opacity-60 transition-all hover:opacity-100"
			>
				로그아웃
			</button>
			<div class="space-y-1 text-center">
				<p class="font-mono text-[10px] opacity-30">v1.0.0-beta.build.02</p>
			</div>
		</section>
	</main>
</div>
