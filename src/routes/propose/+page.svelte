<script>
	import { fly } from 'svelte/transition';
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import TagBar from '$lib/components/TagBar.svelte';
	import ProposalCard from '$lib/components/ProposalCard.svelte';
	import MealForm from '$lib/components/MealForm.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { invalidateAll } from '$app/navigation';

	const MEAL_COUNT = 3;
	const SLOW_CRAWL_TARGET = 0.15;

	let { data } = $props();

	let activeTags = $state([]);
	let proposals = $state([]);
	let theme = $state('');
	let loadingRandom = $state(false);
	let loadingIdeas = $state(false);
	let completedCount = $state(0);
	let savingMeal = $state(null);
	let enabledPreferenceIds = $state(new Set(data.preferences.map((p) => p.id)));

	let progress = new Tween(0, { duration: 600, easing: cubicOut });

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
		proposals = [];
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

	function fetchSingleProposal(avoidNames) {
		return fetch('/api/propose', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				activeTags,
				preferences: selectedPreferences,
				theme,
				avoidNames
			})
		}).then((r) => r.json());
	}

	async function proposeNewIdeas() {
		loadingIdeas = true;
		proposals = [];
		completedCount = 0;
		progress.target = SLOW_CRAWL_TARGET;

		let collectedNames = [];

		for (let i = 0; i < MEAL_COUNT; i++) {
			let result = await fetchSingleProposal(collectedNames);
			completedCount++;
			progress.target = completedCount / MEAL_COUNT;
			if (result.proposal) {
				collectedNames.push(result.proposal.name);
				proposals = [...proposals, result.proposal];
			}
		}

		loadingIdeas = false;
		progress.target = 0;
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

	<div class="input-section">
		<div class="theme-input">
			<input
				type="text"
				bind:value={theme}
				placeholder="Quick Italian weeknight, comfort food, something spicy..."
				onkeydown={(e) => { if (e.key === 'Enter' && !loadingIdeas) proposeNewIdeas(); }}
			/>
		</div>
		<div class="actions-row">
			<button
				type="button"
				class="generate-btn"
				onclick={proposeNewIdeas}
				disabled={loadingIdeas}
			>
				<span class="icon btn-icon">auto_awesome</span>
				{loadingIdeas ? 'Generating...' : 'Generate ideas'}
			</button>
			{#if data.meals.length > 0}
				<button
					type="button"
					class="random-btn"
					onclick={proposeRandom}
					disabled={loadingRandom}
				>
					<span class="icon btn-icon-sm">casino</span>
					{loadingRandom ? 'Picking...' : 'From my meals'}
				</button>
			{/if}
		</div>
	</div>

	{#if loadingIdeas}
		<div class="progress-section">
			<div class="progress-bar">
				<div class="progress-fill" style="width: {progress.current * 100}%"></div>
			</div>
			<p class="progress-text">
				{completedCount === 0
					? 'Generating meal ideas...'
					: `${completedCount} of ${MEAL_COUNT} meals ready`}
			</p>
		</div>
	{/if}

	{#if loadingRandom}
		<div class="progress-section">
			<p class="progress-text">Picking a meal...</p>
		</div>
	{/if}

	{#if proposals.length > 0}
		<div class="proposals-list">
			{#each proposals as proposal, index (proposal.name + index)}
				<div in:fly={{ y: 20, duration: 300 }}>
					<ProposalCard
						{proposal}
						onaccept={() => acceptProposal(proposal)}
						ondismiss={() => dismissProposal(index)}
					/>
				</div>
			{/each}
		</div>
	{:else if !loadingIdeas && !loadingRandom}
		<EmptyState message="Hit generate to get meal ideas!" />
	{/if}

	{#if data.allTags.length > 0}
		<section class="tags-section">
			<h2>Add tags</h2>
			<TagBar tags={data.allTags} {activeTags} ontoggle={toggleTag} />
		</section>
	{/if}

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

	.input-section {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.theme-input input {
		width: 100%;
		padding: 14px 16px;
		border: 2px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--font-base);
		color: var(--color-charcoal);
		background: var(--color-white);
		transition: border-color var(--transition-fast);
	}

	.theme-input input:focus {
		outline: none;
		border-color: var(--color-sage);
	}

	.actions-row {
		display: flex;
		gap: 12px;
	}

	.generate-btn {
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
		background-color: var(--color-sage);
		color: var(--color-white);
		box-shadow: 0 2px 8px rgba(125, 155, 118, 0.3);
		transition:
			background-color var(--transition-fast),
			transform var(--transition-fast),
			box-shadow var(--transition-fast);
	}

	.generate-btn:hover:not(:disabled) {
		background-color: var(--color-sage-dark);
		box-shadow: 0 4px 12px rgba(125, 155, 118, 0.4);
	}

	.generate-btn:active:not(:disabled) {
		transform: scale(0.97);
	}

	.generate-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-icon {
		font-size: 22px;
	}

	.random-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 18px 24px;
		border-radius: var(--radius-lg);
		font-size: var(--font-base);
		font-weight: 700;
		cursor: pointer;
		border: 2px solid var(--color-border);
		background: transparent;
		color: var(--color-muted);
		transition:
			border-color var(--transition-fast),
			color var(--transition-fast);
	}

	.random-btn:hover:not(:disabled) {
		border-color: var(--color-sage);
		color: var(--color-charcoal);
	}

	.random-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-icon-sm {
		font-size: 20px;
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

	.progress-section {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.progress-bar {
		width: 100%;
		height: 8px;
		background-color: var(--color-surface);
		border-radius: var(--radius-pill);
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background-color: var(--color-sage);
		border-radius: var(--radius-pill);
		transition: width 0.1s linear;
	}

	.progress-text {
		font-size: var(--font-sm);
		color: var(--color-muted);
		text-align: center;
	}

	.proposals-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
</style>
