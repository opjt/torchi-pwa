export type ApiError = {
	status: number;
	message: string;
	code?: string;
};

type ApiOptions<TBody> = {
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	body?: TBody;
	headers?: HeadersInit;
	signal?: AbortSignal;
};
type ApiResponse<T> = {
	code: number;
	success: boolean;
	data: T;
	message?: string;
};

export async function api<TResponse, TBody = unknown>(
	url: string,
	options: ApiOptions<TBody> = {}
): Promise<TResponse> {
	const { method = 'GET', body, headers, signal } = options;

	const res = await fetch(url, {
		method,
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			...headers
		},
		body: body ? JSON.stringify(body) : undefined,
		signal
	});

	// HTTP 레벨 에러
	if (!res.ok) {
		let message = res.statusText;

		try {
			const err = await res.json();
			message = err.message ?? message;
		} catch {
			/* noop */
		}

		throw <ApiError>{
			status: res.status,
			message
		};
	}

	// 204 대응
	if (res.status === 204) {
		return undefined as TResponse;
	}

	const json: ApiResponse<TResponse> = await res.json();

	// 비즈니스 에러
	if (!json.success) {
		throw <ApiError>{
			status: json.code ?? res.status,
			message: json.message ?? 'API Error',
			code: String(json.code)
		};
	}

	return json.data;
}

type Result<T, E = Error> = { ok: true; data: T } | { ok: false; error: E };

export async function catchError<T>(promise: Promise<T>): Promise<Result<T>> {
	try {
		const data = await promise;
		return { ok: true, data };
	} catch (error) {
		return { ok: false, error: error as Error };
	}
}
