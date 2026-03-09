<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within, fn } from 'storybook/test';
	import MealCard from './MealCard.svelte';

	const { Story } = defineMeta({
		title: 'Components/MealCard',
		component: MealCard,
		tags: ['autodocs'],
		args: {
			meal: {
				id: 'm_1',
				name: 'Chicken Tikka Masala',
				tags: ['indian', 'chicken'],
				notes: 'Use full-fat coconut milk for best results.'
			},
			onedit: fn(),
			ondelete: fn()
		}
	});
</script>

<Story name="Default" />

<Story
	name="LongNotes"
	args={{
		meal: {
			id: 'm_2',
			name: 'Pasta Carbonara',
			tags: ['italian', 'quick', 'pasta'],
			notes:
				'Use guanciale if you can find it, otherwise pancetta works. The key is to temper the eggs slowly so they do not scramble. Reserve plenty of pasta water for the sauce.'
		}
	}}
/>

<Story
	name="ManyTags"
	args={{
		meal: {
			id: 'm_3',
			name: 'Buddha Bowl',
			tags: ['healthy', 'vegan', 'quick', 'lunch', 'meal-prep', 'gluten-free'],
			notes: 'Any grain base works.'
		}
	}}
/>

<Story
	name="ClickEdit"
	play={async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const editButton = canvas.getByRole('button', { name: /edit/i });
		await userEvent.click(editButton);
		await expect(args.onedit).toHaveBeenCalledOnce();
	}}
/>

<Story
	name="ClickDelete"
	play={async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const deleteButton = canvas.getByRole('button', { name: /delete/i });
		await userEvent.click(deleteButton);
		await expect(args.ondelete).toHaveBeenCalledOnce();
	}}
/>
