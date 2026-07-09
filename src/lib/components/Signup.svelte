<script lang="ts">
	import { onMount } from 'svelte';
	import { introComplete } from '$lib/intro';
	import logo from '$lib/assets/PW_Logo.png';
	import star from '$lib/assets/star.svg';

	const words = 'MUSIQUE ARTS GASTRONOMIE EXPÉRIENCES INNOVATION'.split(' ');

	let logoEl = $state<HTMLImageElement>();
	let content = $state<HTMLDivElement>();
	let showForm = $state(false);

	onMount(() => {
		let unsub = () => {};

		(async () => {
			const { gsap } = await import('$lib/gsap');

			const items = Array.from(content!.children);
			gsap.set(logoEl!, { autoAlpha: 0 });
			gsap.set(items, { y: 26, autoAlpha: 0 });

			unsub = introComplete.subscribe((v) => {
				if (!v) return;

				if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
					gsap.set(logoEl!, { autoAlpha: 1 });
					gsap.set(items, { y: 0, autoAlpha: 1 });
					return;
				}

				gsap.set(logoEl!, { autoAlpha: 1 });

				gsap.to(items, {
					y: 0,
					autoAlpha: 1,
					duration: 0.8,
					stagger: 0.12,
					ease: 'power3.out',
					delay: 0.25
				});
			});
		})();

		return () => unsub();
	});
</script>

<svelte:head>
	<script src="https://embed.laylo.com/laylo-sdk.js"></script>
</svelte:head>

<section id="signup" class="relative min-h-[100svh] overflow-hidden flex flex-col justify-end">
	<div
		class="absolute inset-x-0 bottom-0 h-[50svh] -z-10 pointer-events-none"
		style="background: linear-gradient(to top,
			rgba(13, 7, 6, 0.95) 0%,
			rgba(13, 7, 6, 0.5) 70%,
			rgba(13, 7, 6, 0) 100%);"
	></div>

	<img
		id="page-logo"
		bind:this={logoEl}
		src={logo}
		alt="Produktworld — Festival Musique + Arts"
		class="page-logo absolute left-1/2 -translate-x-1/2"
		style="opacity:0"
	/>

	<div
		bind:this={content}
		class="w-full flex flex-col items-center gap-1 px-6 pb-6 text-center z-10"
	>
		<p class="text-lightaccent text-base md:text-xl tracking-[0.22em] uppercase">
			4 au 6 Septembre 2026
		</p>
		<h1 class="font-black text-beige leading-none" style="font-size: clamp(2rem, 7vw, 4rem);">
			Rejoignez le Cirque
		</h1>
		<p class="max-w-2xl text-beige/85 text-[10px] sm:text-sm 2xl:text-base tracking-[0.05em] sm:tracking-[0.22em] flex flex-nowrap items-center justify-center gap-x-1.5 sm:gap-x-3 whitespace-nowrap overflow-x-auto px-2">
      {#each words as word, i}
        <span>{word}</span>
        {#if i < words.length - 1}
          <img src={star} alt="" class="w-2 h-2 sm:w-4 sm:h-4 md:w-5 md:h-5 opacity-80 shrink-0" />
        {/if}
      {/each}
    </p>

		<div class="w-full max-w-[400px] mt-2 relative min-h-[60px] flex justify-center items-center">
			<button
				class="group inline-flex items-center gap-2 rounded-full bg-lightred px-9 py-4
					   text-beige uppercase tracking-[0.2em] text-sm transition-all duration-300 absolute z-20"
				class:opacity-0={showForm}
				class:pointer-events-none={showForm}
				class:scale-105={!showForm && false}
				onclick={() => (showForm = true)}
			>
				S’inscrire à la prévente <span class="transition-transform group-hover:translate-x-1"
					>→</span
				>
			</button>

			<div
				class="w-full transition-all duration-500 z-10"
				class:opacity-0={!showForm}
				class:pointer-events-none={!showForm}
			>
				<iframe
					id="laylo-drop-2ab97422-9b9c-404e-a2a0-6db4215b1569"
					title="Laylo Signup Form"
					frameborder="0"
					scrolling="no"
					allow="web-share"
					allowtransparency={true}
					style="width: 1px; min-width: 100%; max-width: 1000px;"
					src="https://embed.laylo.com?dropId=2ab97422-9b9c-404e-a2a0-6db4215b1569&color=FFEA2C&minimal=true&theme=dark"
				></iframe>
			</div>
		</div>
	</div>
</section>

<style>
	.page-logo {
		top: clamp(20px, 10svh, 56px);
		width: min(72vw, 440px);
		z-index: 1;
	}
</style>
