export async function handle({ event, resolve }) {
	let response = await resolve(event);
	response.headers.set('Cache-Control', 'no-store');
	return response;
}

export function handleError({ error, event, status, message }) {
	console.error('Server error:', {
		status,
		message,
		url: event.url.pathname,
		method: event.request.method,
		error
	});
}
