import { json } from '@sveltejs/kit';
import { proposeMeals } from '$lib/server/llm.js';

export async function POST({ request }) {
	let body = await request.json();
	let preferences = body.preferences || [];
	let activeTags = body.activeTags || [];

	try {
		let proposals = await proposeMeals(preferences, activeTags);
		return json({ proposals });
	} catch (err) {
		return json({ error: err.message, proposals: [] }, { status: 500 });
	}
}
