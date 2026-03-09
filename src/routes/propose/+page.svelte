<script>
	import { fly } from 'svelte/transition';
	import TagBar from '$lib/components/TagBar.svelte';
	import ProposalCard from '$lib/components/ProposalCard.svelte';
	import MealForm from '$lib/components/MealForm.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	let activeTags = $state([]);
	let proposals = $state([]);
	let loadingRandom = $state(false);
	let loadingIdeas = $state(false);
	let savingMeal = $state(null);
	let enabledPreferenceIds = $state(new Set());

	let allPrefsEnabled = $derived(
		data.preferences.length > 0 && enabledPreferenceIds.size === data.preferences.length
	);

	let selectedPreferences = $derived(
		data.preferences.filter((p) => enabledPreferenceIds.has(p.id))
	);

	function togglePreference(id) {
		let next = new Set(enabledPreferenceIds);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		enabledPreferenceIds = next;
	}

	function toggleAllPreferences() {
		if (allPrefsEnabled) {
			enabledPreferenceIds = new Set();
		} else {
			enabledPreferenceIds = new Set(data.preferences.map((p) => p.id));
		}
	}

	function toggleTag(tag) {
		if (activeTags.includes(tag)) {
			activeTags = activeTags.filter((t) => t !== tag);
		} else {
			activeTags = [...activeTags, tag];
		}
	}

	async function proposeRandom() {
		loadingRandom = true;
		let response = await fetch('/api/propose/random', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ activeTags })
		});
		let result = await response.json();
		loadingRandom = false;
		if (result.meal) {
			proposals = [result.meal];
		}
	}

	async function proposeNewIdeas() {
		loadingIdeas = true;
		let response = await fetch('/api/propose', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				activeTags,
				preferences: selectedPreferences
			})
		});
		let result = await response.json();
		loadingIdeas = false;
		if (result.proposals) {
			proposals = [...result.proposals, ...proposals];
		}
	}

	function dismissProposal(index) {
		proposals = proposals.filter((_, i) => i !== index);
	}

	function acceptProposal(proposal) {
		if (proposal.isStored) {
			proposals = proposals.filter((p) => p !== proposal);
		} else {
			savingMeal = proposal;
		}
	}

	async function handleSaveMeal(mealData) {
		await fetch('/api/meals', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(mealData)
		});
		proposals = proposals.filter((p) => p !== savingMeal);
		savingMeal = null;
		await invalidateAll();
	}
</script>

<div class="propose-page">
	<h1>Propose a Meal</h1>

	{#if data.preferences.length > 0}
		<section class="preferences-section">
			<div class="section-header">
				<h2>Preferences to include</h2>
				<button type="button" class="toggle-all-btn" onclick={toggleAllPreferences}>
					{allPrefsEnabled ? 'Deselect all' : 'Select all'}
				</button>
			</div>
			<p class="section-hint">
				Toggle on the preferences you want the AI to consider.
				{#if selectedPreferences.length > 0}
					<strong>{selectedPreferences.length}</strong> selected.
				{:else}
					None selected.
				{/if}
			</p>
			<div class="preference-cards">
				{#each data.preferences as pref (pref.id)}
					<button
						type="button"
						class="pref-card"
						class:enabled={enabledPreferenceIds.has(pref.id)}
						onclick={() => togglePreference(pref.id)}
					>
						<div class="pref-toggle">
							<span class="icon toggle-icon">
								{enabledPreferenceIds.has(pref.id) ? 'check_circle' : 'radio_button_unchecked'}
							</span>
						</div>
						<div class="pref-content">
							<p class="pref-text">{pref.text}</p>
							{#if pref.tags.length > 0}
								<div class="pref-tags">
									{#each pref.tags as tag}
										<span class="pref-tag">{tag}</span>
									{/each}
								</div>
							{/if}
						</div>
					</button>
				{/each}
			</div>
		</section>
	{/if}

	{#if data.allTags.length > 0}
		<section class="tags-section">
			<h2>Add tags</h2>
			<TagBar tags={data.allTags} {activeTags} ontoggle={toggleTag} />
		</section>
	{/if}

	<div class="actions-row">
		<button
			type="button"
			class="propose-btn stored"
			onclick={proposeRandom}
			disabled={loadingRandom || data.meals.length === 0}
		>
			<span class="icon btn-icon">casino</span>
			{loadingRandom ? 'Picking...' : 'From my meals'}
		</button>
		<button
			type="button"
			class="propose-btn ideas"
			onclick={proposeNewIdeas}
			disabled={loadingIdeas}
		>
			<span class="icon btn-icon">auto_awesome</span>
			{loadingIdeas ? 'Thinking...' : 'New ideas'}
		</button>
	</div>

	{#if proposals.length === 0}
		<EmptyState message="Hit a button above to get meal ideas!" />
	{:else}
		<div class="proposals-list">
			{#each proposals as proposal, index (proposal.name + index)}
				<div in:fly={{ y: 20, duration: 300, delay: index * 80 }}>
					<ProposalCard
						{proposal}
						onaccept={() => acceptProposal(proposal)}
						ondismiss={() => dismissProposal(index)}
					/>
				</div>
			{/each}
		</div>
	{/if}
</div>

<Modal open={savingMeal !== null} onclose={() => (savingMeal = null)} label="Save as meal">
	<h2>Save as meal</h2>
	{#if savingMeal}
		<MealForm
			meal={{
				name: savingMeal.name,
				tags: savingMeal.tags || [],
				notes: savingMeal.description || ''
			}}
			allTags={data.allTags}
			onsubmit={handleSaveMeal}
			oncancel={() => (savingMeal = null)}
		/>
	{/if}
</Modal>

<style>
	.propose-page {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.preferences-section {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.section-header h2 {
		font-size: var(--font-lg);
	}

	.section-hint {
		font-size: var(--font-sm);
		color: var(--color-muted);
	}

	.toggle-all-btn {
		padding: 8px 16px;
		border-radius: var(--radius-md);
		font-size: var(--font-sm);
		font-weight: 600;
		color: var(--color-sage);
		background: transparent;
		border: 2px solid var(--color-sage);
		cursor: pointer;
		transition:
			background-color var(--transition-fast),
			color var(--transition-fast);
	}

	.toggle-all-btn:hover {
		background-color: var(--color-sage);
		color: var(--color-white);
	}

	.preference-cards {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.pref-card {
		display: flex;
		gap: 14px;
		align-items: flex-start;
		padding: 16px;
		background: var(--color-white);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		text-align: left;
		transition:
			border-color var(--transition-fast),
			background-color var(--transition-fast),
			box-shadow var(--transition-fast);
	}

	.pref-card:hover {
		border-color: var(--color-sage);
	}

	.pref-card.enabled {
		border-color: var(--color-sage);
		background-color: #f4f9f3;
		box-shadow: var(--shadow-sm);
	}

	.pref-toggle {
		flex-shrink: 0;
		padding-top: 2px;
	}

	.toggle-icon {
		font-size: 22px;
		color: var(--color-border);
		transition: color var(--transition-fast);
	}

	.pref-card.enabled .toggle-icon {
		color: var(--color-sage);
	}

	.pref-content {
		flex: 1;
		min-width: 0;
	}

	.pref-text {
		font-size: var(--font-sm);
		color: var(--color-charcoal);
		line-height: 1.4;
	}

	.pref-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin-top: 8px;
	}

	.pref-tag {
		padding: 2px 8px;
		border-radius: var(--radius-pill);
		background-color: var(--color-surface);
		color: var(--color-muted);
		font-size: 0.8125rem;
		font-weight: 600;
	}

	.tags-section {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.tags-section h2 {
		font-size: var(--font-lg);
	}

	.actions-row {
		display: flex;
		gap: 12px;
	}

	.propose-btn {
		flex: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 18px 24px;
		border-radius: var(--radius-lg);
		font-size: var(--font-base);
		font-weight: 700;
		cursor: pointer;
		border: none;
		transition:
			background-color var(--transition-fast),
			transform var(--transition-fast),
			box-shadow var(--transition-fast);
	}

	.btn-icon {
		font-size: 22px;
	}

	.propose-btn:active {
		transform: scale(0.97);
	}

	.propose-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	.propose-btn.stored {
		background-color: var(--color-terracotta);
		color: var(--color-white);
		box-shadow: 0 2px 8px rgba(198, 125, 91, 0.3);
	}

	.propose-btn.stored:hover:not(:disabled) {
		background-color: #b06a48;
		box-shadow: 0 4px 12px rgba(198, 125, 91, 0.4);
	}

	.propose-btn.ideas {
		background-color: var(--color-honey);
		color: var(--color-charcoal);
		box-shadow: 0 2px 8px rgba(232, 184, 75, 0.3);
	}

	.propose-btn.ideas:hover:not(:disabled) {
		background-color: #d4a43a;
		box-shadow: 0 4px 12px rgba(232, 184, 75, 0.4);
	}

	.proposals-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
</style>
