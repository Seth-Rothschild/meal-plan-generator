<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within, fn } from 'storybook/test';
	import ProposalCard from './ProposalCard.svelte';

	const { Story } = defineMeta({
		title: 'Components/ProposalCard',
		component: ProposalCard,
		tags: ['autodocs'],
		args: {
			proposal: {
				name: 'Thai Green Curry',
				description: 'A fragrant coconut-based curry with vegetables and basil.',
				tags: ['thai', 'spicy', 'quick']
			},
			onsave: fn(),
			ondismiss: fn()
		}
	});
</script>

<Story name="Default" />

<Story
	name="StoredMeal"
	args={{
		proposal: {
			name: 'Chicken Tikka Masala',
			notes: 'Use full-fat coconut milk.',
			tags: ['indian', 'chicken'],
			isStored: true
		}
	}}
/>

<Story
	name="ClickSave"
	play={async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const acceptButton = canvas.getByRole('button', { name: /accept|save|add/i });
		await userEvent.click(acceptButton);
		await expect(args.onsave).toHaveBeenCalledOnce();
	}}
/>

<Story
	name="ClickDismiss"
	play={async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const dismissButton = canvas.getByRole('button', { name: /dismiss|skip|pass/i });
		await userEvent.click(dismissButton);
		await expect(args.ondismiss).toHaveBeenCalledOnce();
	}}
/>
