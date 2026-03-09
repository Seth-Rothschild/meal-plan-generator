<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, within } from 'storybook/test';
	import EmptyState from './EmptyState.svelte';

	const { Story } = defineMeta({
		title: 'Components/EmptyState',
		component: EmptyState,
		tags: ['autodocs']
	});
</script>

<Story
	name="Default"
	args={{ message: 'No meals yet. Add your first one!' }}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('No meals yet. Add your first one!')).toBeInTheDocument();
	}}
/>

<Story
	name="Preferences"
	args={{ message: 'No preferences saved. Start a conversation to discover yours!' }}
/>
