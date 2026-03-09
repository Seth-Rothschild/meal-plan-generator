<script>
	import { fly } from 'svelte/transition';
	import { invalidateAll } from '$app/navigation';
	import TagBar from '$lib/components/TagBar.svelte';
	import SnippetCard from '$lib/components/SnippetCard.svelte';
	import SnippetForm from '$lib/components/SnippetForm.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';

	let { data } = $props();

	let activeTags = $state([]);
	let showCreateModal = $state(false);
	let editingSnippet = $state(null);

	let filteredPreferences = $derived(
		activeTags.length === 0
			? data.preferences
			: data.preferences.filter((pref) => pref.tags.some((tag) => activeTags.includes(tag)))
	);

	function toggleTag(tag) {
		if (activeTags.includes(tag)) {
			activeTags = activeTags.filter((t) => t !== tag);
		} else {
			activeTags = [...activeTags, tag];
		}
	}

	async function handleCreate(snippetData) {
		await fetch('/api/preferences', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(snippetData)
		});
		showCreateModal = false;
		await invalidateAll();
	}

	async function handleEdit(snippetData) {
		await fetch(`/api/preferences/${editingSnippet.id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(snippetData)
		});
		editingSnippet = null;
		await invalidateAll();
	}

	async function handleDelete(snippet) {
		await fetch(`/api/preferences/${snippet.id}`, { method: 'DELETE' });
		await invalidateAll();
	}
</script>

<div class="preferences-page">
	<div class="page-header">
		<h1>Preferences</h1>
		<button type="button" class="fab" onclick={() => (showCreateModal = true)}>
			<span class="icon fab-icon">add</span>
			Add preference
		</button>
	</div>

	{#if data.allTags.length > 0}
		<TagBar tags={data.allTags} {activeTags} ontoggle={toggleTag} />
	{/if}

	{#if filteredPreferences.length === 0}
		<EmptyState message="No preferences saved. Start a conversation to discover yours!" />
	{:else}
		<div class="preferences-list">
			{#each filteredPreferences as snippet, index (snippet.id)}
				<div in:fly={{ y: 20, duration: 300, delay: index * 50 }}>
					<SnippetCard
						{snippet}
						onedit={() => (editingSnippet = snippet)}
						ondelete={() => handleDelete(snippet)}
					/>
				</div>
			{/each}
		</div>
	{/if}
</div>

<Modal open={showCreateModal} onclose={() => (showCreateModal = false)} label="New preference">
	<h2>New preference</h2>
	<SnippetForm
		allTags={data.allTags}
		onsubmit={handleCreate}
		oncancel={() => (showCreateModal = false)}
	/>
</Modal>

<Modal open={editingSnippet !== null} onclose={() => (editingSnippet = null)} label="Edit preference">
	<h2>Edit preference</h2>
	{#if editingSnippet}
		<SnippetForm
			snippet={editingSnippet}
			allTags={data.allTags}
			onsubmit={handleEdit}
			oncancel={() => (editingSnippet = null)}
		/>
	{/if}
</Modal>

<style>
	.preferences-page {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.fab {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 12px 22px;
		background-color: var(--color-sage);
		color: var(--color-white);
		border: none;
		border-radius: var(--radius-md);
		font-size: var(--font-sm);
		font-weight: 600;
		cursor: pointer;
		transition:
			background-color var(--transition-fast),
			transform var(--transition-fast),
			box-shadow var(--transition-fast);
		box-shadow: 0 2px 8px rgba(125, 155, 118, 0.3);
	}

	.fab-icon {
		font-size: 20px;
	}

	.fab:hover {
		background-color: var(--color-sage-dark);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(125, 155, 118, 0.4);
	}

	.fab:active {
		transform: scale(0.97);
	}

	.preferences-list {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
</style>
