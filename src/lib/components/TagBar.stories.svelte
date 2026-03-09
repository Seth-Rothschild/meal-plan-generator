<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within, fn } from 'storybook/test';
	import TagBar from './TagBar.svelte';

	const { Story } = defineMeta({
		title: 'Components/TagBar',
		component: TagBar,
		tags: ['autodocs'],
		args: {
			tags: ['italian', 'mexican', 'quick', 'spicy'],
			activeTags: [],
			ontoggle: fn()
		}
	});
</script>

<Story name="AllInactive" args={{ activeTags: [] }} />

<Story name="SomeActive" args={{ activeTags: ['italian', 'quick'] }} />

<Story name="AllActive" args={{ activeTags: ['italian', 'mexican', 'quick', 'spicy'] }} />

<Story
	name="ClickToggle"
	args={{ activeTags: [] }}
	play={async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const pill = canvas.getByRole('button', { name: 'mexican' });
		await userEvent.click(pill);
		await expect(args.ontoggle).toHaveBeenCalledWith('mexican');
	}}
/>
