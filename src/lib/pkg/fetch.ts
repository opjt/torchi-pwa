import { toast } from 'svelte-sonner';
import { getErrorMessage } from './error-message';

export type ApiError = {
	status: number;
	message?: string;
	code?: string;
};

type ToastType = 'error' | 'warning' | 'none';

type ApiOptions<TBody> = {
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	body?: TBody;
	headers?: HeadersInit;
	signal?: AbortSignal;
	toastType?: ToastType;
};

type ApiResponse<T> = {
	code: number;
	success: boolean;
	data: T;
	message?: string;
	error?: {
		code: string;
		message: string;
	};
};

const showToast = (type: ToastType, message: string) => {
	if (type === 'none') return;
	if (type === 'error') {
		toast.error(message, {
			duration: 2300, // ms
		});
	} else if (type === 'warning') {
		//TODO: Warning 토스트 개선
		console.warn(`[Warning] ${message}`);
	}
};

export async function api<TResponse, TBody = unknown>(
	url: string,
	options: ApiOptions<TBody> = {},
): Promise<TResponse> {
	const {
		method = 'GET',
		body,
		headers,
		signal,
		toastType = 'error', // 토스트를 직접 컨트롤 하려면 'none' 으로 사용
	} = options;

	// 에러를 던지기 전에 토스트를 처리하는 내부 헬퍼
	const handleError = (status: number, message?: string, code?: string) => {
		showToast(toastType, getErrorMessage(code, message));

		const error: ApiError = {
			status,
			message,
			code,
		};
		throw error;
	};

	try {
		const res = await fetch(url, {
			method,
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				...headers,
			},
			body: body ? JSON.stringify(body) : undefined,
			signal,
		});

		// HTTP 에러 처리 (400~500번대)
		if (!res.ok) {
			const { status, statusText } = res;
			let message = statusText;
			let code = String(status);

			const errData: ApiResponse<never> = await res.json().catch(() => ({}));

			if (errData.error) {
				message = errData.error.message;
				code = errData.error.code;
			}

			return handleError(status, message, code);
		}

		// 204 No Content 처리
		if (res.status === 204) {
			return undefined as TResponse;
		}

		// 응답 바디 파싱 (JSON이 아닐 경우 대비)
		let json: ApiResponse<TResponse>;
		try {
			json = await res.json();
		} catch (_) {
			// 200 OK인데 JSON이 아닌 경우
			return handleError(res.status, 'Invalid JSON response');
		}

		//  비즈니스 로직 에러 핸들링 (success: false)
		if (!json.success) {
			return handleError(
				json.code ?? res.status,
				json.message ?? 'Unknown API Error',
				String(json.code),
			);
		}

		return json.data;
	} catch (error) {
		// 이미 handleError에서 던져진 ApiError라면 그대로 통과
		if ((error as ApiError).status) {
			throw error;
		}
		// 진짜 네트워크 에러 등 예상치 못한 에러
		// 백엔드 서버 통신이 안되는 경우
		return handleError(0, undefined, 'NETWORK_ERROR');
	}
}

// Result 타입 개선: 에러 타입을 ApiError로 구체화 가능하게 함
type Result<T, E = ApiError> = { ok: true; data: T } | { ok: false; error: E };

export async function catchError<T>(promise: Promise<T>): Promise<Result<T>> {
	try {
		const data = await promise;
		return { ok: true, data };
	} catch (error) {
		return { ok: false, error: error as ApiError };
	}
}
