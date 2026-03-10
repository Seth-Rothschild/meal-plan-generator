import { json } from '@sveltejs/kit';
import { renameTag, deleteTag } from '$lib/server/db.js';

export async function PUT({ params, request }) {
	let body = await request.json();
	let newName = body.name;
	if (!newName || !newName.trim()) {
		return json({ error: 'Name is required' }, { status: 400 });
	}
	await renameTag(decodeURIComponent(params.name), newName.trim());
	return json({ success: true });
}

export async function DELETE({ params }) {
	await deleteTag(decodeURIComponent(params.name));
	return json({ success: true });
}
