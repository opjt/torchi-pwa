import { get, writable, derived, type Readable } from 'svelte/store';
import { browser } from '$app/environment';
import { fetchWhoami, type UserInfo } from '$lib/api/user';

type AuthState = UserInfo | null | undefined;

type AuthStore = Readable<AuthState> & {
	init: () => Promise<void>;
	ready: Readable<boolean>;
	logout: () => void;
	isAuthenticated: () => boolean;
	getUser: () => UserInfo | null;
	whenReady: () => Promise<void>;
};

function createAuthStore(): AuthStore {
	const { subscribe, set } = writable<AuthState>(undefined);
	const readyStore = writable(false);

	let readyResolve: (() => void) | null = null;
	const readyPromise = new Promise<void>((resolve) => {
		readyResolve = resolve;
	});

	const store: AuthStore = {
		subscribe,

		init: async () => {
			if (!browser) {
				// SSR 환경에서는 즉시 완료
				readyStore.set(true);
				readyResolve?.();
				return;
			}

			try {
				const userInfo = await fetchWhoami();
				set(userInfo);
			} catch (error) {
				console.error('Auth init failed:', error);
				set(null);
			} finally {
				readyStore.set(true);
				readyResolve?.();
			}
		},

		ready: {
			subscribe: readyStore.subscribe
		},

		isAuthenticated: () => {
			const state = get({ subscribe });
			return state !== null && state !== undefined;
		},

		getUser: () => {
			const state = get({ subscribe });
			return state !== null && state !== undefined ? state : null;
		},

		whenReady: () => readyPromise,

		logout: () => {
			set(null);
		}
	};

	return store;
}

export const auth = createAuthStore();

// 편의를 위한 derived stores
export const isAuthenticated = derived(auth, ($auth) => {
	return $auth !== null && $auth !== undefined;
});
