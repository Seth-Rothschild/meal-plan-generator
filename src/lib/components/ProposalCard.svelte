<script>
	import { scale, fade } from 'svelte/transition';
	import TagPill from './TagPill.svelte';

	let { proposal, onaccept, ondismiss } = $props();

	let description = $derived(proposal.description || proposal.notes || '');
</script>

<div class="proposal-card" in:scale={{ duration: 300, start: 0.95 }} out:fade={{ duration: 200 }}>
	<div class="proposal-header">
		<h3 class="proposal-name">{proposal.name}</h3>
		{#if proposal.isStored}
			<span class="stored-badge">
				<span class="icon badge-icon">bookmark</span>
				From your meals
			</span>
		{/if}
	</div>

	{#if description}
		<p class="proposal-description">{description}</p>
	{/if}

	{#if proposal.tags?.length > 0}
		<div class="proposal-tags">
			{#each proposal.tags as tag}
				<TagPill label={tag} />
			{/each}
		</div>
	{/if}

	<div class="proposal-actions">
		<button type="button" class="btn btn-dismiss" aria-label="Skip" onclick={() => ondismiss?.()}>
			Skip
		</button>
		<button type="button" class="btn btn-accept" aria-label="Add" onclick={() => onaccept?.()}>
			{proposal.isStored ? "Let's make this!" : 'Save meal'}
		</button>
	</div>
</div>

<style>
	.proposal-card {
		background: var(--color-white);
		border-radius: var(--radius-lg);
		padding: 24px;
		box-shadow: var(--shadow-md);
		border-left: 4px solid var(--color-honey);
	}

	.proposal-header {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 10px;
	}

	.proposal-name {
		font-size: var(--font-xl);
		font-weight: 700;
		color: var(--color-charcoal);
		margin: 0;
	}

	.stored-badge {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 0.8125rem;
		font-weight: 600;
		background: var(--color-surface);
		color: var(--color-muted);
		padding: 3px 10px;
		border-radius: var(--radius-pill);
	}

	.badge-icon {
		font-size: 14px;
	}

	.proposal-description {
		font-size: var(--font-base);
		color: var(--color-muted);
		line-height: 1.5;
		margin: 0 0 14px;
	}

	.proposal-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: 18px;
	}

	.proposal-actions {
		display: flex;
		gap: 10px;
		justify-content: flex-end;
	}

	.btn {
		padding: 10px 22px;
		border-radius: var(--radius-md);
		font-size: var(--font-sm);
		font-weight: 600;
		cursor: pointer;
		transition:
			background-color var(--transition-fast),
			transform var(--transition-fast);
	}

	.btn:active {
		transform: scale(0.97);
	}

	.btn-accept {
		background-color: var(--color-sage);
		color: var(--color-white);
		border: none;
	}

	.btn-accept:hover {
		background-color: var(--color-sage-dark);
	}

	.btn-dismiss {
		background: transparent;
		color: var(--color-muted);
		border: 2px solid var(--color-border);
	}

	.btn-dismiss:hover {
		border-color: var(--color-muted);
		color: var(--color-charcoal);
	}
</style>
