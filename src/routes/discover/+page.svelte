<script>
	import { goto } from '$app/navigation';
	import { fly } from 'svelte/transition';

	let messages = $state([]);
	let loading = $state(false);
	let doneSnippets = $state(null);
	let savingIndex = $state(-1);
	let savedIndexes = $state(new Set());
	let currentAnswer = $state('');

	let steps = $derived.by(() => {
		let result = [];
		for (let i = 0; i < messages.length; i += 2) {
			let userMsg = messages[i];
			let assistantMsg = messages[i + 1];
			if (i === 0) {
				result.push({
					question: 'What food topic would you like to explore?',
					answer: userMsg?.content || '',
					followUp: assistantMsg?.content || null
				});
			} else {
				let prevAssistant = messages[i - 1];
				result.push({
					question: prevAssistant?.content || '',
					answer: userMsg?.content || '',
					followUp: assistantMsg?.content || null
				});
			}
		}
		return result;
	});

	let currentQuestion = $derived.by(() => {
		if (messages.length === 0) {
			return 'What food topic would you like to explore?';
		}
		let lastMsg = messages[messages.length - 1];
		if (lastMsg.role === 'assistant') {
			return lastMsg.content;
		}
		return null;
	});

	let stepNumber = $derived(steps.length + 1);

	async function handleSubmit(text) {
		let trimmed = text.trim();
		if (!trimmed) return;

		messages = [...messages, { role: 'user', content: trimmed }];
		currentAnswer = '';
		loading = true;

		let response = await fetch('/api/discover', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ messages })
		});

		let result = await response.json();
		loading = false;

		if (result.error) {
			messages = [
				...messages,
				{ role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }
			];
			return;
		}

		messages = [...messages, { role: 'assistant', content: result.reply }];

		if (result.done && result.snippets) {
			doneSnippets = result.snippets;
		}
	}

	function handleKeydown(event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSubmit(currentAnswer);
		}
	}

	async function saveSnippet(index) {
		if (!doneSnippets || !doneSnippets[index]) return;
		savingIndex = index;
		await fetch('/api/preferences', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(doneSnippets[index])
		});
		savedIndexes = new Set([...savedIndexes, index]);
		savingIndex = -1;
	}

	async function saveAllSnippets() {
		if (!doneSnippets) return;
		for (let i = 0; i < doneSnippets.length; i++) {
			if (!savedIndexes.has(i)) {
				await saveSnippet(i);
			}
		}
		goto('/preferences');
	}

	let allSaved = $derived(
		doneSnippets !== null && doneSnippets.length > 0 && savedIndexes.size === doneSnippets.length
	);

	function startOver() {
		messages = [];
		doneSnippets = null;
		savedIndexes = new Set();
		savingIndex = -1;
		currentAnswer = '';
	}
</script>

<div class="discover-page">
	<h1>Discover Preferences</h1>
	<p class="subtitle">
		Answer a few questions to explore and articulate your food preferences.
	</p>

	<div class="steps">
		{#each steps as step, index (index)}
			<div class="step-card completed" in:fly={{ y: 20, duration: 300 }}>
				<div class="step-number">{index + 1}</div>
				<div class="step-body">
					<p class="step-question">{step.question}</p>
					<p class="step-answer">{step.answer}</p>
				</div>
			</div>
		{/each}

		{#if !doneSnippets && currentQuestion}
			<div class="step-card active" in:fly={{ y: 20, duration: 300 }}>
				<div class="step-number">{stepNumber}</div>
				<div class="step-body">
					<p class="step-question">{currentQuestion}</p>
					{#if loading}
						<div class="loading-indicator">
							<span class="dot"></span>
							<span class="dot"></span>
							<span class="dot"></span>
						</div>
					{:else}
						<div class="answer-row">
							<input
								type="text"
								placeholder="Type your answer..."
								bind:value={currentAnswer}
								onkeydown={handleKeydown}
								disabled={loading}
							/>
							<button
								type="button"
								class="submit-btn"
								onclick={() => handleSubmit(currentAnswer)}
								disabled={loading || !currentAnswer.trim()}
							>
								<span class="icon submit-icon">arrow_forward</span>
							</button>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	{#if doneSnippets}
		<div class="snippets-section" in:fly={{ y: 20, duration: 300 }}>
			<div class="snippet-header">
				<span class="icon snippet-check">check_circle</span>
				<h3>
					{doneSnippets.length === 1
						? 'Your discovered preference'
						: `${doneSnippets.length} preferences discovered`}
				</h3>
			</div>

			{#each doneSnippets as snippet, index (index)}
				<div class="snippet-preview" class:saved={savedIndexes.has(index)}>
					<p class="snippet-text">"{snippet.text}"</p>
					{#if snippet.tags?.length > 0}
						<div class="snippet-tags">
							{#each snippet.tags as tag}
								<span class="snippet-tag">{tag}</span>
							{/each}
						</div>
					{/if}
					{#if savedIndexes.has(index)}
						<p class="saved-label">Saved</p>
					{:else}
						<button
							type="button"
							class="btn btn-small btn-secondary"
							onclick={() => saveSnippet(index)}
							disabled={savingIndex === index}
						>
							{savingIndex === index ? 'Saving...' : 'Save'}
						</button>
					{/if}
				</div>
			{/each}

			<div class="snippet-actions">
				<button type="button" class="btn btn-secondary" onclick={startOver}>Start over</button>
				{#if allSaved}
					<button type="button" class="btn btn-primary" onclick={() => goto('/preferences')}>
						View preferences
					</button>
				{:else}
					<button type="button" class="btn btn-primary" onclick={saveAllSnippets}>
						Save all
					</button>
				{/if}
			</div>
		</div>
	{/if}

	{#if messages.length === 0}
		<p class="hint">
			Try topics like "weeknight dinners", "breakfast ideas", or "cooking for guests"
		</p>
	{/if}
</div>

<style>
	.discover-page {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.subtitle {
		color: var(--color-muted);
		font-size: var(--font-base);
		margin-top: -8px;
	}

	.hint {
		text-align: center;
		color: var(--color-muted);
		font-size: var(--font-sm);
		font-style: italic;
	}

	.steps {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.step-card {
		display: flex;
		gap: 16px;
		background: var(--color-white);
		border-radius: var(--radius-lg);
		padding: 24px;
		box-shadow: var(--shadow-sm);
	}

	.step-card.active {
		border-left: 4px solid var(--color-sage);
		box-shadow: var(--shadow-md);
	}

	.step-card.completed {
		opacity: 0.85;
	}

	.step-number {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background-color: var(--color-sage);
		color: var(--color-white);
		font-weight: 700;
		font-size: var(--font-sm);
		flex-shrink: 0;
	}

	.step-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.step-question {
		font-size: var(--font-base);
		font-weight: 600;
		color: var(--color-charcoal);
		line-height: 1.4;
	}

	.step-answer {
		font-size: var(--font-base);
		color: var(--color-muted);
		line-height: 1.5;
	}

	.answer-row {
		display: flex;
		gap: 8px;
	}

	.answer-row input {
		flex: 1;
		padding: 12px 16px;
		border: 2px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--font-base);
		background: var(--color-white);
		color: var(--color-charcoal);
		transition: border-color var(--transition-fast);
	}

	.answer-row input:focus {
		outline: none;
		border-color: var(--color-sage);
	}

	.submit-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		border-radius: var(--radius-md);
		background-color: var(--color-sage);
		color: var(--color-white);
		border: none;
		cursor: pointer;
		flex-shrink: 0;
		transition:
			background-color var(--transition-fast),
			transform var(--transition-fast);
	}

	.submit-btn:hover:not(:disabled) {
		background-color: var(--color-sage-dark);
	}

	.submit-btn:active {
		transform: scale(0.95);
	}

	.submit-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.submit-icon {
		font-size: 22px;
	}

	.loading-indicator {
		display: flex;
		gap: 6px;
		padding: 8px 0;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: var(--color-sage);
		animation: bounce 1.2s infinite ease-in-out;
	}

	.dot:nth-child(2) {
		animation-delay: 0.2s;
	}

	.dot:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes bounce {
		0%,
		60%,
		100% {
			transform: translateY(0);
		}
		30% {
			transform: translateY(-6px);
		}
	}

	.snippets-section {
		display: flex;
		flex-direction: column;
		gap: 12px;
		background: var(--color-white);
		border-radius: var(--radius-lg);
		padding: 24px;
		border-left: 4px solid var(--color-honey);
		box-shadow: var(--shadow-md);
	}

	.snippet-preview {
		background: var(--color-surface);
		border-radius: var(--radius-md);
		padding: 16px;
	}

	.snippet-preview.saved {
		opacity: 0.7;
	}

	.saved-label {
		font-size: var(--font-sm);
		color: var(--color-sage);
		font-weight: 600;
	}

	.snippet-header {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.snippet-check {
		font-size: 24px;
		color: var(--color-sage);
	}

	.snippet-header h3 {
		font-size: var(--font-base);
		color: var(--color-charcoal);
	}

	.snippet-text {
		font-size: var(--font-base);
		line-height: 1.5;
		color: var(--color-charcoal);
		margin-bottom: 12px;
	}

	.snippet-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: 16px;
	}

	.snippet-tag {
		padding: 4px 12px;
		border-radius: var(--radius-pill);
		background-color: var(--color-surface);
		color: var(--color-charcoal);
		font-size: var(--font-sm);
		font-weight: 600;
	}

	.snippet-actions {
		display: flex;
		gap: 10px;
		justify-content: flex-end;
	}

	.btn {
		padding: 12px 22px;
		border-radius: var(--radius-md);
		font-size: var(--font-sm);
		font-weight: 600;
		cursor: pointer;
		transition:
			background-color var(--transition-fast),
			transform var(--transition-fast);
	}

	.btn:active {
		transform: scale(0.97);
	}

	.btn-primary {
		background-color: var(--color-sage);
		color: var(--color-white);
		border: none;
	}

	.btn-primary:hover {
		background-color: var(--color-sage-dark);
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: transparent;
		color: var(--color-muted);
		border: 2px solid var(--color-border);
	}

	.btn-secondary:hover {
		border-color: var(--color-muted);
		color: var(--color-charcoal);
	}

	.btn-small {
		padding: 6px 14px;
		font-size: var(--font-sm);
	}
</style>
