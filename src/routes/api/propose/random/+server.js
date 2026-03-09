import { json } from '@sveltejs/kit';
import { getAllMeals } from '$lib/server/db.js';

export async function POST({ request }) {
	let body = await request.json();
	let activeTags = body.activeTags || [];

	let meals = await getAllMeals();

	let candidates = meals;
	if (activeTags.length > 0) {
		candidates = meals.filter((meal) => meal.tags.some((tag) => activeTags.includes(tag)));
	}

	if (candidates.length === 0) {
		return json({ meal: null });
	}

	let randomIndex = Math.floor(Math.random() * candidates.length);
	let meal = candidates[randomIndex];
	return json({ meal: { ...meal, isStored: true } });
}
