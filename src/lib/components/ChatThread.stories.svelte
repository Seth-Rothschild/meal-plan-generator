<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within, fn } from 'storybook/test';
	import ChatThread from './ChatThread.svelte';

	const { Story } = defineMeta({
		title: 'Components/ChatThread',
		component: ChatThread,
		tags: ['autodocs'],
		args: {
			onsubmit: fn()
		}
	});
</script>

<Story name="Empty" args={{ messages: [], loading: false }} />

<Story
	name="WithMessages"
	args={{
		messages: [
			{ role: 'assistant', content: 'Hi! What kinds of meals do you enjoy cooking?' },
			{ role: 'user', content: 'I love making pasta dishes and stir fries.' },
			{
				role: 'assistant',
				content: 'Great choices! Do you have any dietary restrictions or preferences?'
			}
		],
		loading: false
	}}
/>

<Story
	name="Loading"
	args={{
		messages: [
			{ role: 'assistant', content: 'Tell me about your food preferences!' },
			{ role: 'user', content: 'I like spicy food' }
		],
		loading: true
	}}
/>

<Story
	name="SubmitMessage"
	args={{ messages: [], loading: false }}
	play={async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByPlaceholderText(/type/i);
		await userEvent.type(input, 'I love tacos');
		await userEvent.keyboard('{Enter}');
		await expect(args.onsubmit).toHaveBeenCalledWith('I love tacos');
	}}
/>
