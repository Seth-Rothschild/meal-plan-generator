<script>
	import { fly } from 'svelte/transition';

	let { message = '', role = 'user', loading = false } = $props();
</script>

<div class="bubble-wrapper {role}" in:fly={{ y: 12, duration: 250 }}>
	<div class="bubble">
		{#if loading}
			<div class="typing-indicator" data-testid="typing-indicator">
				<span class="dot"></span>
				<span class="dot"></span>
				<span class="dot"></span>
			</div>
		{:else}
			{message}
		{/if}
	</div>
</div>

<style>
	.bubble-wrapper {
		display: flex;
		margin-bottom: 12px;
	}

	.bubble-wrapper.user {
		justify-content: flex-end;
	}

	.bubble-wrapper.assistant {
		justify-content: flex-start;
	}

	.bubble {
		max-width: 75%;
		padding: 12px 16px;
		border-radius: 16px;
		font-size: 0.9375rem;
		line-height: 1.5;
		white-space: pre-wrap;
	}

	.user .bubble {
		background-color: #5c7855;
		color: #ffffff;
		border-bottom-right-radius: 4px;
	}

	.assistant .bubble {
		background-color: #ffffff;
		color: #3a3a3a;
		border-bottom-left-radius: 4px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
	}

	.typing-indicator {
		display: flex;
		gap: 5px;
		padding: 4px 0;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: #666666;
		animation: bounce 1.2s infinite ease-in-out;
	}

	.dot:nth-child(2) {
		animation-delay: 0.2s;
	}

	.dot:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes bounce {
		0%,
		60%,
		100% {
			transform: translateY(0);
		}
		30% {
			transform: translateY(-6px);
		}
	}
</style>
