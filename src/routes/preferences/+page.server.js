import { getAllPreferences, getAllTags } from '$lib/server/db.js';

export async function load() {
	let preferences = await getAllPreferences();
	let allTags = await getAllTags();
	return { preferences, allTags };
}
