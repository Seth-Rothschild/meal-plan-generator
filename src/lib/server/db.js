import fs from 'node:fs/promises';
import path from 'node:path';

function getDbPath() {
	if (process.env.DATA_PATH) {
		return process.env.DATA_PATH;
	}
	return path.join(process.cwd(), 'data', 'db.json');
}

const EMPTY_DATA = { meals: [], preferences: [] };

export async function readData() {
	try {
		const raw = await fs.readFile(getDbPath(), 'utf-8');
		return JSON.parse(raw);
	} catch {
		return { ...EMPTY_DATA, meals: [], preferences: [] };
	}
}

export async function writeData(data) {
	const dbPath = getDbPath();
	const dir = path.dirname(dbPath);
	await fs.mkdir(dir, { recursive: true });
	await fs.writeFile(dbPath, JSON.stringify(data, null, '\t'), 'utf-8');
}

export async function getAllMeals() {
	const data = await readData();
	return data.meals;
}

export async function getMeal(id) {
	const data = await readData();
	return data.meals.find((m) => m.id === id);
}

export async function createMeal({ name, tags, notes }) {
	const data = await readData();
	const meal = {
		id: 'm_' + Date.now(),
		name,
		tags,
		notes,
		createdAt: new Date().toISOString()
	};
	data.meals.push(meal);
	await writeData(data);
	return meal;
}

export async function updateMeal(id, fields) {
	const data = await readData();
	const index = data.meals.findIndex((m) => m.id === id);
	if (index === -1) {
		return undefined;
	}
	data.meals[index] = { ...data.meals[index], ...fields };
	await writeData(data);
	return data.meals[index];
}

export async function deleteMeal(id) {
	const data = await readData();
	data.meals = data.meals.filter((m) => m.id !== id);
	await writeData(data);
}

export async function getAllPreferences() {
	const data = await readData();
	return data.preferences;
}

export async function getPreference(id) {
	const data = await readData();
	return data.preferences.find((p) => p.id === id);
}

export async function createPreference({ text, tags }) {
	const data = await readData();
	const pref = {
		id: 'p_' + Date.now(),
		text,
		tags,
		createdAt: new Date().toISOString()
	};
	data.preferences.push(pref);
	await writeData(data);
	return pref;
}

export async function updatePreference(id, fields) {
	const data = await readData();
	const index = data.preferences.findIndex((p) => p.id === id);
	if (index === -1) {
		return undefined;
	}
	data.preferences[index] = { ...data.preferences[index], ...fields };
	await writeData(data);
	return data.preferences[index];
}

export async function deletePreference(id) {
	const data = await readData();
	data.preferences = data.preferences.filter((p) => p.id !== id);
	await writeData(data);
}

export async function getAllTags() {
	const data = await readData();
	const tagSet = new Set();
	for (const meal of data.meals) {
		for (const tag of meal.tags) {
			tagSet.add(tag);
		}
	}
	for (const pref of data.preferences) {
		for (const tag of pref.tags) {
			tagSet.add(tag);
		}
	}
	return [...tagSet].sort();
}
