import { json, error } from '@sveltejs/kit';
import { getMeal, updateMeal, deleteMeal } from '$lib/server/db.js';
import { generateMealDetails } from '$lib/server/llm.js';

export async function PUT({ params, request }) {
	const body = await request.json();
	const meal = await updateMeal(params.id, body);
	if (!meal) {
		error(404, 'Meal not found');
	}
	return json({ meal });
}

export async function POST({ params }) {
	let meal = await getMeal(params.id);
	if (!meal) {
		error(404, 'Meal not found');
	}

	try {
		let notes = await generateMealDetails(meal.name, meal.tags);
		let updated = await updateMeal(params.id, { notes });
		return json({ meal: updated });
	} catch (err) {
		return json({ error: err.message }, { status: 500 });
	}
}

export async function DELETE({ params }) {
	const existing = await getMeal(params.id);
	if (!existing) {
		error(404, 'Meal not found');
	}
	await deleteMeal(params.id);
	return json({ success: true });
}
