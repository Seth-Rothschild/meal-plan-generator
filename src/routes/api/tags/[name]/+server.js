import { json } from '@sveltejs/kit';
import { renameTag, deleteTag } from '$lib/server/db.js';

export async function PUT({ params, request }) {
	let body = await request.json();
	let newName = body.name;
	if (!newName || !newName.trim()) {
		return json({ error: 'Name is required' }, { status: 400 });
	}
	try {
		await renameTag(decodeURIComponent(params.name), newName.trim());
		return json({ success: true });
	} catch (err) {
		console.error('PUT /api/tags/ failed:', err);
		return json({ error: err.message }, { status: 500 });
	}
}

export async function DELETE({ params }) {
	try {
		await deleteTag(decodeURIComponent(params.name));
		return json({ success: true });
	} catch (err) {
		console.error('DELETE /api/tags/ failed:', err);
		return json({ error: err.message }, { status: 500 });
	}
}
