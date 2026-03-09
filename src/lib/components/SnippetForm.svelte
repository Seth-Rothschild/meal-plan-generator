<script>
	import TagInput from './TagInput.svelte';

	let { snippet: initialSnippet = null, allTags = [], onsubmit, oncancel } = $props();

	let text = $state(initialSnippet?.text || '');
	let tags = $state(initialSnippet?.tags ? [...initialSnippet.tags] : []);
	let error = $state('');

	function handleSubmit(event) {
		event.preventDefault();
		if (!text.trim()) {
			error = 'Text is required';
			return;
		}
		error = '';
		onsubmit?.({
			text: text.trim(),
			tags
		});
	}
</script>

<form class="snippet-form" onsubmit={handleSubmit}>
	<div class="form-group">
		<label for="snippet-text">Preference text</label>
		<textarea
			id="snippet-text"
			bind:value={text}
			placeholder="Describe a food preference..."
			rows="3"
		></textarea>
		{#if error}
			<p class="form-error">{error}</p>
		{/if}
	</div>

	<div class="form-group">
		<label>Tags</label>
		<TagInput {tags} {allTags} onchange={(newTags) => (tags = newTags)} />
	</div>

	<div class="form-actions">
		<button type="button" class="btn btn-secondary" onclick={() => oncancel?.()}>Cancel</button>
		<button type="submit" class="btn btn-primary">Save preference</button>
	</div>
</form>

<style>
	.snippet-form {
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

	textarea {
		padding: 10px 14px;
		border: 2px solid #e0dcd4;
		border-radius: 10px;
		font-size: 1rem;
		background: #ffffff;
		color: #3a3a3a;
		resize: vertical;
		min-height: 80px;
		transition: border-color 150ms ease;
	}

	textarea:focus {
		outline: none;
		border-color: #5c7855;
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
