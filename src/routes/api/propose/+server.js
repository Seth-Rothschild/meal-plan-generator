import { json } from '@sveltejs/kit';
import { proposeSingleMeal } from '$lib/server/llm.js';

export async function POST({ request }) {
	let body = await request.json();
	let preferences = body.preferences || [];
	let activeTags = body.activeTags || [];
	let theme = body.theme || '';
	let avoidNames = body.avoidNames || [];

	try {
		let proposal = await proposeSingleMeal(preferences, activeTags, theme, avoidNames);
		return json({ proposal });
	} catch (err) {
		return json({ error: err.message, proposal: null }, { status: 500 });
	}
}
