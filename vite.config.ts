import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import path from 'path';

export default defineConfig({
	resolve: { alias: { $lib: path.resolve('./src/lib'), $src: path.resolve('./src') } },

	plugins: [
		tailwindcss(),
		sveltekit(),

		SvelteKitPWA({
			srcDir: './src',
			mode: 'production', // 'development' or 'production',
			strategies: 'injectManifest',
			filename: 'service-worker.ts',
			registerType: 'autoUpdate', // 새 버전 발견 시 자동 업데이트

			// Manifest 설정
			manifest: {
				name: 'OhP Notify Platform',
				short_name: 'OhP',
				description: 'Web Push Notification Platform like Gotify',
				theme_color: '#0f172a',
				background_color: '#ffffff',
				display: 'standalone',
				scope: '/app/',
				start_url: '/app',
				orientation: 'portrait',
				icons: [
					{
						src: '/logo/icon-192x192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: '/logo/icon-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable'
					}
				]
			},
			// Service Worker 설정
			injectManifest: {
				swDest: 'service-worker.js',
				// globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}']
				globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,wasm}']
			},

			// 개발 모드에서도 PWA 테스트
			devOptions: { enabled: true, type: 'module', navigateFallback: '/' }
		})
	]
});
