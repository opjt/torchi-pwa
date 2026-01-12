import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { PUBLIC_API_URL } from '$lib/config';
import { api } from '$lib/pkg/fetch';
import { auth } from '$lib/stores/auth';

export async function logout() {
	await api<void>(`${PUBLIC_API_URL}/auth/logout`);
	auth.logout();
}

export async function fakeLogin() {
	await api<void>(`${PUBLIC_API_URL}/auth/fake/login`);
	await auth.init();
	goto(resolve('/app'));
}
