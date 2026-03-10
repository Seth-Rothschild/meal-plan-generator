<script>
	import { fly } from 'svelte/transition';
	import { invalidateAll } from '$app/navigation';
	import EmptyState from '$lib/components/EmptyState.svelte';

	let { data } = $props();

	let editingTag = $state(null);
	let editValue = $state('');
	let saving = $state(false);

	function startEditing(tag) {
		editingTag = tag;
		editValue = tag;
	}

	function cancelEditing() {
		editingTag = null;
		editValue = '';
	}

	async function saveRename() {
		let trimmed = editValue.trim();
		if (!trimmed || trimmed === editingTag) {
			cancelEditing();
			return;
		}
		saving = true;
		await fetch(`/api/tags/${encodeURIComponent(editingTag)}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: trimmed })
		});
		saving = false;
		editingTag = null;
		editValue = '';
		await invalidateAll();
	}

	async function handleDelete(tag) {
		await fetch(`/api/tags/${encodeURIComponent(tag)}`, { method: 'DELETE' });
		await invalidateAll();
	}

	function handleKeydown(event) {
		if (event.key === 'Enter') {
			saveRename();
		} else if (event.key === 'Escape') {
			cancelEditing();
		}
	}
</script>

<div class="settings-page">
	<h1>Settings</h1>

	<section class="tags-section">
		<h2>Manage Tags</h2>
		<p class="section-hint">
			Rename or delete tags. Changes apply to all meals and preferences using that tag.
		</p>

		{#if data.allTags.length === 0}
			<EmptyState message="No tags yet. Tags are created when you add meals or preferences." />
		{:else}
			<div class="tag-list">
				{#each data.allTags as tag (tag)}
					<div class="tag-row" in:fly={{ y: 10, duration: 200 }}>
						{#if editingTag === tag}
							<div class="tag-edit-row">
								<input
									type="text"
									class="tag-edit-input"
									bind:value={editValue}
									onkeydown={handleKeydown}
									disabled={saving}
								/>
								<button
									type="button"
									class="action-btn action-btn-save"
									aria-label="Save"
									onclick={saveRename}
									disabled={saving}
								>
									<span class="icon">check</span>
								</button>
								<button
									type="button"
									class="action-btn"
									aria-label="Cancel"
									onclick={cancelEditing}
								>
									<span class="icon">close</span>
								</button>
							</div>
						{:else}
							<span class="tag-name">{tag}</span>
							<div class="tag-actions">
								<button
									type="button"
									class="action-btn"
									aria-label="Rename tag"
									onclick={() => startEditing(tag)}
								>
									<span class="icon">edit</span>
								</button>
								<button
									type="button"
									class="action-btn action-btn-danger"
									aria-label="Delete tag"
									onclick={() => handleDelete(tag)}
								>
									<span class="icon">delete</span>
								</button>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</section>
</div>

<style>
	.settings-page {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.tags-section {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.tags-section h2 {
		font-size: var(--font-lg);
	}

	.section-hint {
		font-size: var(--font-sm);
		color: var(--color-muted);
	}

	.tag-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.tag-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		background: var(--color-white);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
	}

	.tag-name {
		font-size: var(--font-base);
		font-weight: 600;
		color: var(--color-charcoal);
	}

	.tag-actions {
		display: flex;
		gap: 2px;
	}

	.tag-edit-row {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
	}

	.tag-edit-input {
		flex: 1;
		padding: 8px 12px;
		border: 2px solid var(--color-sage);
		border-radius: var(--radius-md);
		font-size: var(--font-base);
		color: var(--color-charcoal);
		background: var(--color-white);
	}

	.tag-edit-input:focus {
		outline: none;
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

	.action-btn-save:hover {
		background-color: #f4f9f3;
		color: var(--color-sage);
	}

	.action-btn-danger:hover {
		background-color: var(--color-danger-light);
		color: var(--color-danger);
	}
</style>
