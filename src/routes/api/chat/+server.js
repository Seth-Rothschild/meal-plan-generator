import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

function updateSystemPrompt(body) {
	let newPrompt =
		'You are a built in assistant for a food app. Respond with a single one sentence follow up quuestion at a time. Your objective is to get more information about how the user likes to cook and eat.';
	if (body.messages && body.messages.length > 0) {
		const systemMessage = body.messages.find((msg) => msg.role === 'system');
		if (systemMessage) {
			systemMessage.content = newPrompt;
		} else {
			body.messages.unshift({ role: 'system', content: newPrompt });
		}
	} else {
		body.messages = [{ role: 'system', content: newPrompt }];
	}
	return body;
}

export async function POST({ request }) {
	try {
		let body = await request.json();
		body = updateSystemPrompt(body);

		body.model = env.MODEL;
		body.stream = false;

		const response = await fetch(`${env.API_URL}/chat/completions`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${env.API_KEY}`
			},
			body: JSON.stringify(body)
		});

		if (!response.ok) {
			return json({ error: 'Failed to fetch from external API' }, { status: response.status });
		}

		const data = await response.json();
		return json({ data: data.choices[0].message.content }, { status: 200 });
	} catch (error) {
		console.error('Error in API route:', error);
		return json({ error: 'An error occurred', details: error.message }, { status: 500 });
	}
}
