<script>
	import { fly } from 'svelte/transition';
	import { invalidateAll } from '$app/navigation';
	import TagBar from '$lib/components/TagBar.svelte';
	import MealCard from '$lib/components/MealCard.svelte';
	import MealForm from '$lib/components/MealForm.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';

	let { data } = $props();

	let activeTags = $state([]);
	let showCreateModal = $state(false);
	let editingMeal = $state(null);

	let filteredMeals = $derived(
		activeTags.length === 0
			? data.meals
			: data.meals.filter((meal) => meal.tags.some((tag) => activeTags.includes(tag)))
	);

	function toggleTag(tag) {
		if (activeTags.includes(tag)) {
			activeTags = activeTags.filter((t) => t !== tag);
		} else {
			activeTags = [...activeTags, tag];
		}
	}

	async function handleCreate(mealData) {
		await fetch('/api/meals', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(mealData)
		});
		showCreateModal = false;
		await invalidateAll();
	}

	async function handleEdit(mealData) {
		await fetch(`/api/meals/${editingMeal.id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(mealData)
		});
		editingMeal = null;
		await invalidateAll();
	}

	async function handleDelete(meal) {
		await fetch(`/api/meals/${meal.id}`, { method: 'DELETE' });
		await invalidateAll();
	}
</script>

<div class="meals-page">
	<div class="page-header">
		<h1>Meals</h1>
		<button type="button" class="fab" onclick={() => (showCreateModal = true)}>
			<span class="icon fab-icon">add</span>
			Add meal
		</button>
	</div>

	{#if data.allTags.length > 0}
		<TagBar tags={data.allTags} {activeTags} ontoggle={toggleTag} />
	{/if}

	{#if filteredMeals.length === 0}
		<EmptyState message="No meals yet. Add your first one!" />
	{:else}
		<div class="meals-list">
			{#each filteredMeals as meal, index (meal.id)}
				<div in:fly={{ y: 20, duration: 300, delay: index * 50 }}>
					<MealCard
						{meal}
						onedit={() => (editingMeal = meal)}
						ondelete={() => handleDelete(meal)}
					/>
				</div>
			{/each}
		</div>
	{/if}
</div>

<Modal open={showCreateModal} onclose={() => (showCreateModal = false)} label="New meal">
	<h2>New meal</h2>
	<MealForm
		allTags={data.allTags}
		onsubmit={handleCreate}
		oncancel={() => (showCreateModal = false)}
	/>
</Modal>

<Modal open={editingMeal !== null} onclose={() => (editingMeal = null)} label="Edit meal">
	<h2>Edit meal</h2>
	{#if editingMeal}
		<MealForm
			meal={editingMeal}
			allTags={data.allTags}
			onsubmit={handleEdit}
			oncancel={() => (editingMeal = null)}
		/>
	{/if}
</Modal>

<style>
	.meals-page {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.fab {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 12px 22px;
		background-color: var(--color-sage);
		color: var(--color-white);
		border: none;
		border-radius: var(--radius-md);
		font-size: var(--font-sm);
		font-weight: 600;
		cursor: pointer;
		transition:
			background-color var(--transition-fast),
			transform var(--transition-fast),
			box-shadow var(--transition-fast);
		box-shadow: 0 2px 8px rgba(125, 155, 118, 0.3);
	}

	.fab-icon {
		font-size: 20px;
	}

	.fab:hover {
		background-color: var(--color-sage-dark);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(125, 155, 118, 0.4);
	}

	.fab:active {
		transform: scale(0.97);
	}

	.meals-list {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
</style>
