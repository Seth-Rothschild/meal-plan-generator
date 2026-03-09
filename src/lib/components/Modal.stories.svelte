<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within, fn } from 'storybook/test';
	import Modal from './Modal.svelte';

	const { Story } = defineMeta({
		title: 'Components/Modal',
		component: Modal,
		tags: ['autodocs'],
		args: {
			open: true,
			onclose: fn(),
			label: 'Test dialog'
		}
	});
</script>

<Story name="Open" args={{ open: true }}>
	{#snippet children()}
		<p>Modal content goes here</p>
	{/snippet}
</Story>

<Story name="Closed" args={{ open: false }}>
	{#snippet children()}
		<p>This should not be visible</p>
	{/snippet}
</Story>

<Story
	name="BackdropClick"
	args={{ open: true }}
	play={async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const backdrop = canvas.getByTestId('modal-backdrop');
		await userEvent.click(backdrop);
		await expect(args.onclose).toHaveBeenCalledOnce();
	}}
>
	{#snippet children()}
		<p>Click outside to close</p>
	{/snippet}
</Story>
