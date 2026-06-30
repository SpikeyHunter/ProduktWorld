<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import Preloader from '$lib/components/Preloader.svelte';
  
	let { children } = $props();
  
	onMount(() => {
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
  
		cleanup = () => { gsap.ticker.remove(raf); lenis.destroy(); };
	  })();
	  return () => cleanup();
	});
  </script>
  
  <Preloader />
  {@render children()}