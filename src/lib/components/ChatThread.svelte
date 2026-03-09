<script>
	import ChatBubble from './ChatBubble.svelte';

	let { messages = [], loading = false, onsubmit } = $props();

	let inputValue = $state('');
	let scrollContainer = $state(null);

	$effect(() => {
		if (scrollContainer && messages.length) {
			scrollContainer.scrollTop = scrollContainer.scrollHeight;
		}
	});

	function handleKeydown(event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			submitMessage();
		}
	}

	function submitMessage() {
		let trimmed = inputValue.trim();
		if (!trimmed) return;
		onsubmit?.(trimmed);
		inputValue = '';
	}
</script>

<div class="chat-thread">
	<div class="messages" bind:this={scrollContainer}>
		{#each messages as msg}
			<ChatBubble message={msg.content} role={msg.role} />
		{/each}
		{#if loading}
			<ChatBubble role="assistant" loading />
		{/if}
	</div>
	<div class="input-row">
		<input
			type="text"
			placeholder="Type a message..."
			bind:value={inputValue}
			onkeydown={handleKeydown}
			disabled={loading}
		/>
		<button
			type="button"
			class="send-btn"
			onclick={submitMessage}
			disabled={loading || !inputValue.trim()}
		>
			Send
		</button>
	</div>
</div>

<style>
	.chat-thread {
		display: flex;
		flex-direction: column;
		height: 500px;
		background: #f8f5ee;
		border-radius: 16px;
		overflow: hidden;
	}

	.messages {
		flex: 1;
		overflow-y: auto;
		padding: 20px;
	}

	.input-row {
		display: flex;
		gap: 8px;
		padding: 12px 16px;
		background: #ffffff;
		border-top: 1px solid #e0dcd4;
	}

	input {
		flex: 1;
		padding: 10px 14px;
		border: 2px solid #e0dcd4;
		border-radius: 10px;
		font-size: 0.9375rem;
		background: #ffffff;
		color: #3a3a3a;
		transition: border-color 150ms ease;
	}

	input:focus {
		outline: none;
		border-color: #5c7855;
	}

	input:disabled {
		opacity: 0.5;
	}

	.send-btn {
		padding: 10px 20px;
		background-color: #5c7855;
		color: #ffffff;
		border: none;
		border-radius: 10px;
		font-weight: 600;
		cursor: pointer;
		transition:
			background-color 150ms ease,
			transform 150ms ease;
	}

	.send-btn:hover:not(:disabled) {
		background-color: #476441;
	}

	.send-btn:active {
		transform: scale(0.97);
	}

	.send-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
