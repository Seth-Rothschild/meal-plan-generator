import { json } from '@sveltejs/kit';
import { getAllMeals, createMeal } from '$lib/server/db.js';

export async function GET() {
	const meals = await getAllMeals();
	return json({ meals });
}

export async function POST({ request }) {
	const body = await request.json();
	const meal = await createMeal({
		name: body.name,
		tags: body.tags || [],
		notes: body.notes || ''
	});
	return json({ meal }, { status: 201 });
}
