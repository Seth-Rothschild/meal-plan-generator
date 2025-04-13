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
					console.log('Plan:', plan);
				}}
				hasResponse={true}
				/>
				<p style='white-space: pre-line;'>{plan}</p>

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
