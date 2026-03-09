import { json } from '@sveltejs/kit';
import { getAllPreferences, createPreference } from '$lib/server/db.js';

export async function GET() {
	const preferences = await getAllPreferences();
	return json({ preferences });
}

export async function POST({ request }) {
	const body = await request.json();
	const preference = await createPreference({
		text: body.text,
		tags: body.tags || []
	});
	return json({ preference }, { status: 201 });
}
