<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, within } from 'storybook/test';
	import Nav from './Nav.svelte';

	const { Story } = defineMeta({
		title: 'Components/Nav',
		component: Nav,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

<Story
	name="MealsActive"
	args={{ currentPath: '/meals' }}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('Meals')).toBeInTheDocument();
	}}
/>

<Story name="PreferencesActive" args={{ currentPath: '/preferences' }} />

<Story name="ProposeActive" args={{ currentPath: '/propose' }} />

<Story name="DiscoverActive" args={{ currentPath: '/discover' }} />
