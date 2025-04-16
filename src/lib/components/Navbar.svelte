<script>
	import { globalStore } from '$lib/stores/globalStore.svelte.js';
	import { surveyStore } from '$lib/stores/surveyStore.svelte';
</script>

<div class="sidebar">
	<button onclick={() => (globalStore.view = 'home')}>Home</button>
	<button onclick={() => (globalStore.view = 'survey')}>Talk More</button>
	{#if surveyStore.pages.length > 0 && surveyStore.pages.some((page) => page.done)}
		<button onclick={() => (globalStore.view = 'summary')}>Your Summary</button>
	{/if}
</div>

<style>
	button {
		background: none;
		width: 100%;
		padding: 15px 15px;
		border: none;
		text-align: left;
		font-size: 1.2rem;
		font-weight: 200;
		cursor: pointer;
		transition: background-color 0.3s;
	}
	button:hover {
		background-color: #f0f0f0;
	}
	.sidebar {
		display: flex;
		flex-direction: column;
		justify-content: right;
		height: 100%;
	}
	button {
		height: 60px; 
	}

	@media (max-width: 768px) {
		button {
			height: 100%; 
			text-align: center;
		}
		.sidebar {
			flex-direction: row;
			justify-content: space-around;
		}
	}
</style>
