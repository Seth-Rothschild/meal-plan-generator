let toasts = $state([]);
let nextId = 0;

export function getToasts() {
	return toasts;
}

export function showToast(message, duration = 4000) {
	let id = nextId++;
	toasts = [...toasts, { id, message }];
	setTimeout(() => {
		toasts = toasts.filter((t) => t.id !== id);
	}, duration);
}

export async function safeFetch(url, options) {
	try {
		let response = await fetch(url, options);
		if (!response.ok) {
			let body = await response.json().catch(() => null);
			let message = body?.error || `Request failed (${response.status})`;
			showToast(message);
			return null;
		}
		return response;
	} catch {
		showToast('Network error. Please try again.');
		return null;
	}
}
