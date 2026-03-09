<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, within } from 'storybook/test';
	import ChatBubble from './ChatBubble.svelte';

	const { Story } = defineMeta({
		title: 'Components/ChatBubble',
		component: ChatBubble,
		tags: ['autodocs']
	});
</script>

<Story
	name="UserMessage"
	args={{ message: 'I really like Italian food and spicy dishes.', role: 'user' }}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText(/Italian food/)).toBeInTheDocument();
	}}
/>

<Story
	name="AssistantMessage"
	args={{
		message:
			'That sounds great! Do you prefer cooking quick weeknight meals or do you enjoy longer cooking sessions on weekends?',
		role: 'assistant'
	}}
/>

<Story
	name="Loading"
	args={{ message: '', role: 'assistant', loading: true }}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByTestId('typing-indicator')).toBeInTheDocument();
	}}
/>
