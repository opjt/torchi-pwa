import { PUBLIC_SERVER_URL } from '$env/static/public';
import { api } from '$lib/pkg/fetch';
export interface Endpoint {
	id: string;
	name: string;
	token: string;
	active: boolean;
}

export async function fetchEndpoints(): Promise<Endpoint[]> {
	const res = await api<Endpoint[]>(`${PUBLIC_SERVER_URL}/endpoints`);
	return res;
}

export async function deleteEndpoint(token: string): Promise<void> {
	await api<void>(`${PUBLIC_SERVER_URL}/endpoints`, {
		method: 'DELETE',
		body: {
			token: token
		}
	});
}
