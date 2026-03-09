<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within, fn } from 'storybook/test';
	import SnippetCard from './SnippetCard.svelte';

	const { Story } = defineMeta({
		title: 'Components/SnippetCard',
		component: SnippetCard,
		tags: ['autodocs'],
		args: {
			snippet: {
				id: 'p_1',
				text: 'I prefer bold, spicy flavors and avoid overly sweet dishes.',
				tags: ['spicy', 'savory']
			},
			onedit: fn(),
			ondelete: fn()
		}
	});
</script>

<Story name="Default" />

<Story
	name="LongText"
	args={{
		snippet: {
			id: 'p_2',
			text: 'We enjoy cooking meals that take under 30 minutes on weeknights. On weekends we are happy to spend more time. We prefer Mediterranean and Asian flavors. We try to eat vegetarian at least twice a week but are not strict about it.',
			tags: ['quick', 'mediterranean', 'asian', 'vegetarian']
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
