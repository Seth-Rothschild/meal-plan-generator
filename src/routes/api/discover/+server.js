import { json } from '@sveltejs/kit';
import { discoverPreference } from '$lib/server/llm.js';
import { getAllPreferences, getAllTags } from '$lib/server/db.js';

export async function POST({ request }) {
	let body = await request.json();
	let messages = body.messages || [];

	try {
		let existingPreferences = await getAllPreferences();
		let existingTags = await getAllTags();
		let result = await discoverPreference(messages, { existingPreferences, existingTags });
		return json(result);
	} catch (err) {
		return json({ error: err.message }, { status: 500 });
	}
}
