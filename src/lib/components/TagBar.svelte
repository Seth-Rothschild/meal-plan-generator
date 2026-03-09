<script>
	import TagPill from './TagPill.svelte';

	let { tags = [], activeTags = [], ontoggle } = $props();
</script>

<div class="tag-bar">
	{#each tags as tag}
		<TagPill label={tag} active={activeTags.includes(tag)} ontoggle={() => ontoggle?.(tag)} />
	{/each}
</div>

<style>
	.tag-bar {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		padding: 8px 0;
	}
</style>
