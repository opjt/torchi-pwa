// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debugLog(...args: any[]) {
	if (import.meta.env.DEV) {
		console.log('[DEBUG]', ...args);
	}
}

export function isDev() {
	return import.meta.env.DEV;
}
