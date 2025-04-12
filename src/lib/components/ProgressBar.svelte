<script>
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { onMount } from 'svelte';

	export let progress = 0; // Progress value (0 to 100)

	const tweenedProgress = tweened(0, {
		duration: 400,
		easing: cubicOut
	});

	$: tweenedProgress.set(progress);

	onMount(() => {
		tweenedProgress.set(progress);
	});
</script>

<div class="progress-bar-container">
	<div class="progress-bar" style="width: {$tweenedProgress}%;"></div>
</div>

<style>
	.progress-bar-container {
		width: 100%;
		height: 20px;
		background-color: #f3f3f3;
		border-radius: 10px;
		overflow: hidden;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.progress-bar {
		height: 100%;
		background-color: #d6b3ff; /* Light purple */
		border-radius: 10px 0 0 10px;
		transition: width 0.4s ease;
	}
</style>
