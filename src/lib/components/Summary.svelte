<script>
	import { surveyStore } from '$lib/stores/surveyStore.svelte';
	import { globalStore } from '$lib/stores/globalStore.svelte';
	import StartConversation from './StartConversation.svelte';
</script>

<div class="container">
	{#each surveyStore.pages as page, index}
		{#if surveyStore.pages[index].done}
			<div class="card">
				<h3>{page.initialQuestion}</h3>
				<p>{page.summary}</p>
				<div style="display: flex; gap: 0.5rem;">
					<button
						onclick={() => {
							globalStore.view = 'survey';
							surveyStore.pages[index].done = false;
						}}>Edit</button
					>
					<button
						onclick={() => {
							surveyStore.pages.splice(index, 1);
							if (surveyStore.pages.length === 0) {
								globalStore.view = 'survey';
							}
						}}>Delete</button
					>
				</div>
			</div>
		{/if}
	{/each}
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}
	.card {
		border: 1px solid #ccc;
		padding: 2rem;
		padding-top: 0.25rem;
		margin-bottom: 1rem;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: box-shadow 0.3s ease;
		max-width: 800px;
	}

	.card:hover {
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	button {
		background: transparent;
		color: #9c27b0; /* Light purple */
		border: 2px solid #9c27b0;
		border-radius: 4px;
		padding: 0.5rem 1rem;
		font-size: 1rem;
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			color 0.2s ease,
			transform 0.2s ease;
		width: 100px;
	}

	button:hover {
		background-color: #e1bee7; /* Subtler light purple */
		color: #6a1b9a; /* Darker purple */
		transform: scale(1.05);
	}

	button:active {
		transform: scale(0.95);
	}
</style>
