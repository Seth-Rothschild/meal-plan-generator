<script>
	import { fade, fly } from 'svelte/transition';
	import { backIn } from 'svelte/easing';
	import { get } from 'svelte/store';
	import AsyncSubmit from './AsyncSubmit.svelte';

	let { initialQuestion, done = $bindable(), summary = $bindable() } = $props();
	let questions = $state([
		{
			question: initialQuestion,
			answer: ''
		}
	]);

	let messages = [
		{
			role: 'assistant',
			content: initialQuestion
		}
	];
	let visibleQuestion = $state(0);

	const getResponse = async (messages) => {
		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					messages
				})
			});
			if (!res.ok) {
				throw new Error('Network response was not ok');
			}

			let resJSON = await res.json();
			if (resJSON.error) {
				throw new Error(resJSON.error);
			}

			return resJSON.data;
		} catch (error) {
			console.error('Error:', error);
		}
	};

	const submit = async () => {
		messages.push({
			role: 'user',
			content: questions[visibleQuestion].answer
		});
		if (visibleQuestion >= 2) {
			visibleQuestion = 3;
			complete();
			return;
		}
		let message = await getResponse(messages);
		if (message) {
			messages.push({
				role: 'assistant',
				content: message
			});
			let newQuestion = {
				question: message,
				answer: ''
			};
			questions = [...questions, newQuestion];

			visibleQuestion += 1;
		} else {
			console.error('No message received');
		}
	};

	const complete = () => {
		summary = questions.map((q) => q.question + ': ' + q.answer).join(', ');
		done = true;
	};
</script>

<div class="container">
	{#each questions as question, index}
		<div class="question" in:fly={{ y: 100, duration: 800, easing: backIn }}>
			{#if index <= visibleQuestion}
				<h2>
					{question.question}
				</h2>
				<div class="question__input">
					<textarea class="answer" type="text" bind:value={question.answer}></textarea>
					{#if index === visibleQuestion}
						<AsyncSubmit label="Submit" onClick={submit} hasResponse={done} />
					{/if}
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		max-width: 500px;
		margin: 0 auto;
	}
	.question {
		width: 100%;
		margin-bottom: 2rem;
	}
	.question__input {
		width: 100%;
		display: flex;
		flex-direction: row;
		margin-top: 1rem;
		justify-content: center;
	}
	.answer {
		padding: 1rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		width: 100%;
		box-sizing: border-box;
	}

	textarea {
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

	textarea:focus {
		border-color: #7b1fa2; /* Slightly darker purple */
		box-shadow: 0 0 5px rgba(123, 31, 162, 0.5);
	}
</style>
