<script>
	let { message = '' } = $props();
</script>

<div class="empty-state">
	<span class="icon empty-icon">restaurant</span>
	<p class="empty-message">{message}</p>
</div>

<style>
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 56px 24px;
		text-align: center;
	}

	.empty-icon {
		font-size: 48px;
		color: var(--color-muted);
		margin-bottom: 16px;
		animation: float 3s ease-in-out infinite;
	}

	.empty-message {
		font-size: var(--font-base);
		color: var(--color-muted);
		max-width: 320px;
		line-height: 1.5;
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-8px);
		}
	}
</style>
