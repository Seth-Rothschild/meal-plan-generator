<script>
	import Header from '$lib/components/Header.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Home from '$lib/components/Home.svelte';

	let plan = $state('');
	let { children } = $props();
</script>

<div class="layout">
	<header class="header">
		<Header />
	</header>
	<aside class="sidebar">
		<Sidebar />
	</aside>
	<main class="content">
		{@render children()}
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
