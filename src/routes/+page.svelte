<script>
	import { fly } from 'svelte/transition';
</script>

<div class="home">
	<div class="hero" in:fly={{ y: 20, duration: 400 }}>
		<h1 class="hero-title">What's for dinner?</h1>
		<p class="hero-subtitle">
			Store your favorite meals, discover your preferences, and get inspired for the week ahead.
		</p>
	</div>

	<div class="actions">
		<a href="/meals" class="action-card" in:fly={{ y: 20, duration: 300, delay: 100 }}>
			<span class="icon action-icon">skillet</span>
			<h2 class="action-title">Meals</h2>
			<p class="action-desc">Browse and manage your meal collection</p>
		</a>

		<a href="/preferences" class="action-card" in:fly={{ y: 20, duration: 300, delay: 200 }}>
			<span class="icon action-icon">favorite</span>
			<h2 class="action-title">Preferences</h2>
			<p class="action-desc">Track what you're in the mood for</p>
		</a>

		<a href="/discover" class="action-card" in:fly={{ y: 20, duration: 300, delay: 300 }}>
			<span class="icon action-icon">auto_awesome</span>
			<h2 class="action-title">Discover</h2>
			<p class="action-desc">Chat to uncover new food preferences</p>
		</a>

		<a href="/propose" class="action-card" in:fly={{ y: 20, duration: 300, delay: 400 }}>
			<span class="icon action-icon">casino</span>
			<h2 class="action-title">Propose</h2>
			<p class="action-desc">Get meal ideas for the week</p>
		</a>
	</div>
</div>

<style>
	.home {
		display: flex;
		flex-direction: column;
		gap: 48px;
		padding-top: 32px;
	}

	.hero {
		text-align: center;
		padding: 40px 0;
	}

	.hero-title {
		font-size: 2.75rem;
		font-weight: 800;
		color: var(--color-charcoal);
		margin-bottom: 14px;
	}

	.hero-subtitle {
		font-size: var(--font-lg);
		color: var(--color-muted);
		max-width: 440px;
		margin: 0 auto;
		line-height: 1.6;
	}

	.actions {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 16px;
	}

	.action-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 32px 20px;
		background: var(--color-white);
		border-radius: var(--radius-lg);
		text-decoration: none;
		box-shadow: var(--shadow-sm);
		transition:
			transform var(--transition-normal),
			box-shadow var(--transition-normal);
	}

	.action-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
	}

	.action-icon {
		font-size: 40px;
		color: var(--color-sage);
		margin-bottom: 14px;
	}

	.action-title {
		font-size: var(--font-lg);
		font-weight: 700;
		color: var(--color-charcoal);
		margin-bottom: 6px;
	}

	.action-desc {
		font-size: var(--font-sm);
		color: var(--color-muted);
		line-height: 1.4;
	}
</style>
