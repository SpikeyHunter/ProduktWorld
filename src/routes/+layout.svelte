<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import Preloader from '$lib/components/Preloader.svelte';

	let { children } = $props();

	onMount(() => {
		// Force top-of-page on every load/reload — must run before Lenis inits
		if ('scrollRestoration' in history) {
			history.scrollRestoration = 'manual';
		}
		window.scrollTo(0, 0);

		let cleanup = () => {};
		(async () => {
			const Lenis = (await import('lenis')).default;
			const { gsap, ScrollTrigger } = await import('$lib/gsap');

			const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
			lenis.on('scroll', ScrollTrigger.update);
			const raf = (time: number) => lenis.raf(time * 1000);
			gsap.ticker.add(raf);
			gsap.ticker.lagSmoothing(0);
			ScrollTrigger.refresh();

			cleanup = () => {
				gsap.ticker.remove(raf);
				lenis.destroy();
			};
		})();
		return () => cleanup();
	});
</script>

<Preloader />
{@render children()}