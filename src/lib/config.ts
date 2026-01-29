import * as staticEnv from '$env/static/public';
import { debugLog } from './pkg/util';

// 전역 타입 선언
declare global {
	interface Window {
		__APP_CONFIG__: {
			API_URL: string;
			VAPID_KEY: string;
			GITHUB_CLIENT_ID: string;
		};
	}
}

function getConfig() {
	// 브라우저 환경 - 런타임 설정(window) 우선
	if (typeof window !== 'undefined' && window.__APP_CONFIG__) {
		return {
			apiUrl: window.__APP_CONFIG__.API_URL,
			vapidKey: window.__APP_CONFIG__.VAPID_KEY,
			githubClientId: window.__APP_CONFIG__.GITHUB_CLIENT_ID,
		};
	}

	return {
		apiUrl: staticEnv.PUBLIC_API_URL || '',
		vapidKey: staticEnv.PUBLIC_VAPID_KEY || '',
		githubClientId: staticEnv.PUBLIC_GITHUB_CLIENT_ID || '',
	};
}

export const config = getConfig();

export const PUBLIC_VAPID_KEY = config.vapidKey;
export const PUBLIC_API_URL = config.apiUrl;
export const PUBLIC_GITHUB_CLIENT_ID = config.githubClientId;

debugLog('앱 설정:', config);
