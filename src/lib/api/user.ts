import { PUBLIC_API_URL } from '$lib/config';
import { api } from '$lib/pkg/fetch';
export interface UserInfo {
	user_id: string;
	email?: string;
}

export async function fetchWhoami(): Promise<UserInfo | null> {
	try {
		const res = await api<UserInfo>(`${PUBLIC_API_URL}/users/whoami`);

		return res;
	} catch (_) {
		return null;
	}
}
