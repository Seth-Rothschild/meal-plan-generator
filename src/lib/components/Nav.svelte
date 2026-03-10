<script>
	let { currentPath = '/' } = $props();

	let links = [
		{ href: '/meals', label: 'Meals', icon: 'skillet' },
		{ href: '/preferences', label: 'Preferences', icon: 'favorite' },
		{ href: '/settings', label: 'Settings', icon: 'settings' }
	];

	function isActive(href) {
		if (href === '/') {
			return currentPath === '/';
		}
		return currentPath.startsWith(href);
	}
</script>

<nav class="nav">
	<a href="/" class="nav-brand">Meal Proposer</a>
	<div class="nav-links">
		{#each links as link}
			<a href={link.href} class="nav-link" class:active={isActive(link.href)}>
				<span class="icon nav-icon">{link.icon}</span>
				<span class="nav-label">{link.label}</span>
			</a>
		{/each}
	</div>
</nav>

<style>
	.nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 20px;
		background: var(--color-white);
		box-shadow: var(--shadow-sm);
		position: sticky;
		top: 0;
		z-index: 50;
	}

	.nav-brand {
		font-size: var(--font-lg);
		font-weight: 800;
		color: var(--color-sage);
		text-decoration: none;
	}

	.nav-links {
		display: flex;
		gap: 2px;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 10px 14px;
		border-radius: var(--radius-md);
		text-decoration: none;
		font-size: var(--font-sm);
		font-weight: 600;
		color: var(--color-muted);
		transition:
			background-color var(--transition-fast),
			color var(--transition-fast);
	}

	.nav-link:hover {
		background-color: var(--color-surface);
		color: var(--color-charcoal);
	}

	.nav-link.active {
		background-color: var(--color-sage);
		color: var(--color-white);
	}

	.nav-icon {
		font-size: 22px;
	}

	.nav-label {
		display: none;
	}

	@media (min-width: 640px) {
		.nav-label {
			display: inline;
		}
	}
</style>
