import { json, error } from '@sveltejs/kit';
import { getMeal, updateMeal, deleteMeal } from '$lib/server/db.js';

export async function PUT({ params, request }) {
	const body = await request.json();
	const meal = await updateMeal(params.id, body);
	if (!meal) {
		error(404, 'Meal not found');
	}
	return json({ meal });
}

export async function DELETE({ params }) {
	const existing = await getMeal(params.id);
	if (!existing) {
		error(404, 'Meal not found');
	}
	await deleteMeal(params.id);
	return json({ success: true });
}
