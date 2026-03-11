import { showToast } from '$lib/toast.svelte.js';

export function handleError({ error }) {
	console.error('Client error:', error);
	showToast('Something went wrong. Please try again.');
}
