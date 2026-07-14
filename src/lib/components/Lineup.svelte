<script lang="ts">
	import { onMount } from 'svelte';
	import { LINEUP, LINEUP_EYEBROW, LINEUP_TITLE } from '$lib/data/lineup';

	let section = $state<HTMLElement>();
	let eyebrowEl = $state<HTMLElement>(); 
	let subtitleEl = $state<HTMLElement>(); 
	let daysWrap = $state<HTMLElement>();

	onMount(() => {
		let ctx: any;

		(async () => {
			const { gsap, ScrollTrigger, SplitText } = await import('$lib/gsap');
			const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

			ctx = gsap.context(() => {
				const dayEls = Array.from(daysWrap!.querySelectorAll<HTMLElement>('.day'));
				const dateEls = dayEls.map((d) => d.querySelector<HTMLElement>('.date')!);
				const headEls = Array.from(daysWrap!.querySelectorAll<HTMLElement>('.head'));
				const supportEls = Array.from(daysWrap!.querySelectorAll<HTMLElement>('.support-el'));
				const localEls = Array.from(daysWrap!.querySelectorAll<HTMLElement>('.local-el'));
				const vRules = Array.from(daysWrap!.querySelectorAll<HTMLElement>('.day-rule'));

				// ── Reduced motion: show everything, no animation ──────────────────
				if (reduced) {
					gsap.set([dateEls, headEls, supportEls, localEls, subtitleEl!], {
						autoAlpha: 1,
						y: 0,
						yPercent: 0
					});
					gsap.set([vRules], { scaleX: 1, scaleY: 1 });
					return;
				}

				// ── Big title (was the eyebrow): split into words → chars ──────────
				const titleSplit = new SplitText(eyebrowEl!, {
					type: 'words,chars',
					wordsClass: 'split-word'
				});
				gsap.set(titleSplit.chars, { yPercent: 115, rotate: 5, skewY: 4, force3D: true });
				gsap.set(subtitleEl!, { autoAlpha: 0, y: 12 });

				// ── Initial states ─────────────────────────────────────────────────
				gsap.set(dateEls, { autoAlpha: 0 });
				gsap.set(headEls, { yPercent: 112 }); 
				gsap.set(supportEls, { autoAlpha: 0, y: 14 });
				gsap.set(localEls, { autoAlpha: 0, y: 10 });
				gsap.set(vRules, { scaleY: 0, transformOrigin: 'top center' });

				// ── Entrance timeline — fires once when the section arrives ─────────
				const tl = gsap.timeline({
					scrollTrigger: { trigger: section, start: 'top 68%', once: true }
				});

				tl
					// big title
					.to(titleSplit.chars, {
						yPercent: 0,
						rotate: 0,
						skewY: 0,
						duration: 1.05,
						ease: 'power4.out',
						stagger: { each: 0.018, from: 'start' }
					})
					.to(subtitleEl!, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.55')
					// day dates (cascade across columns)
					.to(dateEls, { autoAlpha: 1, duration: 0.01, stagger: 0.12 }, '-=0.3')
					// scramble the dates in
					.to(
						dateEls,
						{
							duration: 0.9,
							ease: 'none',
							scrambleText: { text: '{original}', chars: 'upperCase', speed: 0.6 },
							stagger: 0.12
						},
						'<'
					)
					// headliners rise out of their masks (cascade)
					.to(headEls, { yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.09 }, '-=0.35')
					// vertical dividers draw down
					.to(vRules, { scaleY: 1, duration: 0.8, ease: 'power2.out', stagger: 0.12 }, '-=0.8')
					// support name fades up
					.to(
						supportEls,
						{ autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.06 },
						'-=0.6'
					)
					// local name(s) trail slightly behind support
					.to(
						localEls,
						{ autoAlpha: 1, y: 0, duration: 0.55, ease: 'power2.out', stagger: 0.06 },
						'-=0.4'
					);

				// ── Ambient parallax on scrub (desktop only) ───────────────────────
				if (window.innerWidth >= 768) {
					const st = {
						trigger: section,
						start: 'top bottom',
						end: 'bottom top',
						scrub: 1
					};
					dayEls.forEach((d, i) => {
						const depth = 4 + i * 2.5; 
						gsap.fromTo(
							d,
							{ yPercent: depth },
							{ yPercent: -depth, ease: 'none', scrollTrigger: st }
						);
					});
				}

				ScrollTrigger.refresh();
			}, section);
		})();

		return () => ctx?.revert();
	});
</script>

<section
	id="lineup"
	bind:this={section}
	class="relative min-h-[100svh] overflow-hidden flex flex-col justify-center
	       py-16 sm:py-28 px-6 sm:px-10"
>
	<div class="relative z-10 mx-auto w-full max-w-6xl text-center">
		<!-- ── header — Swapped colors: beige for big title, lightaccent for subtitle ── -->
		<h2 bind:this={eyebrowEl} class="big-title font-black text-beige leading-[0.9] uppercase">
			{LINEUP_EYEBROW}
		</h2>
		<p bind:this={subtitleEl} class="sub-title mt-1 sm:mt-2 text-lightaccent tracking-[0.35em] uppercase">
			{LINEUP_TITLE}
		</p>

		<!-- ── the bill: 3 columns on desktop, stacked on mobile ── -->
		<div
			bind:this={daysWrap}
			class="mt-8 sm:mt-14 md:mt-20 grid grid-cols-1 md:grid-cols-3
			       gap-y-8 sm:gap-y-10 md:gap-y-0 md:gap-x-12"
		>
			{#each LINEUP as day, i}
				<div class="day relative flex flex-col items-center">
					<!-- vertical divider (desktop only), sits in the gutter -->
					{#if i > 0}
						<span
							aria-hidden="true"
							class="day-rule hidden md:block absolute -left-6 top-[6%] bottom-[6%] w-px bg-beige/15"
						></span>
					{/if}

					<!-- date - Increased size, tight margin below -->
					<p class="date text-lightred text-[22px] sm:text-[28px] uppercase font-bold">
						{day.date}
					</p>

					<!-- headliner(s) - Removed top margin entirely to tighten gap -->
					<div class="flex flex-col items-center gap-0 mt-0">
						{#each day.headliners as name}
							<span class="mask block overflow-hidden">
								<span
									class="head block font-black text-beige uppercase leading-[0.95] [text-wrap:balance]"
								>
									{name}
								</span>
							</span>
						{/each}
					</div>

					<!-- support — uppercase, red, minimum top margin -->
					<p class="support-el mt-0.5 sm:mt-1 font-bold text-lightred leading-none uppercase">
						{day.support}
					</p>

					<!-- locals — smaller, red, zero margin to sit flush under support -->
					<div class="mt-0 flex flex-col gap-0 items-center">
						{#each day.locals as name}
							<p class="local-el font-semibold text-lightred/90 leading-none">{name}</p>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	/*
	  Increased clamp values across the board for larger text on both mobile (first value)
	  and desktop (last value).
	*/
	.big-title {
		font-size: clamp(2.2rem, 9vw, 4.5rem);
		letter-spacing: 0.02em;
		white-space: nowrap;
	}
	.big-title :global(.split-word) {
		display: inline-block;
	}
	.big-title :global(.split-word > div) {
		display: inline-block;
		will-change: transform;
	}

	.sub-title {
		font-size: clamp(1.4rem, 3.5vw, 2.2rem);
	}

	.date {
		letter-spacing: 0.01em; /* 1% */
	}

	.head {
		font-size: clamp(2.1rem, 5.3vw, 3.1rem);
		letter-spacing: -0.04em; /* -4% */
		will-change: transform;
	}
	
	.mask {
		/* Tightened line height from 1.08 to 0.95 to reduce space between B2B names */
		line-height: 0.95;
		padding-bottom: 0.1em; /* Ensures bottom of letters aren't cut off by tight line-height */
	}

	.support-el {
		font-size: clamp(1.4rem, 4vw, 2.4rem);
		letter-spacing: -0.04em; /* -4% */
	}

	.local-el {
		font-size: clamp(1.2rem, 2.2vw, 1.5rem);
		letter-spacing: -0.04em; /* -4% */
	}

	.day-rule {
		will-change: transform;
	}

	@media (max-width: 767px) {
		#lineup::before {
			content: '';
			position: absolute;
			inset: 0;
			background: rgba(0, 0, 0, 0.35);
			z-index: 1;
			pointer-events: none;
		}
	}
</style>