import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

let db;
let testDir;
let testDbPath;

beforeEach(async () => {
	testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'db-test-'));
	testDbPath = path.join(testDir, 'db.json');
	process.env.DATA_PATH = testDbPath;

	db = await import('./db.js?' + Date.now());
});

afterEach(() => {
	fs.rmSync(testDir, { recursive: true, force: true });
	delete process.env.DATA_PATH;
});

describe('readData', () => {
	it('returns empty structure when no file exists', async () => {
		const data = await db.readData();
		expect(data).toEqual({ meals: [], preferences: [] });
	});

	it('returns parsed data when file exists', async () => {
		const existing = { meals: [{ id: 'm_1', name: 'Tacos' }], preferences: [] };
		fs.writeFileSync(testDbPath, JSON.stringify(existing));

		const data = await db.readData();
		expect(data).toEqual(existing);
	});
});

describe('meals', () => {
	it('createMeal adds a meal and persists it', async () => {
		const meal = await db.createMeal({
			name: 'Tacos',
			tags: ['mexican'],
			notes: 'Use corn tortillas'
		});

		expect(meal.name).toBe('Tacos');
		expect(meal.tags).toEqual(['mexican']);
		expect(meal.notes).toBe('Use corn tortillas');
		expect(meal.id).toMatch(/^m_\d+$/);
		expect(meal.createdAt).toBeDefined();

		const allMeals = await db.getAllMeals();
		expect(allMeals).toHaveLength(1);
		expect(allMeals[0].id).toBe(meal.id);
	});

	it('getMeal finds a meal by id', async () => {
		const created = await db.createMeal({ name: 'Pasta', tags: [], notes: '' });

		const found = await db.getMeal(created.id);
		expect(found.name).toBe('Pasta');
	});

	it('getMeal returns undefined for unknown id', async () => {
		const found = await db.getMeal('m_nonexistent');
		expect(found).toBeUndefined();
	});

	it('updateMeal changes fields', async () => {
		const created = await db.createMeal({ name: 'Salad', tags: ['healthy'], notes: '' });

		const updated = await db.updateMeal(created.id, {
			name: 'Caesar Salad',
			notes: 'Add croutons'
		});

		expect(updated.name).toBe('Caesar Salad');
		expect(updated.notes).toBe('Add croutons');
		expect(updated.tags).toEqual(['healthy']);

		const persisted = await db.getMeal(created.id);
		expect(persisted.name).toBe('Caesar Salad');
	});

	it('deleteMeal removes a meal', async () => {
		const created = await db.createMeal({ name: 'Soup', tags: [], notes: '' });

		await db.deleteMeal(created.id);

		const allMeals = await db.getAllMeals();
		expect(allMeals).toHaveLength(0);
	});

	it('getAllMeals returns all meals', async () => {
		await db.createMeal({ name: 'A', tags: [], notes: '' });
		await db.createMeal({ name: 'B', tags: [], notes: '' });

		const meals = await db.getAllMeals();
		expect(meals).toHaveLength(2);
	});
});

describe('preferences', () => {
	it('createPreference adds a preference and persists it', async () => {
		const pref = await db.createPreference({ text: 'I like spicy food', tags: ['spicy'] });

		expect(pref.text).toBe('I like spicy food');
		expect(pref.tags).toEqual(['spicy']);
		expect(pref.id).toMatch(/^p_\d+$/);
		expect(pref.createdAt).toBeDefined();

		const allPrefs = await db.getAllPreferences();
		expect(allPrefs).toHaveLength(1);
	});

	it('getPreference finds by id', async () => {
		const created = await db.createPreference({ text: 'No nuts', tags: ['allergy'] });

		const found = await db.getPreference(created.id);
		expect(found.text).toBe('No nuts');
	});

	it('getPreference returns undefined for unknown id', async () => {
		const found = await db.getPreference('p_nonexistent');
		expect(found).toBeUndefined();
	});

	it('updatePreference changes fields', async () => {
		const created = await db.createPreference({ text: 'Like pasta', tags: ['italian'] });

		const updated = await db.updatePreference(created.id, { text: 'Love pasta' });

		expect(updated.text).toBe('Love pasta');
		expect(updated.tags).toEqual(['italian']);
	});

	it('deletePreference removes a preference', async () => {
		const created = await db.createPreference({ text: 'Test', tags: [] });

		await db.deletePreference(created.id);

		const allPrefs = await db.getAllPreferences();
		expect(allPrefs).toHaveLength(0);
	});
});

describe('getAllTags', () => {
	it('collects unique tags from meals and preferences', async () => {
		await db.createMeal({ name: 'Tacos', tags: ['mexican', 'quick'], notes: '' });
		await db.createMeal({ name: 'Pasta', tags: ['italian', 'quick'], notes: '' });
		await db.createPreference({ text: 'Spicy', tags: ['spicy', 'mexican'] });

		const tags = await db.getAllTags();
		expect(tags).toEqual(['italian', 'mexican', 'quick', 'spicy']);
	});

	it('returns empty array when no data exists', async () => {
		const tags = await db.getAllTags();
		expect(tags).toEqual([]);
	});
});

describe('renameTag', () => {
	it('renames a tag across meals and preferences', async () => {
		await db.createMeal({ name: 'Tacos', tags: ['mexican', 'quick'], notes: '' });
		await db.createMeal({ name: 'Burrito', tags: ['mexican'], notes: '' });
		await db.createPreference({ text: 'I like mexican', tags: ['mexican'] });

		await db.renameTag('mexican', 'tex-mex');

		const meals = await db.getAllMeals();
		expect(meals[0].tags).toEqual(['tex-mex', 'quick']);
		expect(meals[1].tags).toEqual(['tex-mex']);

		const prefs = await db.getAllPreferences();
		expect(prefs[0].tags).toEqual(['tex-mex']);
	});

	it('does not affect unrelated tags', async () => {
		await db.createMeal({ name: 'Pasta', tags: ['italian', 'quick'], notes: '' });

		await db.renameTag('mexican', 'tex-mex');

		const meals = await db.getAllMeals();
		expect(meals[0].tags).toEqual(['italian', 'quick']);
	});
});

describe('deleteTag', () => {
	it('removes a tag from all meals and preferences', async () => {
		await db.createMeal({ name: 'Tacos', tags: ['mexican', 'quick'], notes: '' });
		await db.createPreference({ text: 'Quick meals', tags: ['quick', 'weeknight'] });

		await db.deleteTag('quick');

		const meals = await db.getAllMeals();
		expect(meals[0].tags).toEqual(['mexican']);

		const prefs = await db.getAllPreferences();
		expect(prefs[0].tags).toEqual(['weeknight']);
	});

	it('handles deleting a tag that does not exist', async () => {
		await db.createMeal({ name: 'Pasta', tags: ['italian'], notes: '' });

		await db.deleteTag('nonexistent');

		const meals = await db.getAllMeals();
		expect(meals[0].tags).toEqual(['italian']);
	});
});
