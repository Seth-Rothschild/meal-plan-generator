<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within, fn } from 'storybook/test';
	import MealForm from './MealForm.svelte';

	const { Story } = defineMeta({
		title: 'Components/MealForm',
		component: MealForm,
		tags: ['autodocs'],
		args: {
			allTags: ['italian', 'mexican', 'quick', 'spicy', 'comfort'],
			onsubmit: fn(),
			oncancel: fn()
		}
	});
</script>

<Story name="CreateNew" />

<Story
	name="EditExisting"
	args={{
		meal: {
			id: 'm_1',
			name: 'Tacos',
			tags: ['mexican', 'quick'],
			notes: 'Use corn tortillas'
		}
	}}
/>

<Story
	name="SubmitEmpty"
	play={async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const submitButton = canvas.getByRole('button', { name: /save/i });
		await userEvent.click(submitButton);
		await expect(canvas.getByText(/name is required/i)).toBeInTheDocument();
		await expect(args.onsubmit).not.toHaveBeenCalled();
	}}
/>

<Story
	name="SubmitValid"
	play={async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const nameInput = canvas.getByLabelText(/meal name/i);
		await userEvent.type(nameInput, 'Spaghetti');
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
