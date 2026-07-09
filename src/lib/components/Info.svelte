<script lang="ts">
	import { onMount } from 'svelte';

	let section = $state<HTMLElement>();
	let ghostEl = $state<HTMLElement>();
	let titleEl = $state<HTMLElement>();
	let rowsWrap = $state<HTMLElement>();
	let marqueeTrack = $state<HTMLElement>();
	let noteEl = $state<HTMLElement>();
	let ruleEl = $state<HTMLElement>();

	const rows = [
		{ k: 'Dates', v: '4 — 6 Septembre 2026' },
		{ k: 'Lieu', v: 'New City Gas' },
		{ k: 'Adresse', v: '950 Rue Ottawa, Montréal' },
		{ k: 'Présenté par', v: 'Stella Artois' },
		{ k: 'Programmation', v: 'Dévoilée prochainement' }
	];

	const marqueeWords = [
		'MUSIQUE',
		'ARTS',
		'GASTRONOMIE',
		'EXPÉRIENCES',
		'INNOVATION'
	];

	onMount(() => {
		let ctx: any;

		(async () => {
			const { gsap, ScrollTrigger, SplitText } = await import('$lib/gsap');
			const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

			ctx = gsap.context(() => {
				// ── infinite marquee (independent of scroll, always drifting) ──────
				if (marqueeTrack && !reduced) {
					gsap.to(marqueeTrack, {
						xPercent: -50,
						duration: 26,
						ease: 'none',
						repeat: -1
					});
				}

				if (reduced) return;

				// ── headline: split into WORDS, then chars inside each word ────────
				// (chars-only splitting lets the browser break lines between chars,
				//  which is what mangled the old layout — words keep atoms intact)
				const titleSplit = new SplitText(titleEl!, {
					type: 'words,chars',
					wordsClass: 'split-word'
				});

				gsap.set(titleSplit.chars, {
					yPercent: 115,
					rotate: 6,
					skewY: 5,
					force3D: true
				});

				// ── value lines: mask-reveal from below ────────────────────────────
				const rowEls = Array.from(rowsWrap!.querySelectorAll<HTMLElement>('.row'));
				const rowKeys = rowEls.map((r) => r.querySelector('.row-k'));
				const rowVals = rowEls.map((r) => r.querySelector('.row-v'));

				gsap.set(rowVals, { yPercent: 110 });
				gsap.set(rowKeys, { autoAlpha: 0, x: -12 });
				gsap.set(ruleEl!, { scaleX: 0, transformOrigin: 'left center' });
				gsap.set(noteEl!, { autoAlpha: 0, y: 20 });

				// ── entrance timeline, fires once when the section arrives ─────────
				const intro = gsap.timeline({
					scrollTrigger: {
						trigger: section,
						start: 'top 65%',
						once: true
					}
				});

				intro
					.to(titleSplit.chars, {
						yPercent: 0,
						rotate: 0,
						skewY: 0,
						duration: 1.1,
						ease: 'power4.out',
						stagger: { each: 0.022, from: 'start' }
					})
					.to(ruleEl!, { scaleX: 1, duration: 0.9, ease: 'power3.inOut' }, '-=0.75')
					.to(
						rowKeys,
						{ autoAlpha: 1, x: 0, duration: 0.6, ease: 'power2.out', stagger: 0.07 },
						'-=0.6'
					)
					.to(
						rowVals,
						{ yPercent: 0, duration: 0.85, ease: 'power4.out', stagger: 0.07 },
						'-=0.7'
					)
					.to(noteEl!, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.4');

				// ── scrub-linked parallax: ghost word + rows drift at different
				//    speeds as the section passes through the viewport ─────────────
				const st = {
					trigger: section,
					start: 'top bottom',
					end: 'bottom top',
					scrub: 1
				};
				gsap.fromTo(ghostEl!, { yPercent: -12 }, { yPercent: 12, ease: 'none', scrollTrigger: st });
				gsap.fromTo(titleEl!, { yPercent: 6 }, { yPercent: -6, ease: 'none', scrollTrigger: st });
				gsap.fromTo(
					marqueeTrack!.parentElement,
					{ yPercent: 10 },
					{ yPercent: -10, ease: 'none', scrollTrigger: st }
				);

				ScrollTrigger.refresh();
			}, section);
		})();

		return () => ctx?.revert();
	});
</script>

<section
	id="information"
	bind:this={section}
	class="relative min-h-[100svh] overflow-hidden bg-darkred flex flex-col justify-center
	       py-20 sm:py-28 px-6 sm:px-10"
>
	<!-- depth so the flat color reads as a lit room, not a swatch -->
	<div
		class="absolute inset-0 pointer-events-none"
		style="background: radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.42) 100%);"
	></div>

	<!-- parallax ghost word behind everything -->
	<span
		bind:this={ghostEl}
		aria-hidden="true"
		class="ghost pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
		       font-black text-beige/[0.04] whitespace-nowrap leading-none"
	>
		PRODKT
	</span>

	<div class="relative z-10 mx-auto w-full max-w-5xl">
		<!-- ── headline ── -->
		<p class="text-lightaccent text-[10px] sm:text-xs tracking-[0.4em] uppercase mb-4 sm:mb-6">
			À savoir
		</p>

		<h2
			bind:this={titleEl}
			class="title font-black text-beige leading-[0.85] uppercase"
		>
			Informations
		</h2>

		<div bind:this={ruleEl} class="h-px w-full bg-beige/25 mt-8 sm:mt-10"></div>

		<!-- ── info rows ── -->
		<div bind:this={rowsWrap} class="mt-8 sm:mt-12 flex flex-col">
			{#each rows as row}
				<div
					class="row flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-8
					       py-4 sm:py-5 border-b border-beige/10"
				>
					<span
						class="row-k shrink-0 sm:w-56 text-lightaccent text-[10px] sm:text-xs
						       tracking-[0.3em] uppercase"
					>
						{row.k}
					</span>
					<span class="mask block overflow-hidden">
						<span class="row-v block text-beige leading-tight row-value">
							{row.v}
						</span>
					</span>
				</div>
			{/each}
		</div>

		<p
			bind:this={noteEl}
			class="mt-8 sm:mt-10 max-w-xl text-beige/60 text-sm sm:text-base leading-relaxed"
		>
			Trois jours de musique, d'arts et d'expériences au cœur de Griffintown.
			Inscrivez-vous à la prévente pour un accès prioritaire aux billets.
		</p>
	</div>

	<!-- ── infinite marquee band ── -->
	<div class="relative z-10 mt-14 sm:mt-20 overflow-hidden">
		<div bind:this={marqueeTrack} class="flex w-max whitespace-nowrap">
			{#each [0, 1] as _}
				{#each marqueeWords as w}
					<span class="marquee-item font-black text-beige/10 uppercase leading-none px-6 sm:px-10">
						{w}
					</span>
				{/each}
			{/each}
		</div>
	</div>
</section>

<style>
	/*
	  ⚠ nowrap + a length-aware clamp: "INFORMATIONS" is 12 chars, so 9vw
	  never overflows even at 320px. Never let SplitText chars line-break.
	*/
	.title {
		font-size: clamp(2.6rem, 9vw, 7rem);
		white-space: nowrap;
	}
	.title :global(.split-word) {
		display: inline-block; /* words are atomic — chars inside never break apart */
	}
	.title :global(.split-word > div) {
		display: inline-block;
		will-change: transform;
	}

	.ghost {
		font-size: clamp(9rem, 34vw, 26rem);
		will-change: transform;
	}

	.row-value {
		font-size: clamp(1.25rem, 3.4vw, 2.25rem);
		will-change: transform;
	}

	/* the mask each value slides up out of */
	.mask {
		line-height: 1.15;
	}

	.marquee-item {
		font-size: clamp(2.5rem, 8vw, 6rem);
	}
</style>