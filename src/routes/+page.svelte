<script>
	import { fly } from 'svelte/transition';
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import ProposalCard from '$lib/components/ProposalCard.svelte';
	import MealForm from '$lib/components/MealForm.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { invalidateAll } from '$app/navigation';

	const MEAL_COUNT = 3;
	const SLOW_CRAWL_TARGET = 0.15;

	let { data } = $props();

	let proposals = $state([]);
	let theme = $state('');
	let loadingRandom = $state(false);
	let loadingIdeas = $state(false);
	let completedCount = $state(0);
	let savingMeal = $state(null);

	let progress = new Tween(0, { duration: 600, easing: cubicOut });

	let selectedPreferences = $derived(data.preferences);

	function fetchSingleProposal(avoidNames) {
		return fetch('/api/propose', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				activeTags: [],
				preferences: selectedPreferences,
				theme,
				avoidNames
			})
		}).then((r) => r.json());
	}

	async function proposeRandom() {
		loadingRandom = true;
		proposals = [];
		let response = await fetch('/api/propose/random', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ activeTags: [] })
		});
		let result = await response.json();
		loadingRandom = false;
		if (result.meal) {
			proposals = [result.meal];
		}
	}

	async function proposeNewIdeas() {
		loadingIdeas = true;
		proposals = [];
		completedCount = 0;
		progress.target = SLOW_CRAWL_TARGET;

		let collectedNames = [];
		let promises = [];

		for (let i = 0; i < MEAL_COUNT; i++) {
			let promise = fetchSingleProposal(collectedNames).then((result) => {
				completedCount++;
				progress.target = completedCount / MEAL_COUNT;
				if (result.proposal) {
					collectedNames.push(result.proposal.name);
					proposals = [...proposals, result.proposal];
				}
			});
			promises.push(promise);
		}

		await Promise.all(promises);
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
	<div class="hero" in:fly={{ y: 20, duration: 400 }}>
		<h1 class="hero-title">What's for dinner?</h1>
		<p class="hero-subtitle">Describe a theme or just hit generate for inspiration.</p>
	</div>

	<div class="input-section" in:fly={{ y: 20, duration: 300, delay: 100 }}>
		<div class="theme-input">
			<input
				type="text"
				bind:value={theme}
				placeholder="Quick Italian weeknight, comfort food, something spicy..."
				onkeydown={(e) => { if (e.key === 'Enter' && !loadingIdeas) proposeNewIdeas(); }}
			/>
		</div>
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
				{loadingRandom ? 'Picking...' : 'Pick from my meals'}
			</button>
		{/if}
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

	.hero {
		text-align: center;
		padding: 40px 0 8px;
	}

	.hero-title {
		font-size: 2.75rem;
		font-weight: 800;
		color: var(--color-charcoal);
		margin-bottom: 10px;
	}

	.hero-subtitle {
		font-size: var(--font-lg);
		color: var(--color-muted);
		max-width: 440px;
		margin: 0 auto;
		line-height: 1.6;
	}

	.input-section {
		display: flex;
		flex-direction: column;
		gap: 12px;
		max-width: 560px;
		margin: 0 auto;
		width: 100%;
	}

	.theme-input input {
		width: 100%;
		padding: 16px 20px;
		border: 2px solid var(--color-border);
		border-radius: var(--radius-lg);
		font-size: var(--font-lg);
		color: var(--color-charcoal);
		background: var(--color-white);
		transition: border-color var(--transition-fast);
	}

	.theme-input input:focus {
		outline: none;
		border-color: var(--color-sage);
	}

	.generate-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 18px 24px;
		border-radius: var(--radius-lg);
		font-size: var(--font-lg);
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
		padding: 10px 16px;
		border-radius: var(--radius-md);
		font-size: var(--font-sm);
		font-weight: 600;
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
		font-size: 18px;
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
