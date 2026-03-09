<script>
	import TagPill from './TagPill.svelte';

	let { snippet, onedit, ondelete } = $props();
</script>

<div class="snippet-card">
	<div class="card-header">
		<p class="card-text">{snippet.text}</p>
		<div class="card-actions">
			<button type="button" class="action-btn" aria-label="Edit" onclick={() => onedit?.()}>
				<span class="icon">edit</span>
			</button>
			<button
				type="button"
				class="action-btn action-btn-danger"
				aria-label="Delete"
				onclick={() => ondelete?.()}
			>
				<span class="icon">delete</span>
			</button>
		</div>
	</div>
	{#if snippet.tags.length > 0}
		<div class="card-tags">
			{#each snippet.tags as tag}
				<TagPill label={tag} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.snippet-card {
		background: var(--color-white);
		border-radius: var(--radius-lg);
		padding: 22px;
		box-shadow: var(--shadow-sm);
		transition:
			transform var(--transition-normal),
			box-shadow var(--transition-normal);
	}

	.snippet-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 12px;
	}

	.card-text {
		font-size: var(--font-base);
		color: var(--color-charcoal);
		line-height: 1.5;
		margin: 0;
	}

	.card-actions {
		display: flex;
		gap: 2px;
		flex-shrink: 0;
	}

	.action-btn {
		padding: 6px;
		border: none;
		background: none;
		cursor: pointer;
		border-radius: var(--radius-sm);
		color: var(--color-muted);
		transition:
			background-color var(--transition-fast),
			color var(--transition-fast);
	}

	.action-btn .icon {
		font-size: 20px;
	}

	.action-btn:hover {
		background-color: var(--color-surface);
		color: var(--color-charcoal);
	}

	.action-btn-danger:hover {
		background-color: var(--color-danger-light);
		color: var(--color-danger);
	}

	.card-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 12px;
	}
</style>
