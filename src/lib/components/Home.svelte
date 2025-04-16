<script>
	import { getResponse, addHistory } from '$lib/helpers.svelte.js';
	import AsyncSubmit from '$lib/components/AsyncSubmit.svelte';
	import { onMount } from 'svelte';
	import { surveyStore } from '$lib/stores/surveyStore.svelte';
	import { globalStore } from '$lib/stores/globalStore.svelte';

	let plan = $state('');
	let recipe = $state('');
	let days = $derived.by(() => {
		let days = {};
		if (plan) {
			plan.split('\n\n').forEach((day) => {
				const lines = day.split('\n');
				const key = lines[0];
				const value = lines.slice(1);
				days[key] = value;
			});
		}
		return days;
	});
</script>

<h2>Welcome to the Meal Planning Assistant</h2>

{#if surveyStore?.pages?.length > 0}
	<p>This will generate a meal plan for you based on your preferences.</p>
	<AsyncSubmit
		label="Go"
		onClick={async () => {
			plan = await getResponse(addHistory([]), 'plan');
		}}
		hasResponse={true}
	/>
{:else}
	<p>
		To get started, start adding preferences on the <a
			href=""
			onclick={(globalStore.view = 'survey')}>Talk More</a
		> page.
	</p>
{/if}

<div style="display: flex; flex-direction: row; gap: 1rem;">
	{#if plan}
		<div class="plan">
			{#each Object.entries(days) as [title, lines]}
				<div class="day">
					<p><strong>{title}</strong></p>
					{#each lines as line}
						{#if line}
							<p>{line}</p>
						{/if}
					{/each}
					<div class="button-row">
						<AsyncSubmit
							label="Recipe"
							onClick={async () => {
								let messages = [
									{
										role: 'assistant',
										content: 'What is the title of the recipe?'
									},
									{
										role: 'user',
										content: lines.join('\n')
									}
								];
								recipe = await getResponse(addHistory(messages), 'recipe');
							}}
							hasResponse={true}
						/>
					</div>
				</div>
			{/each}
		</div>
	{/if}
	{#if recipe}
		<p style="white-space: pre-wrap; font-size: 1.2rem">{recipe}</p>
	{/if}
</div>

<style>
	.plan {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		align-items: left;
	}
	.day {
		border: 1px solid #ccc;
		padding: 2rem;
		padding-top: 0.25rem;
		margin-bottom: 1rem;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: box-shadow 0.3s ease;
		width: 600px;
	}
	.button-row {
		display: flex;
		gap: 0.5rem;
		height: 75px;
		justify-content: right;
	}
</style>
