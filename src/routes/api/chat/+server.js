import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

function updateSystemPrompt(body) {
	let newPrompt = '';

	switch (body.type) {
		case 'ask':
			newPrompt =
				'You are a built in assistant for a food app. Respond with a single one sentence follow up quuestion at a time. Your objective is to get more information about how the user likes to cook and eat.';
			break;
		case 'summarize':
			newPrompt =
				'You are a built in assistant for a food app. Summarize the following conversation in one to two single sentences. Pay particular attention to current habits, preferences for what they want to try to cook and eat. Phrase the response in the second person.';
			break;
		case 'plan':
			newPrompt =
				'You are a built in assistant for a food app. Create a one week meal plan using the user preferences provided. Use newlines but not markdown or text formatting. Do not add a brief summary of why you chose what you chose.';
			break;
		default:
			throw new Error('Invalid type');
	}
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

		delete body.type;

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
