<script lang="ts">
	import { navigating } from '$app/stores';
	import { onMount } from 'svelte';

	let overlay = $state<HTMLDivElement>();
	let gsapMod: any = null;
	let wasNavigating = false;

	onMount(() => {
		(async () => {
			gsapMod = await import('$lib/gsap');
		})();
	});

	// Fires on every SvelteKit client-side navigation (e.g. a link from "/" to
	// "/information"). Hard page loads are already covered by the Preloader
	// (which sits at a higher z-index), so this only ever shows for in-app nav.
	$effect(() => {
		const isNav = !!$navigating;
		if (!gsapMod || !overlay) {
			wasNavigating = isNav;
			return;
		}

		if (isNav && !wasNavigating) {
			gsapMod.gsap.set(overlay, { autoAlpha: 0 });
			gsapMod.gsap.to(overlay, { autoAlpha: 1, duration: 0.28, ease: 'power2.out' });
		} else if (!isNav && wasNavigating) {
			gsapMod.gsap.to(overlay, {
				autoAlpha: 0,
				duration: 0.5,
				ease: 'power2.inOut',
				delay: 0.08
			});
		}
		wasNavigating = isNav;
	});
</script>

<div bind:this={overlay} class="page-transition-overlay" style="opacity:0"></div>

<style>
	.page-transition-overlay {
		position: fixed;
		inset: 0;
		z-index: 55; /* below the Preloader (60), above normal page content */
		background: var(--color-darkaccent);
		pointer-events: none;
	}
</style>