import { getAllTags } from '$lib/server/db.js';

export async function load() {
	let allTags = await getAllTags();
	return { allTags };
}
