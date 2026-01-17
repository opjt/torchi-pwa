<script lang="ts">
	import '$src/app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from '$lib/components/ui/sonner/index';
	import { onMount, type ComponentProps } from 'svelte';

	type Position = ComponentProps<typeof Toaster>['position'];

	let position = $state<Position>('top-center');

	function updatePosition() {
		if (window.innerWidth < 768) {
			position = 'bottom-center';
		} else {
			position = 'top-center';
		}
	}

	onMount(() => {
		updatePosition(); // 초기 실행
		window.addEventListener('resize', updatePosition);
		return () => window.removeEventListener('resize', updatePosition);
	});

	let { children } = $props();

	onMount(async () => {
		// 1. 인증 초기화
		// await auth.init();
		// // 2. 서비스 워커 업데이트 감지 및 새로고침 로직
		// if ('serviceWorker' in navigator) {
		// 	let refreshing = false;
		// 	// 새로운 서비스 워커가 제어권을 가졌을 때 발생
		// 	navigator.serviceWorker.addEventListener('controllerchange', () => {
		// 		if (refreshing) return;
		// 		refreshing = true;
		// 		console.log('[SW] 새로운 서비스 워커 활성화 - 페이지 새로고침');
		// 		window.location.reload();
		// 	});
		// }
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<Toaster duration={1400} {position} />
{@render children()}
