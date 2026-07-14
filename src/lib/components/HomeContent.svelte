<script lang="ts">
	import { onMount } from 'svelte';
	import Signup from '$lib/components/Signup.svelte';
	import Lineup from '$lib/components/Lineup.svelte';
	import Info from '$lib/components/Info.svelte';
	import Footer from '$lib/components/Footer.svelte';

	// Backgrounds. BG_PW.jpg = hero (Signup). The lineup art morphs in on scroll.
	import bgHero from '$lib/assets/BG_PW.jpg';
	import bgLineup from '$lib/assets/BG_PW_Lineup.jpg';
	import bgLineupMobile from '$lib/assets/BG_PW_Lineup_Mobile.jpg';

	// Tiny inline blur-up placeholders (paint instantly, no network request).
	import { LQIP_LINEUP_DESKTOP, LQIP_LINEUP_MOBILE } from '$lib/assets/lineup-lqip';

	import { isInfoSectionVisible } from '$lib/config';

	let showInfo = $state(false);
	let lineupFullReady = $state(false); // full-res lineup art finished downloading
	let bgLineupLayer = $state<HTMLElement>();

	const MOBILE_Q = '(max-width: 767px)';

	onMount(() => {
		showInfo = isInfoSectionVisible();

		// ── Blur-up: preload the correct variant, then crossfade LQIP → sharp ──
		const isMobile = window.matchMedia(MOBILE_Q).matches;
		const pre = new Image();
		pre.decoding = 'async';
		pre.onload = () => (lineupFullReady = true);
		pre.src = isMobile ? bgLineupMobile : bgLineup;

		// ── Scroll-morph: crossfade hero → lineup art as #lineup approaches ────
		let ctx: any;
		(async () => {
			const { gsap, ScrollTrigger } = await import('$lib/gsap');
			const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

			// #lineup is mounted by now (child onMount runs before parent's), but
			// guard anyway so a slow mount can't throw.
			if (!document.getElementById('lineup')) return;

			ctx = gsap.context(() => {
				gsap.fromTo(
					bgLineupLayer!,
					{ autoAlpha: 0, scale: reduced ? 1 : 1.06 },
					{
						autoAlpha: 1,
						scale: 1,
						ease: 'none',
						scrollTrigger: {
							trigger: '#lineup',
							start: 'top bottom', // morph begins as the section enters
							end: 'top center', // fully morphed by the time it's centered
							scrub: true
						}
					}
				);
				ScrollTrigger.refresh();
			});
		})();

		return () => ctx?.revert();
	});
</script>

<div class="site-bg" aria-hidden="true">
	<!-- hero background (BG_PW.jpg) -->
	<div class="bg-layer bg-hero" style={`background-image:url(${bgHero})`}></div>

	<!-- lineup background — opacity/scale driven by scroll (see onMount) -->
	<div class="bg-layer bg-lineup" bind:this={bgLineupLayer}>
		<div
			class="bg-fill bg-lqip"
			style={`--lqip:url(${LQIP_LINEUP_DESKTOP}); --lqip-m:url(${LQIP_LINEUP_MOBILE})`}
		></div>
		<div
			class="bg-fill bg-full"
			class:ready={lineupFullReady}
			style={`--full:url(${bgLineup}); --full-m:url(${bgLineupMobile})`}
		></div>
	</div>

	<div class="site-bg-darken"></div>
	<div class="site-bg-vignette"></div>
</div>

<main class="relative z-10">
	<Signup />
	<Lineup />
	{#if showInfo}
		<Info />
	{/if}
	<Footer />
</main>

<style>
	.site-bg {
		position: fixed;
		inset: 0;
		z-index: 0;
	}
	.bg-layer {
		position: absolute;
		inset: 0;
	}

	/* ── hero ── */
	.bg-hero {
		background-size: cover;
		background-position: 50% 25%;
		background-repeat: no-repeat;
	}

	/*
	  ── lineup layer ──
	  ⚠ Initial hidden state lives HERE (not only in gsap) so it can't flash
	  full-opacity during the `await import('$lib/gsap')` round-trip. gsap
	  re-asserts the same values once it loads. Keep the two in sync.
	*/
	.bg-lineup {
		opacity: 0;
		visibility: hidden;
		will-change: opacity, transform;
	}
	.bg-fill {
		position: absolute;
		inset: 0;
		background-size: cover;
		background-position: 50% 25%;
		background-repeat: no-repeat;
	}
	/* blurred placeholder — always painted, costs nothing (inline base64) */
	.bg-lqip {
		background-image: var(--lqip);
		transform: scale(1.04); /* hides blur edges */
	}
	/* full-res — fades in over the placeholder once it has downloaded */
	.bg-full {
		background-image: var(--full);
		opacity: 0;
		transition: opacity 0.6s ease;
	}
	.bg-full.ready {
		opacity: 1;
	}

	/*
	  Mobile: swap to the lightweight portrait crop. Only the media-matched
	  url() is ever fetched, so phones never download the wide desktop JPEG.
	*/
	@media (max-width: 767px) {
		.bg-hero {
			background-position: 50% 30%;
		}
		.bg-lqip {
			background-image: var(--lqip-m);
			background-position: 50% 30%;
		}
		.bg-full {
			background-image: var(--full-m);
			background-position: 50% 30%;
		}
	}

	.site-bg-darken {
		position: absolute;
		inset: 0;
		background: rgba(13, 7, 6, 0.38);
	}
	.site-bg-vignette {
		position: absolute;
		inset: 0;
		background: radial-gradient(ellipse at 50% 42%, transparent 42%, rgba(0, 0, 0, 0.78) 100%);
	}
</style>