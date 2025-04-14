<script>
	import { fade, fly } from 'svelte/transition';
	import { backIn } from 'svelte/easing';
	import { get } from 'svelte/store';
	import AsyncSubmit from './AsyncSubmit.svelte';
	import { surveyStore } from '$lib/stores/surveyStore.svelte.js';
	import { getResponse, addHistory } from '$lib/helpers.svelte.js';

	const handleKeyDown = (event) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			hasResponse = false;
			submit();
		}
	};
	let { index } = $props();

	let hasResponse = $state(true);

	let numberOfQuestions = Math.floor(Math.random() * 2) + 3;
	let questions = $state([
		{
			question: surveyStore.pages[index].initialQuestion,
			answer: ''
		}
	]);

	if (!surveyStore.pages[index].messages.length) {
		surveyStore.pages[index].messages = [
			{
				role: 'assistant',
				content: surveyStore.pages[index].initialQuestion
			}
		];
	}
	let visibleQuestion = $state(0);

	if (surveyStore.pages[index].messages.length > 1) {
		visibleQuestion = surveyStore.pages[index].messages.length - 1;
		questions = surveyStore.pages[index].messages.reduce((acc, message, i) => {
			if (message.role === 'assistant') {
				acc.push({
					question: message.content,
					answer:
						surveyStore.pages[index].messages[i + 1]?.role === 'user'
							? surveyStore.pages[index].messages[i + 1].content
							: ''
				});
			}
			return acc;
		}, []);
	}

	const submit = async () => {
		surveyStore.pages[index].messages.push({
			role: 'user',
			content: questions[visibleQuestion].answer
		});
		if (visibleQuestion >= numberOfQuestions - 1) {
			visibleQuestion = numberOfQuestions;
			surveyStore.pages[index].done = true;
			surveyStore.pages[index].summary = await getResponse(
				surveyStore.pages[index].messages,
				'summarize'
			);
			console.log('SurveyStore:', surveyStore);
			return;
		}
		let message = await getResponse(addHistory(surveyStore.pages[index].messages), 'ask');
		if (message) {
			surveyStore.pages[index].messages.push({
				role: 'assistant',
				content: message
			});
			let newQuestion = {
				question: message,
				answer: ''
			};
			questions = [...questions, newQuestion];
			hasResponse = true;

			visibleQuestion += 1;
		} else {
			console.error('No message received');
		}
	};
	$effect(() => {
		if (document.getElementById(`answer-${visibleQuestion}`)) {
			document.getElementById(`answer-${visibleQuestion}`).focus();
		}
	});
</script>

<div class="container">
	{#each questions as question, index}
		<div class="question" in:fly={{ y: 100, duration: 800, easing: backIn }}>
			{#if index <= visibleQuestion}
				<h2>
					{question.question}
				</h2>
				<div class="question__input">
					<textarea
						id={`answer-${index}`}
						onkeydown={handleKeyDown}
						class="answer"
						type="text"
						bind:value={question.answer}
					></textarea>
					{#if index === visibleQuestion}
						<AsyncSubmit label="Submit" onClick={submit} {hasResponse} />
					{/if}
				</div>
			{/if}
		</div>
	{/each}
</div>
{#if visibleQuestion >= numberOfQuestions && !surveyStore.pages[index].done}
	<AsyncSubmit
		label="Update"
		onClick={async () => {
			const messages = questions.reduce((acc, qa) => {
				acc.push({ role: 'assistant', content: qa.question }, { role: 'user', content: qa.answer });
				return acc;
			}, []);
			surveyStore.pages[index].messages = messages;
			surveyStore.pages[index].summary = await getResponse(messages, 'summarize');
			surveyStore.pages[index].done = true;
		}}
		hasResponse={true}
	/>
{/if}

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		max-width: 800px;
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
		resize: none;
		min-height: fit-content;
	}

	textarea:focus {
		border-color: #7b1fa2; /* Slightly darker purple */
		box-shadow: 0 0 5px rgba(123, 31, 162, 0.5);
	}
</style>
