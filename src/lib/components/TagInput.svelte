<script>
	import TagPill from './TagPill.svelte';

	let { tags = [], allTags = [], onchange } = $props();

	let inputValue = $state('');
	let showSuggestions = $state(false);

	let suggestions = $derived(
		allTags.filter((t) => {
			let notAlreadyAdded = !tags.includes(t);
			let matchesInput = t.toLowerCase().includes(inputValue.toLowerCase());
			return notAlreadyAdded && matchesInput && inputValue.length > 0;
		})
	);

	function addTag(tag) {
		let trimmed = tag.trim().toLowerCase();
		if (trimmed && !tags.includes(trimmed)) {
			onchange?.([...tags, trimmed]);
		}
		inputValue = '';
		showSuggestions = false;
	}

	function removeTag(tag) {
		onchange?.(tags.filter((t) => t !== tag));
	}

	function handleKeydown(event) {
		if (event.key === 'Enter') {
			event.preventDefault();
			if (inputValue.trim()) {
				addTag(inputValue);
			}
		}
	}

	function handleInput(event) {
		inputValue = event.currentTarget.value;
		showSuggestions = inputValue.length > 0;
	}

	function handleBlur() {
		setTimeout(() => {
			showSuggestions = false;
		}, 200);
	}
</script>

<div class="tag-input">
	<div class="tags-row">
		{#each tags as tag}
			<TagPill label={tag} removable onremove={() => removeTag(tag)} />
		{/each}
	</div>
	<div class="input-wrapper">
		<input
			type="text"
			placeholder="Add tag..."
			value={inputValue}
			oninput={handleInput}
			onkeydown={handleKeydown}
			onfocus={() => (showSuggestions = inputValue.length > 0)}
			onblur={handleBlur}
		/>
		{#if showSuggestions && suggestions.length > 0}
			<ul class="suggestions">
				{#each suggestions as suggestion}
					<li>
						<button type="button" onmousedown={() => addTag(suggestion)}>
							{suggestion}
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<style>
	.tag-input {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.tags-row {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.input-wrapper {
		position: relative;
	}

	input {
		width: 100%;
		padding: 8px 12px;
		border: 2px solid #e0dcd4;
		border-radius: 8px;
		font-size: 0.875rem;
		background: #ffffff;
		color: #3a3a3a;
		transition: border-color 150ms ease;
	}

	input:focus {
		outline: none;
		border-color: #5c7855;
	}

	.suggestions {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		list-style: none;
		background: #ffffff;
		border: 1px solid #e0dcd4;
		border-radius: 8px;
		margin-top: 4px;
		padding: 4px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		z-index: 10;
	}

	.suggestions li button {
		display: block;
		width: 100%;
		padding: 6px 10px;
		text-align: left;
		border: none;
		background: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.875rem;
		color: #3a3a3a;
	}

	.suggestions li button:hover {
		background-color: #f0ece4;
	}
</style>
