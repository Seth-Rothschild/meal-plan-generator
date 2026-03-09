<script>
	import TagInput from './TagInput.svelte';

	let { meal: initialMeal = null, allTags = [], onsubmit, oncancel } = $props();

	let name = $state(initialMeal?.name || '');
	let tags = $state(initialMeal?.tags ? [...initialMeal.tags] : []);
	let notes = $state(initialMeal?.notes || '');
	let error = $state('');

	function handleSubmit(event) {
		event.preventDefault();
		if (!name.trim()) {
			error = 'Name is required';
			return;
		}
		error = '';
		onsubmit?.({
			name: name.trim(),
			tags,
			notes: notes.trim()
		});
	}
</script>

<form class="meal-form" onsubmit={handleSubmit}>
	<div class="form-group">
		<label for="meal-name">Meal name</label>
		<input id="meal-name" type="text" bind:value={name} placeholder="What's the meal called?" />
		{#if error}
			<p class="form-error">{error}</p>
		{/if}
	</div>

	<div class="form-group">
		<label>Tags</label>
		<TagInput {tags} {allTags} onchange={(newTags) => (tags = newTags)} />
	</div>

	<div class="form-group">
		<label for="meal-notes">Notes</label>
		<textarea id="meal-notes" bind:value={notes} placeholder="Ingredients, links, tips..." rows="4"
		></textarea>
	</div>

	<div class="form-actions">
		<button type="button" class="btn btn-secondary" onclick={() => oncancel?.()}>Cancel</button>
		<button type="submit" class="btn btn-primary">Save meal</button>
	</div>
</form>

<style>
	.meal-form {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	label {
		font-size: 0.875rem;
		font-weight: 600;
		color: #3a3a3a;
	}

	input,
	textarea {
		padding: 10px 14px;
		border: 2px solid #e0dcd4;
		border-radius: 10px;
		font-size: 1rem;
		background: #ffffff;
		color: #3a3a3a;
		transition: border-color 150ms ease;
	}

	input:focus,
	textarea:focus {
		outline: none;
		border-color: #5c7855;
	}

	textarea {
		resize: vertical;
		min-height: 80px;
	}

	.form-error {
		font-size: 0.8125rem;
		color: #c24040;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		padding-top: 8px;
	}

	.btn {
		padding: 10px 20px;
		border-radius: 10px;
		font-size: 0.9375rem;
		font-weight: 600;
		cursor: pointer;
		transition:
			background-color 150ms ease,
			transform 150ms ease;
	}

	.btn:active {
		transform: scale(0.97);
	}

	.btn-primary {
		background-color: #5c7855;
		color: #ffffff;
		border: none;
	}

	.btn-primary:hover {
		background-color: #476441;
	}

	.btn-secondary {
		background-color: transparent;
		color: #666666;
		border: 2px solid #e0dcd4;
	}

	.btn-secondary:hover {
		border-color: #666666;
		color: #3a3a3a;
	}
</style>
