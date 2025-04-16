<script>
	import { surveyStore } from '$lib/stores/surveyStore.svelte';
	import AsyncSubmit from '$lib/components/AsyncSubmit.svelte';
	let newQuestion = $state('');
	let sampleQuestions = [
		'What do you eat in a typical week?',
		'What are some of your favorite meals to make?',
		'What would you like to change about how you plan meals?',
		'Are there any dietary restrictions or prefences you take into account when planning meals?',
		'What are your nutritional goals in meal planning?',
		'How much time do you have to prepare meals each day?'
	].filter((q) => !surveyStore.pages.some((page) => page.initialQuestion === q));

	let submit = () => {
		surveyStore.pages.push({
			initialQuestion: newQuestion,
			messages: [],
			summary: '',
			done: false
		});
		newQuestion = '';
	};
</script>

<div>
	<h2>Have {surveyStore.pages.length > 0 ? 'more ' : ''}preferences?</h2>
	<p>Try one of the sample conversations or create your own.</p>
	<div class="sample-questions">
		{#each sampleQuestions as sampleQuestion}
			<div
				class="card"
				onclick={() => {
					newQuestion = sampleQuestion;
					submit();
				}}
			>
				{sampleQuestion}
			</div>
		{/each}
	</div>

	<div class="submit-bar">
		<input bind:value={newQuestion} />
		<AsyncSubmit label="Talk More" onClick={submit} disabled={!newQuestion} hasResponse={true} />
	</div>
</div>

<style>
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
