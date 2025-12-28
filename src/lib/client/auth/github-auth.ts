import { PUBLIC_GITHUB_CLIENT_ID } from '$lib/config';

export function loginWithGithub() {
	const params = new URLSearchParams({
		client_id: PUBLIC_GITHUB_CLIENT_ID,
		scope: 'read:user user:email'
	});

	window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}&prompt=select_account`;
}
