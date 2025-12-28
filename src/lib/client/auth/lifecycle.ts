import { PUBLIC_API_URL } from '$lib/config';

export async function logout() {
	window.location.href = `${PUBLIC_API_URL}/auth/logout`;
}
