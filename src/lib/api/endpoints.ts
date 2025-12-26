import { PUBLIC_SERVER_URL } from '$env/static/public';
import { api } from '$lib/pkg/fetch';
export interface Endpoint {
	id: string;
	name: string;
	endpoint: string;
	active: boolean;
}

export async function fetchEndpoints(): Promise<Endpoint[]> {
	const res = await api<Endpoint[]>(`${PUBLIC_SERVER_URL}/endpoints`);
	return res;
}
