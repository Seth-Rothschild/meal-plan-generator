<script>
	import { fly, fade } from 'svelte/transition';
	import { getToasts } from '$lib/toast.svelte.js';

	let toasts = $derived(getToasts());
</script>

{#if toasts.length > 0}
	<div class="toast-container">
		{#each toasts as toast (toast.id)}
			<div class="toast" in:fly={{ y: 40, duration: 250 }} out:fade={{ duration: 200 }}>
				<span class="icon toast-icon">error_outline</span>
				<span class="toast-message">{toast.message}</span>
			</div>
		{/each}
	</div>
{/if}

<style>
	.toast-container {
		position: fixed;
		bottom: 24px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 10000;
		display: flex;
		flex-direction: column;
		gap: 8px;
		pointer-events: none;
		max-width: 90vw;
	}

	.toast {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 20px;
		background: var(--color-charcoal);
		color: var(--color-white);
		border-radius: var(--radius-md);
		font-size: var(--font-sm);
		font-weight: 500;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
		pointer-events: auto;
	}

	.toast-icon {
		font-size: 20px;
		flex-shrink: 0;
	}
</style>
