import { surveyStore } from './stores/surveyStore.svelte';
export const getResponse = async (messages, type) => {
	try {
		const res = await fetch('/api/chat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				messages,
				type
			})
		});
		if (!res.ok) {
			throw new Error('Network response was not ok');
		}

		let resJSON = await res.json();
		if (resJSON.error) {
			throw new Error(resJSON.error);
		}

		return resJSON.data;
	} catch (error) {
		console.error('Error:', error);
	}
};

export const addHistory = (messages) => {
	let oldSummaries = {
		role: 'user',
		content:
			'Summary:\n' +
			surveyStore.pages
				.filter((page) => page.done)
				.map((page) => parent.initialQuestion + ' ' + page.summary)
				.join('\n\n')
	};

	return [oldSummaries, ...messages];
};
