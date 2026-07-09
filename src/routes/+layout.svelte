<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Preloader from '$lib/components/Preloader.svelte';
	import PageTransition from '$lib/components/PageTransition.svelte';
	import { introComplete } from '$lib/intro';
	import { lenisStore } from '$lib/lenis';

	let { children } = $props();

	const DEBUG_SCROLL = true;
	const log = (...a: any[]) => DEBUG_SCROLL && console.log('[route-scroll]', ...a);

	let lenisReady = $state(false);
	let introReady = $state(false);
	let lenisRef: any = null;
	let hasHandledInitialRoute = false;
	let pendingRaf = 0;

	function waitForElement(id: string, timeoutMs = 6000): Promise<HTMLElement | null> {
		return new Promise((resolve) => {
			const started = performance.now();
			const tick = () => {
				const el = document.getElementById(id);
				if (el) return resolve(el);
				if (performance.now() - started > timeoutMs) return resolve(null);
				pendingRaf = requestAnimationFrame(tick);
			};
			tick();
		});
	}

	function waitForScrollUnlock(timeoutMs = 6000): Promise<void> {
		return new Promise((resolve) => {
			const started = performance.now();
			const tick = () => {
				if (document.body.style.position !== 'fixed') return resolve();
				if (performance.now() - started > timeoutMs) return resolve();
				pendingRaf = requestAnimationFrame(tick);
			};
			tick();
		});
	}

	const nextFrame = () => new Promise((r) => requestAnimationFrame(r));
	const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

	// ── Scroll feel ─────────────────────────────────────────────────────────
	// Tune these two if it still feels off.
	const SETTLE_MS = 600; // beat of stillness after the preloader before moving
	const SCROLL_DURATION = 2.6; // seconds of travel (was 1.5 — felt like a lurch)

	// Gentle S-curve: creeps away from rest, coasts, glides to a stop.
	// Lenis's default easing ramps up too hard for a full-viewport jump.
	const easeInOutCubic = (t: number) =>
		t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

	/** Whatever is actually scrolling: document, or <body>. */
	function currentScrollY(): number {
		return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
	}

	async function scrollToInformation(isInitial = false): Promise<boolean> {
		await waitForScrollUnlock();
		log('scroll unlocked');

		const target = await waitForElement('information');
		if (!target) {
			log('BAIL: #information never appeared. Set INFO_SECTION_VISIBILITY="both" in config.ts.');
			return false;
		}

		await nextFrame();
		await nextFrame();

		const before = currentScrollY();
		const targetY = Math.round(target.getBoundingClientRect().top + before);

		log('measured', {
			before,
			targetY,
			docHeight: document.documentElement.scrollHeight,
			winHeight: window.innerHeight,
			bodyPosition: getComputedStyle(document.body).position,
			htmlOverflowY: getComputedStyle(document.documentElement).overflowY,
			bodyOverflowY: getComputedStyle(document.body).overflowY
		});

		if (targetY <= 0) {
			log('BAIL: targetY is 0 — #information is at the top of the document.');
			return false;
		}

		// A beat of stillness so the intro's final frame can breathe before
		// the page starts moving — this is most of what made it feel "intense".
		if (isInitial) await wait(SETTLE_MS);

		// ── Attempt 1: Lenis ────────────────────────────────────────────────
		if (lenisRef) {
			lenisRef.start?.();
			lenisRef.scrollTo(targetY, {
				duration: SCROLL_DURATION,
				easing: easeInOutCubic,
				lock: false,
				force: true
			});
			await wait(900); // give it time to visibly move
			const mid = currentScrollY();
			log('after lenis attempt', { mid, moved: mid !== before });
			if (mid !== before) {
				log('OK: Lenis is scrolling.');
				return true;
			}
			log('Lenis did NOT move the page — falling back to native scroll.');
		} else {
			log('no lenis instance — using native scroll');
		}

		// ── Attempt 2: native (proves whether the page can scroll at all) ────
		window.scrollTo({ top: targetY, behavior: 'smooth' });
		await wait(700);
		const after = currentScrollY();
		log('after native window.scrollTo', { after, moved: after !== before });

		if (after === before) {
			// ── Attempt 3: the element's own scrollIntoView ────────────────────
			log('window.scrollTo failed too — trying scrollIntoView');
			target.scrollIntoView({ behavior: 'smooth', block: 'start' });
			await wait(700);
			log('after scrollIntoView', { y: currentScrollY() });
		}

		return true;
	}

	function scrollToTop() {
		if (lenisRef) {
			lenisRef.start?.();
			lenisRef.scrollTo(0, { duration: 1.8, easing: easeInOutCubic, force: true });
		} else {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	$effect(() => {
		const pathname = $page.url.pathname;
		const ready = lenisReady && introReady;
		log('effect', { pathname, lenisReady, introReady });
		if (!ready) return;

		const wantsInfo = pathname.startsWith('/information');

		if (!hasHandledInitialRoute) {
			if (!wantsInfo) {
				hasHandledInitialRoute = true;
				return;
			}
			scrollToInformation(true).then((ok) => {
				if (ok) hasHandledInitialRoute = true;
			});
			return;
		}

		if (wantsInfo) scrollToInformation();
		else scrollToTop();
	});

	onMount(() => {
		if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
		window.scrollTo(0, 0);

		let cleanup = () => {};

		const unsubIntro = introComplete.subscribe((v) => {
			introReady = v;
			log('introComplete ->', v);
		});

		(async () => {
			const Lenis = (await import('lenis')).default;
			const { gsap, ScrollTrigger } = await import('$lib/gsap');

			const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
			lenisRef = lenis;
			lenisStore.set(lenis);
			lenis.on('scroll', ScrollTrigger.update);
			const raf = (time: number) => lenis.raf(time * 1000);
			gsap.ticker.add(raf);
			gsap.ticker.lagSmoothing(0);
			ScrollTrigger.refresh();

			lenisReady = true;
			log('lenis ready');

			cleanup = () => {
				gsap.ticker.remove(raf);
				lenis.destroy();
				lenisStore.set(null);
			};
		})();

		return () => {
			unsubIntro();
			if (pendingRaf) cancelAnimationFrame(pendingRaf);
			cleanup();
		};
	});
</script>

<PageTransition />
<Preloader />
{@render children()}