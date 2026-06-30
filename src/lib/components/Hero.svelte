<script lang="ts">
  import { onMount } from 'svelte';
  import { introComplete } from '$lib/intro';
  import logo from '$lib/assets/PW_Logo.png';

  const COUNT = 48;
  const bulbs = Array.from({ length: COUNT }, (_, i) => i);

  let section = $state<HTMLElement>();
  let logoEl  = $state<HTMLImageElement>();
  let meta    = $state<HTMLDivElement>();
  let glow    = $state<HTMLDivElement>();

  onMount(() => {
    let unsub = () => {};
    
    (async () => {
      // Dynamic import protects the server
      const { gsap, ScrollTrigger } = await import('$lib/gsap');
      
      gsap.set(logoEl!, { autoAlpha: 0 });
      gsap.set(Array.from(meta!.children), { y: 18, autoAlpha: 0 });

      unsub = introComplete.subscribe((v) => {
        if (!v) return;
  
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          gsap.set(logoEl!, { autoAlpha: 1 });
          gsap.set(Array.from(meta!.children), { y: 0, autoAlpha: 1 });
          return;
        }
  
        gsap.timeline({ delay: 0.25 })
          .to(logoEl!, { autoAlpha: 1, duration: 0.9, ease: 'power2.out' })
          .to(Array.from(meta!.children), {
            y: 0, autoAlpha: 1,
            duration: 0.65, stagger: 0.11,
            ease: 'power3.out'
          }, '-=0.35');
  
        const st = { trigger: section!, start: 'top top', end: 'bottom top', scrub: true };
        gsap.to(glow!,   { yPercent: 35, ease: 'none', scrollTrigger: st });
        gsap.to(logoEl!, { yPercent: -9, ease: 'none', scrollTrigger: st });
      });
    })();
    
    return () => unsub();
  });
</script>
  
  <section bind:this={section} id="top"
    class="relative min-h-[100svh] overflow-hidden">
  
    <!-- Background radial gradient -->
    <div class="absolute inset-0 -z-10"
      style="background: radial-gradient(120% 90% at 50% 30%,
             var(--color-darkred) 0%, var(--color-darkaccent) 62%);"></div>
  
    <!-- Ambient amber glow centred on the logo -->
    <div bind:this={glow}
      class="absolute left-1/2 top-1/2 -z-10 h-[60vmin] w-[60vmin]
             -translate-x-1/2 -translate-y-1/2 rounded-full"
      style="background: radial-gradient(circle, rgba(232,154,60,0.20), transparent 65%);
             filter: blur(32px);">
    </div>
  
    <!-- Marquee bulb ring (decorative, behind everything) -->
    <div class="bulb-ring absolute left-1/2 top-1/2 -z-10">
      {#each bulbs as i}
        <span class="bulb"
          style="transform: rotate({(i / COUNT) * 360}deg) translateY(-39vmin);
                 animation-delay: {i * 0.04}s;">
        </span>
      {/each}
    </div>
  
    <!--
      LOGO — lives at exactly 50% / 50% of this 100svh section.
      Section starts at top:0 (header is fixed/overlay), so 50% == 50vh,
      which is identical to the preloader's grid place-items-center.
  
      ⚠ Keep width in sync with .preloader-logo in Preloader.svelte.
         Both = min(58vw, 480px).  Change one → change the other.
    -->
    <div class="absolute inset-0 grid place-items-center" style="z-index: 1; pointer-events: none;">
      <img
        bind:this={logoEl}
        src={logo}
        alt="Produktworld — Festival Musique + Arts"
        class="hero-logo"
      />
    </div>
  
    <!--
      META — top: calc(50% + 68px) places the block just below the logo.
      Derived from logo dimensions (480px / 6.73 = 71px tall → half = 36px)
      plus a 32px breathing gap.  Pure CSS, no JS measurement → resize-safe.
    -->
    <div
      bind:this={meta}
      class="absolute inset-x-0 flex flex-col items-center gap-2 text-center px-5"
      style="top: calc(50% + 68px); z-index: 1;"
    >
      <p class="text-sm md:text-base tracking-[0.25em] uppercase">
        Festival Musique + Arts
      </p>
      <p class="font-display text-lightaccent text-lg md:text-xl tracking-[0.2em] uppercase">
        5 — 7 Septembre 2026
      </p>
      <p class="text-xs tracking-[0.3em] uppercase text-beige/60">
        New City Gas · Montréal
      </p>
    </div>
  
    <!-- Scroll hint -->
    <div
      class="absolute bottom-8 left-1/2 -translate-x-1/2
             text-[10px] tracking-[0.3em] uppercase text-beige/50 animate-pulse"
      style="z-index: 1;"
    >
      Défilez ↓
    </div>
  </section>
  
  <style>
    /*
      hero-logo width MUST match .preloader-logo in Preloader.svelte.
      Both = min(58vw, 480px).
    */
    .hero-logo {
      width: min(58vw, 480px);
      filter: drop-shadow(0 0 38px rgba(232, 154, 60, 0.28));
      will-change: transform, opacity;
    }
  
    /* ── bulb ring ── */
    .bulb-ring { width: 0; height: 0; }
    .bulb {
      position: absolute;
      left: 0; top: 0;
      width: 7px; height: 7px; margin: -3.5px;
      border-radius: 50%;
      background: var(--color-lightaccent);
      box-shadow: 0 0 8px 2px rgba(232, 154, 60, 0.75);
      animation: bulbpulse 1.6s ease-in-out infinite;
    }
    @keyframes bulbpulse {
      0%, 100% { opacity: 0.15; }
      50%       { opacity: 1; }
    }
  </style>