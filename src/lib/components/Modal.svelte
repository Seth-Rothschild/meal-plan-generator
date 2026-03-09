<script>
	import { fly, fade } from 'svelte/transition';

	let { open = false, onclose, children, label = 'Dialog' } = $props();

	function handleKeydown(event) {
		if (event.key === 'Escape') {
			onclose?.();
		}
	}

	function handleBackdropClick(event) {
		if (event.target === event.currentTarget) {
			onclose?.();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div
		class="modal-backdrop"
		data-testid="modal-backdrop"
		transition:fade={{ duration: 200 }}
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-label={label}
	>
		<div class="modal-content" transition:fly={{ y: 40, duration: 300 }}>
			<button type="button" class="modal-close" aria-label="Close" onclick={() => onclose?.()}>
				×
			</button>
			{@render children?.()}
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
		z-index: 100;
	}

	.modal-content {
		background: #ffffff;
		border-radius: 16px;
		padding: 32px;
		width: 100%;
		max-width: 520px;
		max-height: 85vh;
		overflow-y: auto;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
		position: relative;
	}

	.modal-close {
		position: absolute;
		top: 12px;
		right: 16px;
		font-size: 1.5rem;
		line-height: 1;
		color: #666666;
		cursor: pointer;
		background: none;
		border: none;
		padding: 4px;
		transition: color 150ms ease;
	}

	.modal-close:hover {
		color: #3a3a3a;
	}
</style>
