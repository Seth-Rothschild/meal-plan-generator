<script>
	import Header from '$lib/components/Header.svelte';
	import Questions from '$lib/components/Questions.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import Summary from '$lib/components/Summary.svelte';
	import AsyncSubmit from '$lib/components/AsyncSubmit.svelte';
	import { surveyStore } from '$lib/stores/surveyStore.svelte.js';
	import { globalStore } from '$lib/stores/globalStore.svelte.js';

	let newQuestion = $state('');
	let sampleQuestions = [
		'What do you eat in a typical week?',
		'What are some of your favorite meals to make?',
		'What would you like to change about how you plan meals?',
		'Are there any dietary restrictions or prefences you take into account when planning meals?',
		'What are your nutritional goals in meal planning?',
		'How much time do you have to prepare meals each day?'
	].filter((q) => !surveyStore.pages.some((page) => page.initialQuestion === q));

	let currentPage = $derived(surveyStore.pages.findIndex((q) => !q.done));
	let progress = $derived.by(() => {
		if (currentPage === -1) {
			return 100;
		}
		return Math.round((currentPage / surveyStore.pages.length) * 100);
	});
</script>

<div class="layout">
	<header class="header">
		<Header />
	</header>
	<aside class="sidebar">
		<Sidebar />
	</aside>
	<main class="content">
		{#if globalStore.view === 'survey'}
			<ProgressBar {progress} />
			{#each surveyStore.pages as page, index}
				{#if index === currentPage}
					<Questions {index} />
				{/if}
			{/each}
			{#if currentPage === -1}
				<div>
					<h2>Have more preferences?</h2>
					<p>Try one of the sample conversations or create your own.</p>
					<div class="sample-questions">
						{#each sampleQuestions as sampleQuestion}
							<div class="card" onclick={() => (newQuestion = sampleQuestion)}>
								{sampleQuestion}
							</div>
						{/each}
					</div>

					<div class="submit-bar">
						<input bind:value={newQuestion} />
						<AsyncSubmit
							label="Talk More"
							onClick={() => {
								surveyStore.pages.push({
									initialQuestion: newQuestion,
									messages: [],
									summary: '',
									done: false
								});
								newQuestion = '';
								console.log('SurveyStore:', surveyStore);
							}}
							hasResponse={true}
						/>
					</div>
				</div>
			{/if}
		{:else if globalStore.view === 'summary'}
			<Summary />
		{:else}
			{globalStore.view}
		{/if}
	</main>
</div>

<style>
	.layout {
		font-family: sans-serif;
		font-size: 18px;
		margin: -8px;
		display: grid;
		grid-template-rows: 75px auto;
		grid-template-columns: 200px auto;
		height: 100vh;
	}

	.header {
		grid-column: 1 / -1;
		background-color: rgb(166, 142, 201);
		color: white;
	}

	.sidebar {
		border-right: 1px solid #ccc;
		height: calc(100vh - 75px);
	}

	.content {
		background-color: #fff;
		padding: 1rem;
	}
	.submit-bar {
		width: 100%;
		display: flex;
		gap: 0.5rem;
	}

	input {
		width: 80%;
		font-family: 'Roboto', sans-serif;
		font-size: 1rem;
		padding: 1rem;
		border: 2px solid #9c27b0;
		border-radius: 4px;
		outline: none;
		transition:
			border-color 0.3s ease,
			box-shadow 0.3s ease;
	}

	.sample-questions {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 0.5rem;
		margin-top: 1rem;
		margin-bottom: 1rem;
	}

	.card {
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 0.75rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.card:hover {
		background-color: #e0e0e0;
	}
</style>
