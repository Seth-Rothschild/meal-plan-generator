<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within, fn } from 'storybook/test';
	import SnippetForm from './SnippetForm.svelte';

	const { Story } = defineMeta({
		title: 'Components/SnippetForm',
		component: SnippetForm,
		tags: ['autodocs'],
		args: {
			allTags: ['spicy', 'savory', 'quick', 'comfort'],
			onsubmit: fn(),
			oncancel: fn()
		}
	});
</script>

<Story name="CreateNew" />

<Story
	name="EditExisting"
	args={{
		snippet: {
			id: 'p_1',
			text: 'I like bold flavors',
			tags: ['spicy']
		}
	}}
/>

<Story
	name="SubmitEmpty"
	play={async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const submitButton = canvas.getByRole('button', { name: /save/i });
		await userEvent.click(submitButton);
		await expect(canvas.getByText(/text is required/i)).toBeInTheDocument();
		await expect(args.onsubmit).not.toHaveBeenCalled();
	}}
/>

<Story
	name="SubmitValid"
	play={async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const textInput = canvas.getByLabelText(/preference text/i);
		await userEvent.type(textInput, 'I love pasta');
		const submitButton = canvas.getByRole('button', { name: /save/i });
		await userEvent.click(submitButton);
		await expect(args.onsubmit).toHaveBeenCalledOnce();
	}}
/>

<Story
	name="ClickCancel"
	play={async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const cancelButton = canvas.getByRole('button', { name: /cancel/i });
		await userEvent.click(cancelButton);
		await expect(args.oncancel).toHaveBeenCalledOnce();
	}}
/>
