import { getAllMeals, getAllPreferences, getAllTags } from '$lib/server/db.js';

export async function load() {
	let meals = await getAllMeals();
	let preferences = await getAllPreferences();
	let allTags = await getAllTags();
	return { meals, preferences, allTags };
}
