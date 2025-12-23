import { PUBLIC_SERVER_URL } from '$env/static/public';

export async function logout() {
	window.location.href = `${PUBLIC_SERVER_URL}/auth/logout`;
}
