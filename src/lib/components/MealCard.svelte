<script>
	import TagPill from './TagPill.svelte';

	let { meal, onedit, ondelete, ongeneratedetails } = $props();

	let generating = $state(false);

	async function handleGenerateDetails() {
		generating = true;
		await ongeneratedetails?.();
		generating = false;
	}
</script>

<div class="meal-card">
	<div class="card-header">
		<h3 class="card-title">{meal.name}</h3>
		<div class="card-actions">
			<button
				type="button"
				class="action-btn"
				aria-label="Generate details"
				title={meal.notes ? 'Regenerate details' : 'Generate details'}
				onclick={handleGenerateDetails}
				disabled={generating}
			>
				<span class="icon">{generating ? 'hourglass_empty' : 'auto_awesome'}</span>
			</button>
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
	{#if meal.tags.length > 0}
		<div class="card-tags">
			{#each meal.tags as tag}
				<TagPill label={tag} />
			{/each}
		</div>
	{/if}
	{#if generating}
		<div class="generating-indicator">
			<span class="dot"></span>
			<span class="dot"></span>
			<span class="dot"></span>
		</div>
	{:else if meal.notes}
		<p class="card-notes">{meal.notes}</p>
	{/if}
</div>

<style>
	.meal-card {
		background: var(--color-white);
		border-radius: var(--radius-lg);
		padding: 22px;
		box-shadow: var(--shadow-sm);
		transition:
			transform var(--transition-normal),
			box-shadow var(--transition-normal);
	}

	.meal-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 12px;
	}

	.card-title {
		font-size: var(--font-lg);
		font-weight: 700;
		color: var(--color-charcoal);
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

	.card-notes {
		margin-top: 14px;
		font-size: var(--font-sm);
		color: var(--color-muted);
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.generating-indicator {
		display: flex;
		gap: 6px;
		margin-top: 14px;
		padding: 4px 0;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: var(--color-sage);
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
