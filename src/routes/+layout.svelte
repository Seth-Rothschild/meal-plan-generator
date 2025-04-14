<script>
	import Header from '$lib/components/Header.svelte';
	import Questions from '$lib/components/Questions.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import Summary from '$lib/components/Summary.svelte';
	import StartConversation from '$lib/components/StartConversation.svelte';
	import { surveyStore } from '$lib/stores/surveyStore.svelte.js';
	import { globalStore } from '$lib/stores/globalStore.svelte.js';
	import { getResponse, addHistory } from '$lib/helpers.svelte.js';
	import AsyncSubmit from '$lib/components/AsyncSubmit.svelte';

	let plan = $state('');
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
		{#if globalStore.view === 'home'}
			<h2>Welcome to the Meal Planning Assistant</h2>
			<p>This will generate a meal plan for you based on your preferences.</p>
			<AsyncSubmit
				label="Go"
				onClick={async () => {
					plan = await getResponse(addHistory([]), 'plan');
				}}
				hasResponse={true}
			/>
			{#if plan}
				<div class="plan">
					{#each plan.split('\n\n') as day}
						<div class="day">
							{#each day.split('\n') as line, i}
								{#if i === 0}
									<p><strong>{line}</strong></p>
								{:else if line != ''}
									<p>{line}</p>
								{/if}
							{/each}
						</div>
					{/each}
				</div>
			{/if}
		{:else if globalStore.view === 'survey'}
			<ProgressBar {progress} />
			{#if currentPage === -1}
				<StartConversation />
			{/if}
			{#each surveyStore.pages as page, index}
				{#if index === currentPage}
					<Questions {index} />
				{/if}
			{/each}
		{:else if globalStore.view === 'summary'}
			<Summary />
		{:else}
			{globalStore.view}
		{/if}
	</main>
</div>

<style>
	.plan {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		align-items: left;
		width: 100%;
	}
	.day {
		border: 1px solid #ccc;
		padding: 2rem;
		padding-top: 0.25rem;
		margin-bottom: 1rem;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: box-shadow 0.3s ease;
		width: 800px;
	}
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
</style>
