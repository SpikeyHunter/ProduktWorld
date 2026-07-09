<script lang="ts">
	import { onMount } from 'svelte';
	import { introComplete } from '$lib/intro';
	
	// Import logos
	import produktLogo from '$lib/assets/PRODUKT_Logo_White.png';
	import ncgLogo from '$lib/assets/NCG_LOGO1_BLANC.png';

	let el = $state<HTMLElement>();

	onMount(() => {
		let unsub = () => {};

		(async () => {
			const { gsap } = await import('$lib/gsap');
			gsap.set(el!, { autoAlpha: 0, y: 24 });

			unsub = introComplete.subscribe((v) => {
				if (!v || !el) return;
				gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.7 });
			});
		})();

		return () => unsub();
	});
</script>

<footer
	bind:this={el}
	style="opacity:0"
	class="border-t border-beige/10 px-5 md:px-10 py-6 flex flex-col sm:flex-row items-center
	       justify-between gap-4 sm:gap-6 text-sm tracking-[0.2em] uppercase bg-darkaccent/90 backdrop-blur-md"
>
	<span class="order-1 sm:order-2 text-center text-beige/70 text-[11px] sm:text-sm">
		<span class="block sm:inline">4 au 6 Septembre 2026 · Montréal</span>
		<span class="block sm:inline sm:before:content-['·_']">950 rue Ottawa</span>
	</span>

	<div class="order-2 sm:order-1 sm:contents flex w-full items-center justify-between">
		<img src={produktLogo} alt="Produkt" class="h-5 md:h-6 w-auto object-contain opacity-90 sm:order-1" />
		<img src={ncgLogo} alt="New City Gas" class="h-10 sm:h-12 w-auto object-contain opacity-80 sm:order-3" />
	</div>
</footer>