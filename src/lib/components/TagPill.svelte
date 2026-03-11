<script>
	let { label, active = false, removable = false, clickable = false, ontoggle, onremove } =
		$props();
</script>

<span class="tag-pill" class:active>
	{#if clickable}
		<button type="button" class="tag-label" aria-label={label} onclick={() => ontoggle?.()}>
			{label}
		</button>
	{:else}
		<span class="tag-text">{label}</span>
	{/if}
	{#if removable}
		<button
			type="button"
			class="tag-remove"
			aria-label={`remove ${label}`}
			onclick={() => onremove?.()}
		>
			<span class="icon">close</span>
		</button>
	{/if}
</span>

<style>
	.tag-pill {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		padding: 6px 14px;
		border-radius: var(--radius-pill);
		font-size: var(--font-sm);
		font-weight: 600;
		background-color: var(--color-surface);
		color: var(--color-charcoal);
		transition:
			background-color var(--transition-fast),
			transform var(--transition-fast),
			color var(--transition-fast);
	}

	.tag-pill.active {
		background-color: var(--color-sage);
		color: var(--color-white);
	}

	.tag-label {
		cursor: pointer;
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		color: inherit;
	}

	.tag-text {
		cursor: default;
	}

	.tag-label:hover {
		opacity: 0.8;
	}

	.tag-remove {
		cursor: pointer;
		background: none;
		border: none;
		padding: 0;
		display: flex;
		align-items: center;
		color: inherit;
		opacity: 0.8;
		transition: opacity var(--transition-fast);
	}

	.tag-remove .icon {
		font-size: 16px;
	}

	.tag-remove:hover {
		opacity: 1;
	}
</style>
