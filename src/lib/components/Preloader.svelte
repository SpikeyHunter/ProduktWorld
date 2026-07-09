<script lang="ts">
	import { onMount } from 'svelte';
	import { introComplete } from '$lib/intro';
	import logo from '$lib/assets/PW_Logo.png';
	import bg from '$lib/assets/BG_PW.jpg';

	// ─── hypnotic vortex geometry ──────────────────────────────────────────────
	// Curved swirl blades: gentle curl at the rim, tight twist at the center.
	// R_OUT is oversized so the stripes ALWAYS extend beyond the window —
	// no visible rim on any screen or aspect ratio.
	const N_BLADES = 18;
	const CX = 500,
		CY = 500;
	const R_OUT = 1600; // > max half-diagonal of the sliced viewBox on any screen
	const TWIST = 2.35; // total swirl (radians) from rim to center
	const TWIST_POW = 1.7; // >1 → twist accelerates near the center
	const SAMPLES = 44; // high sample count → visually smooth curved edges

	function bladePath(i: number): string {
		const base = (i / N_BLADES) * Math.PI * 2;
		const width = Math.PI / N_BLADES; // blade fills half the pitch → equal gaps
		const pts: string[] = [];
		const ang = (t: number, off: number) => base + off + TWIST * Math.pow(1 - t, TWIST_POW);
		// outer rim → center along leading edge
		for (let s = 0; s <= SAMPLES; s++) {
			const t = 1 - (s / SAMPLES) * 0.995; // radius fraction 1 → ~0.005
			const a = ang(t, 0);
			pts.push(
				`${(CX + R_OUT * t * Math.cos(a)).toFixed(2)},${(CY + R_OUT * t * Math.sin(a)).toFixed(2)}`
			);
		}
		// center → outer rim along trailing edge
		for (let s = SAMPLES; s >= 0; s--) {
			const t = 1 - (s / SAMPLES) * 0.995;
			const a = ang(t, width);
			pts.push(
				`${(CX + R_OUT * t * Math.cos(a)).toFixed(2)},${(CY + R_OUT * t * Math.sin(a)).toFixed(2)}`
			);
		}
		return 'M' + pts.join(' L') + ' Z';
	}

	const blades = Array.from({ length: N_BLADES }, (_, i) => bladePath(i));
	const HALF = N_BLADES / 2;

	// ─── refs ──────────────────────────────────────────────────────────────────
	let root = $state<HTMLDivElement>();
	let vortexG = $state<SVGGElement>();
	let irisEl = $state<HTMLDivElement>();
	let irisBgImgEl = $state<HTMLDivElement>();
	let logoEl = $state<HTMLImageElement>();
	let done = $state(false);

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			// Respect reduced motion (skip the vortex entirely — no spin, no
			// scale, no lift), but avoid an instant hard cut. A plain opacity
			// fade isn't the kind of motion this setting is meant to suppress
			// (it's not a transform/parallax/spin), and it reads as an
			// intentional transition rather than a flash/glitch.
			introComplete.set(true);
			if (root) {
				root.style.transition = 'opacity 300ms ease-out';
				root.style.opacity = '0';
				setTimeout(() => {
					done = true;
				}, 300);
			} else {
				done = true;
			}
			return;
		}

		// ── scroll lock (iOS-compatible fixed-position technique) ─────────────────
		const savedScrollY = 0; // always land at the top after the intro, not wherever it was before reload
		document.body.style.position = 'fixed';
		document.body.style.top = `-${savedScrollY}px`;
		document.body.style.width = '100%';
		document.body.style.overflow = 'hidden';

		function unlockScroll() {
			document.body.style.position = '';
			document.body.style.top = '';
			document.body.style.width = '';
			document.body.style.overflow = '';
			window.scrollTo(0, savedScrollY);
		}

		// Preload the background image so the crossfade is instant
		const preImg = new Image();
		preImg.src = bg;

		let tl: any;
		let vortexSpin: any;
		let liftTween: any;

		(async () => {
			const { gsap } = await import('$lib/gsap');

			const W = window.innerWidth,
				H = window.innerHeight;
			const openR = Math.min(W, H) * 0.36; // the "circle" the vortex opens into
			const fullR = Math.ceil(Math.sqrt(W * W + H * H) / 2) + 40;

			const bladeEls = Array.from(vortexG!.querySelectorAll<SVGPathElement>('.blade'));

			// ── initial states ────────────────────────────────────────────────────
			gsap.set(bladeEls, { autoAlpha: 0, force3D: true });
			gsap.set(vortexG!, {
				force3D: true,
				transformOrigin: '50% 50%',
				transformPerspective: 1000
			});
			gsap.set(irisEl!, { clipPath: 'circle(0px at 50% 50%)' });
			gsap.set(irisBgImgEl!, { autoAlpha: 0 });
			gsap.set(logoEl!, { xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.92, force3D: true });

			// Slow hypnotic rotation — runs the whole time, so the wheel is never
			// static and every phase blends into the next.
			vortexSpin = gsap.to(vortexG!, {
				rotation: 360,
				svgOrigin: '500 500',
				duration: 55,
				ease: 'none',
				repeat: -1
			});

			// ── master timeline — one continuous shot, every phase overlaps ───────
			tl = gsap.timeline({
				defaults: { ease: 'power2.inOut' },
				onComplete: () => {
					done = true;
					vortexSpin?.kill();
				}
			});

			tl
				// ── PHASE 1 — blades appear: two opposite blades at a time,
				//              sweeping clockwise, quick ──────────────────────────
				.set(
					bladeEls,
					{
						autoAlpha: 1,
						stagger: (i: number) => (i % HALF) * 0.055
					},
					0.15
				)

				// ── PHASE 2 — one long continuous dive into the middle ────────────
				// A single 3.2s ease (no stop-and-go) — the "breathe" step is gone.
				.call(
					() => {
						gsap.to(vortexSpin, {
							timeScale: 2.3,
							duration: 0.7,
							ease: 'power2.out'
						});
					},
					[],
					1.05
				)
				.to(
					vortexG!,
					{
						scale: 8,
						svgOrigin: '500 500',
						duration: 2.7,
						ease: 'power3.in'
					},
					1.1
				)
				// after the dive settles, keep drifting deeper until covered —
				// the stripes never freeze and never end before the iris eats them
				.to(vortexG!, { scale: 10, svgOrigin: '500 500', duration: 2.6, ease: 'none' }, 3.3)

				// ── PHASE 3 — the circle opens mid-dive (overlapping) ─────────────
				.to(
					irisEl!,
					{ clipPath: `circle(${openR}px at 50% 50%)`, duration: 1.5, ease: 'power2.inOut' },
					2.0
				)
				// logo fades up on pure black while the circle is still growing
				.to(logoEl!, { autoAlpha: 1, scale: 1, duration: 1.1, ease: 'power2.out' }, 2.35)

				// ── PHASE 4 — circle blooms full-screen, BG_PW.jpg fades in ───────
				// Starts before the logo tween ends → no visible "step".
				.to(
					irisEl!,
					{ clipPath: `circle(${fullR}px at 50% 50%)`, duration: 1.6, ease: 'power2.inOut' },
					3.3
				)
				.to(irisBgImgEl!, { autoAlpha: 1, duration: 1.4, ease: 'power2.inOut' }, 3.45)
				.set(vortexG!, { autoAlpha: 0 }, 4.8) // fully covered by now

				// ── PHASE 5 — logo glides to the top (overlaps the bloom tail) ────
				.addLabel('lift', 4.1)
				.call(
					() => {
						// Measure the real landing spot in the page beneath (pixel-perfect
						// on any screen size / orientation).
						const target = document.getElementById('page-logo');
						let x = 0,
							y = -(H * 0.36),
							s = 0.72; // fallback if page not mounted yet
						if (target && logoEl) {
							const r = target.getBoundingClientRect();
							x = r.left + r.width / 2 - W / 2;
							y = r.top + r.height / 2 - H / 2;
							s = r.width / logoEl.offsetWidth;
						}
						liftTween = gsap.to(logoEl!, {
							x,
							y,
							scale: s,
							duration: 0.85,
							ease: 'power3.out'
						});
					},
					[],
					'lift'
				)

				// ── PHASE 6 — hand off to the page ────────────────────────────────
				// BG_PW.jpg does NOT disappear: the site's fixed background
				// (+page.svelte) is the exact same darkened + vignetted image, so
				// this fade is a crossfade between identical pixels.
				.addLabel('reveal', 'lift+=0.55')
				.call(
					() => {
						introComplete.set(true);
						unlockScroll();
					},
					[],
					'reveal'
				)
				.to(root!, { autoAlpha: 0, duration: 0.55, ease: 'power1.out' }, 'reveal+=0.1');
		})();

		return () => {
			tl?.kill();
			vortexSpin?.kill();
			liftTween?.kill();
			unlockScroll();
		};
	});
</script>

{#if !done}
	<div bind:this={root} class="intro">
		<div class="base-bg"></div>

		<!-- Vortex — pure vector swirl, beige blades on black -->
		<svg
			class="stage"
			viewBox="0 0 1000 1000"
			preserveAspectRatio="xMidYMid slice"
			xmlns="http://www.w3.org/2000/svg"
			shape-rendering="geometricPrecision"
		>
			<g bind:this={vortexG}>
				{#each blades as d}
					<path class="blade" {d} />
				{/each}
			</g>
		</svg>

		<!-- Iris — the circle the vortex opens into -->
		<div bind:this={irisEl} class="iris">
			<div class="iris-bg-black"></div>
			<div bind:this={irisBgImgEl} class="iris-bg-img-wrap">
				<div class="iris-bg-img" style={`background-image:url(${bg})`}></div>
				<div class="iris-darken"></div>
				<div class="iris-vignette"></div>
			</div>
			<img bind:this={logoEl} src={logo} alt="Produktworld" class="preloader-logo" />
		</div>
	</div>
{/if}

<style>
	/*
	  ⚠ IMPORTANT — initial hidden states live HERE, in CSS, not in the
	  gsap.set() calls in <script>.

	  The markup paints as soon as the component mounts, but the gsap.set()
	  calls can't run until `await import('$lib/gsap')` resolves (a network
	  round-trip). In that gap the browser was painting the iris full-screen —
	  background image at full opacity, logo off-center (because the -50%/-50%
	  centering also comes from gsap) — which is the flash you see on reload.

	  CSS ships with the document, so these rules apply on the very first
	  paint. The gsap.set() calls remain as-is and simply re-assert the same
	  values once gsap loads; they're the source of truth for the animation,
	  these are the source of truth for frame zero. Keep the two in sync.
	*/
	.intro {
		position: fixed;
		inset: 0;
		z-index: 60;
		overflow: hidden;
	}
	.base-bg {
		position: absolute;
		inset: 0;
		background: var(--color-darkaccent);
	}
	.stage {
		transform: translateZ(0);
		backface-visibility: hidden;
		will-change: transform;
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	/*
	  Smooth anti-aliased edges: a thin round-joined stroke in the same beige
	  softens the vector edge, and geometricPrecision on the <svg> keeps the
	  curves crisp while zooming.
	*/
	.blade {
		fill: var(--color-beige);
		stroke: var(--color-beige);
		stroke-width: 1.4;
		stroke-linejoin: round;
		paint-order: stroke fill;
		will-change: transform, opacity;
		transform: translateZ(0);
		backface-visibility: hidden;

		/* ⚠ Initial state in CSS, not gsap — see note at top of <style>. */
		opacity: 0;
		visibility: hidden;
	}

	/* ── iris ── */
	.iris {
		transform: translateZ(0);
		backface-visibility: hidden;
		position: absolute;
		inset: 0;
		z-index: 2;
		will-change: clip-path;

		/* ⚠ Closed until the timeline opens it. Without this, the iris paints
		   full-screen (bg image + logo) during the `await import('$lib/gsap')`. */
		clip-path: circle(0px at 50% 50%);
	}
	/* Pure black backdrop — the logo reveals on plain black, no glow */
	.iris-bg-black {
		position: absolute;
		inset: 0;
		background: var(--color-darkaccent);
	}

	/*
	  ⚠ These three layers must visually match the site background
	  in +page.svelte (.site-bg) so the handoff crossfade is invisible.
	*/
	.iris-bg-img-wrap {
		position: absolute;
		inset: 0;

		/* ⚠ Initial state in CSS, not gsap. */
		opacity: 0;
		visibility: hidden;
	}
	.iris-bg-img {
		position: absolute;
		inset: 0;
		background-size: cover;
		background-position: 50% 25%;
		background-repeat: no-repeat;
	}
	.iris-darken {
		position: absolute;
		inset: 0;
		background: rgba(13, 7, 6, 0.38);
	}
	.iris-vignette {
		position: absolute;
		inset: 0;
		background: radial-gradient(ellipse at 50% 42%, transparent 42%, rgba(0, 0, 0, 0.78) 100%);
	}

	.preloader-logo {
		position: absolute;
		top: 50%;
		left: 50%;
		width: min(58vw, 480px);
		z-index: 2;
		will-change: transform, opacity;

		/* ⚠ Mirrors gsap's { xPercent: -50, yPercent: -50, scale: 0.92,
		   autoAlpha: 0 }. Without this the logo paints off-center at full
		   opacity before gsap loads — that was the visible flash. */
		transform: translate(-50%, -50%) scale(0.92);
		opacity: 0;
		visibility: hidden;
	}
</style>