import { getAllMeals, getAllTags } from '$lib/server/db.js';

export async function load() {
	let meals = await getAllMeals();
	let allTags = await getAllTags();
	return { meals, allTags };
}
