<script>
	import { globalStore } from '$lib/stores/globalStore.svelte';
	import { surveyStore } from '$lib/stores/surveyStore.svelte';
	import Home from '$lib/components/Home.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import StartConversation from '$lib/components/StartConversation.svelte';
	import Questions from '$lib/components/Questions.svelte';
	import Summary from '$lib/components/Summary.svelte';

	let currentPage = $derived(surveyStore.pages.findIndex((q) => !q.done));
	let progress = $derived.by(() => {
		if (currentPage === -1) {
			return 100;
		}
		return Math.round((currentPage / surveyStore.pages.length) * 100);
	});
</script>

{#if globalStore.view === 'home'}
	<Home />
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
