import { json, error } from '@sveltejs/kit';
import { getPreference, updatePreference, deletePreference } from '$lib/server/db.js';

export async function PUT({ params, request }) {
	const body = await request.json();
	const preference = await updatePreference(params.id, body);
	if (!preference) {
		error(404, 'Preference not found');
	}
	return json({ preference });
}

export async function DELETE({ params }) {
	const existing = await getPreference(params.id);
	if (!existing) {
		error(404, 'Preference not found');
	}
	await deletePreference(params.id);
	return json({ success: true });
}
