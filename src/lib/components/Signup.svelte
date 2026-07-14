<script lang="ts">
	import { onMount } from 'svelte';
	import { introComplete } from '$lib/intro';
	import { lenisStore } from '$lib/lenis';
	import logo from '$lib/assets/PW_Logo.png';
	import star from '$lib/assets/star.svg';

	const words = 'MUSIQUE ARTS GASTRONOMIE EXPÉRIENCES INNOVATION'.split(' ');

	let logoEl = $state<HTMLImageElement>();
	let content = $state<HTMLDivElement>();
	let showForm = $state(false);

	// Same S-curve used for the initial route-in scroll in +layout.svelte, so
	// this button's scroll feels identical to the rest of the site.
	const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

	function scrollToLineup() {
		const target = document.getElementById('lineup');
		if (!target) return;

		let lenis: any;
		const unsub = lenisStore.subscribe((v) => (lenis = v));
		unsub();

		if (lenis) {
			lenis.start?.();
			lenis.scrollTo(target, { duration: 1.6, easing: easeInOutCubic, force: true });
		} else {
			target.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

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
					// Snap the position instantly (no animated movement — that's
					// the part reduced motion actually cares about), but let
					// opacity fade in gently so content doesn't just pop in.
					gsap.set(items, { y: 0 });
					gsap.to(logoEl!, { autoAlpha: 1, duration: 0.4, ease: 'power1.out' });
					gsap.to(items, { autoAlpha: 1, duration: 0.4, ease: 'power1.out' });
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
		<p
			class="w-full text-beige/85 flex flex-nowrap items-center justify-center gap-x-1 sm:gap-x-3 whitespace-nowrap px-2"
			style="font-size: clamp(6px, 2.6vw, 15px); letter-spacing: 0.03em;"
		>
			{#each words as word, i}
				<span>{word}</span>
				{#if i < words.length - 1}
					<img src={star} alt="" class="w-[0.6em] h-[0.6em] opacity-80 shrink-0" />
				{/if}
			{/each}
		</p>

		<div class="w-full max-w-[400px] mt-2 relative min-h-[60px] flex justify-center items-center">
			<button
	class="group inline-flex items-center gap-2 rounded-full bg-lightred px-9 py-4
		   text-beige uppercase tracking-[0.2em] text-sm transition-all duration-300 absolute z-20 whitespace-nowrap"
	class:opacity-0={showForm}
	class:pointer-events-none={showForm}
	class:scale-105={!showForm && false}
	onclick={() => (showForm = true)}
>
	S’inscrire <span class="transition-transform group-hover:translate-x-1"
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

		<!-- ── scroll-to-lineup arrow ── -->
		<button
			type="button"
			onclick={scrollToLineup}
			aria-label="Voir la programmation"
			class="scroll-cue mt-5 flex flex-col items-center gap-1.5 text-beige/60
			       hover:text-lightaccent transition-colors"
		>
			<span class="text-[9px] tracking-[0.3em] uppercase">Line-up</span>
			<svg
				class="arrow-bounce"
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M12 4v16M5 13l7 7 7-7" />
			</svg>
		</button>
	</div>
</section>

<style>
	.page-logo {
		top: clamp(10px, 10svh, 40px);
		width: min(72vw, 440px);
		z-index: 1;
	}

	.scroll-cue {
		cursor: pointer;
	}

	.arrow-bounce {
		animation: bounce-down 1.8s ease-in-out infinite;
	}

	@keyframes bounce-down {
		0%,
		100% {
			transform: translateY(0);
			opacity: 0.7;
		}
		50% {
			transform: translateY(6px);
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.arrow-bounce {
			animation: none;
		}
	}
</style>