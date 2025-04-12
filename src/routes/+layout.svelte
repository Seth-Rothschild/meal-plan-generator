<script>
	import Header from '$lib/components/Header.svelte';
	import Questions from '$lib/components/Questions.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';

	const questions = $state([
		{
			question: 'What do you eat in a typical week?',
			summary: '',
			done: false
		},
		{
			question: 'What was your favorite thing you ate this week?',
			answer: '',
			done: false
		},
		{
			question: 'What would you like to change about how you plan meals?',
			answer: '',
			done: false
		}
	]);
	// let currentQuestion = $derived.by(() => {
	//     return questions.findIndex(q => !q.done);
	// });
	let currentQuestion = $derived(questions.findIndex((q) => !q.done));
	let progress = $derived.by(() => {
		if (currentQuestion === -1) {
			return 100;
		}
		return Math.round((currentQuestion / questions.length) * 100);
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
		<!-- <button onclick={() =>
            {
                console.log('Current question:', currentQuestion);
                console.log('Questions:', questions);
            }}>
            Debug</button> -->
		<ProgressBar {progress} />
		{#each questions as question, index}
			{#if index === currentQuestion}
				<Questions
					initialQuestion={question.question}
					bind:summary={question.summary}
					bind:done={question.done}
				/>
			{/if}
		{/each}
		{#if currentQuestion === -1}
			<div>
				<h2>Summary</h2>
				<p>{questions.map((q) => q.summary).join(', ')}</p>
			</div>
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
