<script>
	import '../app.css';
	import Nav from '$lib/components/Nav.svelte';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Meal Proposer</title>
</svelte:head>

<Nav currentPath={page.url.pathname} />

<main class="main-content">
	{@render children()}
</main>

<ToastContainer />

<style>
	.main-content {
		max-width: 640px;
		margin: 0 auto;
		padding: 28px 20px;
	}
</style>
