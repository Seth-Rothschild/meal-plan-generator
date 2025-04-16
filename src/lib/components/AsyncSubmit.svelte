<script>
	let { onClick, label = 'Submit', hasResponse = false, disabled = false } = $props();

	let isLoading = $state(false);

	async function handleClick() {
		if (isLoading || !onClick) return;

		isLoading = true;
		try {
			await onClick();
		} finally {
			isLoading = false;
		}
	}
</script>

<button onclick={handleClick} disabled={isLoading || !hasResponse || disabled}>
	{#if isLoading || !hasResponse}
		<span class="spinner"></span>
	{:else}
		{label}
	{/if}
</button>

<style>
	.spinner {
		display: inline-block;
		width: 16px;
		height: 16px;
		border: 2px solid transparent;
		border-top-color: #000;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	button {
		background: transparent;
		color: #9c27b0; /* Light purple */
		border: 2px solid #9c27b0;
		border-radius: 4px;
		padding: 0.5rem 1rem;
		font-size: 1rem;
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			color 0.2s ease,
			transform 0.2s ease;
		width: 100px;
	}

	button:hover {
		background-color: #e1bee7; /* Subtler light purple */
		color: #6a1b9a; /* Darker purple */
		transform: scale(1.05);
	}

	button:active {
		transform: scale(0.95);
	}
</style>
