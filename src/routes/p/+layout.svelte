<script lang="ts">
	import { push } from '$lib/client/pushManager.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';

	onMount(async () => {
		await auth.init();
		if ($auth === null) {
			goto('/');
		}
	});

	let { children } = $props();
</script>

<div class="flex h-screen flex-col">
	{#if push.permissionState != null && push.permissionState !== 'granted'}
		<button
			type="button"
			onclick={() => push.handleSubscribe()}
			class="bg-warning text-warning-content
			px-6 py-3.5 top-0 sticky z-10 flex w-full items-center justify-between"
		>
			<div class="gap-3 flex items-center">
				<span class="h-2 w-2 relative flex">
					<span
						class="animate-ping bg-warning-content absolute inline-flex h-full w-full rounded-full opacity-75"
					></span>
					<span class="h-2 w-2 bg-warning-content relative inline-flex rounded-full"></span>
				</span>

				<p class="font-black tracking-tighter text-[11px] uppercase">
					{push.permissionState === 'denied'
						? '알림 권한이 차단됨 (브라우저 설정에서 해제 필요)'
						: '알림 권한이 필요합니다'}
				</p>

				<span class="font-bold text-[10px] underline underline-offset-2">설정하기</span>
			</div>
		</button>
	{/if}

	<div class="flex-1 overflow-y-auto">
		<div class="max-w-3xl font-sans text-base-content px-4 mx-auto flex flex-col">
			{@render children()}
		</div>
	</div>
</div>
