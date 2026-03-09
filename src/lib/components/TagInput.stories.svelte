<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within, fn } from 'storybook/test';
	import TagInput from './TagInput.svelte';

	const { Story } = defineMeta({
		title: 'Components/TagInput',
		component: TagInput,
		tags: ['autodocs'],
		args: {
			tags: [],
			allTags: ['italian', 'mexican', 'quick', 'spicy', 'comfort'],
			onchange: fn()
		}
	});
</script>

<Story name="Empty" args={{ tags: [] }} />

<Story name="WithTags" args={{ tags: ['italian', 'spicy'] }} />

<Story
	name="AddTag"
	args={{ tags: [] }}
	play={async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByPlaceholderText(/add tag/i);
		await userEvent.type(input, 'italian{Enter}');
		await expect(args.onchange).toHaveBeenCalledWith(['italian']);
	}}
/>

<Story
	name="FiltersSuggestions"
	args={{ tags: [] }}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByPlaceholderText(/add tag/i);
		await userEvent.type(input, 'it');
		const suggestion = canvas.getByText('italian');
		await expect(suggestion).toBeInTheDocument();
	}}
/>

<Story
	name="RemoveTag"
	args={{ tags: ['quick'] }}
	play={async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const removeButton = canvas.getByRole('button', { name: /remove quick/i });
		await userEvent.click(removeButton);
		await expect(args.onchange).toHaveBeenCalledWith([]);
	}}
/>
