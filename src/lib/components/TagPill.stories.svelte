<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within, fn } from 'storybook/test';
	import TagPill from './TagPill.svelte';

	const { Story } = defineMeta({
		title: 'Components/TagPill',
		component: TagPill,
		tags: ['autodocs'],
		args: {
			label: 'italian',
			ontoggle: fn(),
			onremove: fn()
		}
	});
</script>

<Story name="Default" args={{ label: 'italian' }} />

<Story name="Active" args={{ label: 'spicy', active: true }} />

<Story
	name="Removable"
	args={{ label: 'quick', removable: true }}
	play={async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const removeButton = canvas.getByRole('button', { name: /remove quick/i });
		await userEvent.click(removeButton);
		await expect(args.onremove).toHaveBeenCalledOnce();
	}}
/>

<Story
	name="Toggleable"
	args={{ label: 'comfort', active: false }}
	play={async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const pill = canvas.getByRole('button', { name: /comfort/i });
		await userEvent.click(pill);
		await expect(args.ontoggle).toHaveBeenCalledOnce();
	}}
/>
