<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from '$lib/gsap';
  import { introComplete } from '$lib/intro';
  import logo from '$lib/assets/PW_Logo.png';
  import logoSvgRaw from '$lib/assets/PW_Logo.svg?raw';

  // ─── star paths ────────────────────────────────────────────────────────────
  // Produces an 8-point star centered at (0,0)
  function makeStar(rNS: number, rEW: number, rDiag: number, rInner: number): string {
    const tipR = [rNS, rDiag, rEW, rDiag, rNS, rDiag, rEW, rDiag];
    const pts: string[] = [];
    for (let k = 0; k < 16; k++) {
      const r = k % 2 === 0 ? tipR[k / 2] : rInner;
      const a = (-90 + k * 22.5) * (Math.PI / 180);
      pts.push(`${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`);
    }
    return 'M' + pts.join(' L') + ' Z';
  }

  // Center star: lives in a -100→100 viewBox (centered at 0,0)
  const CENTER_STAR = makeStar(88, 52, 31, 10);
  // Mini star for the orbit ring; translated to its orbit position in SVG
  const MINI_STAR   = makeStar(13, 8, 5, 2);

  // ─── spinning big-top stripes ───────────────────────────────────────────────
  const STRIPES = 24, CX = 500, CY = 500, R = 1000;
  const wedges = Array.from({ length: STRIPES }, (_, i) => {
    const a0 = (i / STRIPES) * Math.PI * 2;
    const a1 = ((i + 1) / STRIPES) * Math.PI * 2;
    return {
      d: `M${CX},${CY} ` +
         `L${(CX + R * Math.cos(a0)).toFixed(1)},${(CY + R * Math.sin(a0)).toFixed(1)} ` +
         `L${(CX + R * Math.cos(a1)).toFixed(1)},${(CY + R * Math.sin(a1)).toFixed(1)} Z`,
      red: i % 2 === 0
    };
  });

  // ─── orbit ring (8 mini stars) ─────────────────────────────────────────────
  const N_ORBIT = 8, ORBIT_R = 155; // SVG units, viewBox 0–1000, center 500,500
  const orbitItems = Array.from({ length: N_ORBIT }, (_, i) => {
    const a = (i / N_ORBIT) * Math.PI * 2 - Math.PI / 2;
    return { x: 500 + ORBIT_R * Math.cos(a), y: 500 + ORBIT_R * Math.sin(a) };
  });

  // ─── scatter particles ─────────────────────────────────────────────────────
  const N_PART = 14;
  const particleList = Array.from({ length: N_PART }, (_, i) => ({
    angle: (i / N_PART) * Math.PI * 2,
    r:    [3, 2, 4, 2, 5, 3, 2, 4, 3, 2, 4, 5, 3, 2][i],
    fill: ['var(--color-lightaccent)', 'var(--color-lightred)', 'var(--color-beige)'][i % 3]
  }));

  // ─── refs ──────────────────────────────────────────────────────────────────
  let root             = $state<HTMLDivElement>();
  let stripesG         = $state<SVGGElement>();
  let orbitContainerEl = $state<SVGGElement>();
  let haloEl           = $state<SVGCircleElement>();
  let halo2El          = $state<SVGCircleElement>();
  let particlesG       = $state<SVGGElement>();
  let vigEl            = $state<HTMLDivElement>();
  let irisEl           = $state<HTMLDivElement>();
  let logoSvgWrap      = $state<HTMLDivElement>();
  let logoEl           = $state<HTMLImageElement>();
  let starOverlayEl    = $state<HTMLDivElement>();
  let starFillEl       = $state<SVGPathElement>();
  let starStrokeEl     = $state<SVGPathElement>();
  let done             = $state(false);

  onMount(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      introComplete.set(true); done = true; return;
    }

    // ── scroll lock (iOS-compatible fixed-position technique) ─────────────────
    const savedScrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top      = `-${savedScrollY}px`;
    document.body.style.width    = '100%';
    document.body.style.overflow = 'hidden';

    function unlockScroll() {
      document.body.style.position = '';
      document.body.style.top      = '';
      document.body.style.width    = '';
      document.body.style.overflow = '';
      window.scrollTo(0, savedScrollY);
    }

    // ── iris geometry ─────────────────────────────────────────────────────────
    const W = window.innerWidth, H = window.innerHeight;
    const LOGO_RATIO = 6.73;
    const logoW    = Math.min(W * 0.58, 480);
    const logoH    = logoW / LOGO_RATIO;
    const logoDiag = Math.sqrt((logoW / 2) ** 2 + (logoH / 2) ** 2);
    const openR    = Math.max(Math.min(W, H) * 0.40, logoDiag * 1.35);
    const fullR    = Math.ceil(Math.sqrt(W * W + H * H)) + 20;

    // ── collect DOM collections ───────────────────────────────────────────────
    const wedgeEls     = Array.from(stripesG!.querySelectorAll<SVGPathElement>('.wedge'));
    const orbitStarEls = Array.from(orbitContainerEl!.querySelectorAll<SVGPathElement>('.o-star'));
    const particleEls  = Array.from(particlesG!.querySelectorAll<SVGCircleElement>('.particle'));
    // Stroke paths are outside the <mask> definition — path[mask] excludes fill paths inside <mask>
    const svgDrawPaths = Array.from(logoSvgWrap!.querySelectorAll<SVGPathElement>('path[mask]'));

    // ── initial states ────────────────────────────────────────────────────────
    gsap.set(stripesG!,         { autoAlpha: 0 });
    gsap.set(wedgeEls,          { scale: 0, svgOrigin: '500 500' });
    gsap.set(orbitStarEls,      { scale: 0, autoAlpha: 0, transformOrigin: '50% 50%' });
    gsap.set(orbitContainerEl!, { autoAlpha: 0 });
    gsap.set([haloEl!, halo2El!], { autoAlpha: 0 });
    gsap.set(particleEls,       { autoAlpha: 0 });
    gsap.set(vigEl!,            { autoAlpha: 0 });
    gsap.set(irisEl!,           { clipPath: 'circle(0px at 50% 50%)' });
    gsap.set(logoSvgWrap!,      { autoAlpha: 0 });
    gsap.set(svgDrawPaths,      { drawSVG: '0%' });
    gsap.set(logoEl!,           { autoAlpha: 0 });
    gsap.set(starOverlayEl!,    { autoAlpha: 0, scale: 0.1 });
    gsap.set(starFillEl!,       { autoAlpha: 0 });
    gsap.set(starStrokeEl!,     { drawSVG: '0%' });

    // ── continuous loops (killed on complete / cleanup) ───────────────────────
    const stripeSpin = gsap.to(stripesG!, {
      rotation: 360, svgOrigin: '500 500',
      duration: 80, ease: 'none', repeat: -1
    });
    const orbitSpin = gsap.to(orbitContainerEl!, {
      rotation: 360, svgOrigin: '500 500',
      duration: 14, ease: 'none', repeat: -1,
      paused: true
    });
    // Counter-spin: each star rotates -360° at the same rate as the container,
    // keeping its own orientation fixed while the ring rotates.
    const orbitCounterSpin = gsap.to(orbitStarEls, {
      rotation: -360, transformOrigin: '50% 50%',
      duration: 14, ease: 'none', repeat: -1,
      paused: true
    });

    // ── master timeline ───────────────────────────────────────────────────────
    const tl = gsap.timeline({
      onComplete: () => {
        done = true;
        stripeSpin.kill();
        orbitSpin.kill();
        orbitCounterSpin.kill();
      }
    });

    tl
      // ── PHASE 1 — star ignites ──────────────────────────────────────────
      .to(starOverlayEl!, {
        autoAlpha: 1, scale: 1,
        duration: 0.55, ease: 'back.out(2.2)'
      }, 0)
      // Stroke self-draws via DrawSVG
      .to(starStrokeEl!, {
        drawSVG: '100%',
        duration: 1.4, ease: 'power2.inOut'
      }, 0.05)
      // Fill blooms in as stroke nearly finishes
      .to(starFillEl!, {
        autoAlpha: 1,
        duration: 0.5, ease: 'power2.out'
      }, 1.1)
      // First halo shockwave
      .fromTo(haloEl!,
        { attr: { r: 10 }, autoAlpha: 0.75 },
        { attr: { r: 165 }, autoAlpha: 0, duration: 1.3, ease: 'power2.out' },
        0.25)
      // Second halo (delayed pulse)
      .fromTo(halo2El!,
        { attr: { r: 10 }, autoAlpha: 0.45 },
        { attr: { r: 145 }, autoAlpha: 0, duration: 1.1, ease: 'power2.out' },
        1.2)

      // ── PHASE 2 — stripes sweep out, orbit appears ──────────────────────
      .to(stripesG!, { autoAlpha: 1, duration: 0.4 }, 1.5)
      .fromTo(wedgeEls,
        { scale: 0 },
        { scale: 1, duration: 1.3, ease: 'power3.out',
          stagger: { each: 0.027 }, svgOrigin: '500 500' }, 1.6)
      .to(vigEl!, { autoAlpha: 1, duration: 0.9 }, 1.7)

      // Orbit stars pop in with stagger
      .to(orbitContainerEl!, { autoAlpha: 1, duration: 0.1 }, 2.0)
      .to(orbitStarEls, {
        scale: 1, autoAlpha: 1,
        duration: 0.35, ease: 'back.out(3)',
        stagger: 0.09, transformOrigin: '50% 50%'
      }, 2.0)
      // Start both spins simultaneously so counter-rotation is in sync from frame 1
      .call(() => { orbitSpin.play(); orbitCounterSpin.play(); }, [], 2.7)


      // ── PHASE 3 — iris opens, logo appears ─────────────────────────────
      .addLabel('iris', 3.2)
      .to(irisEl!, {
        clipPath: `circle(${openR}px at 50% 50%)`,
        duration: 1.6, ease: 'power3.out'
      }, 'iris')

      // Star fades out the moment the circle opens — no zoom, clean exit
      .to(starOverlayEl!, {
        autoAlpha: 0,
        duration: 0.4, ease: 'power2.out'
      }, 'iris')

      // SVG logo draws itself in right after circle appears
      .to(logoSvgWrap!, { autoAlpha: 1, duration: 0.1 }, 'iris+=0.2')
      .to(svgDrawPaths, {
        drawSVG: '100%',
        duration: 1.2, ease: 'power2.inOut'
      }, 'iris+=0.2')

      // PNG logo blooms in as SVG finishes — wireframe resolves to solid
      .to(logoEl!, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' }, 'iris+=1.2')
      // SVG outline dissolves
      .to(logoSvgWrap!, { autoAlpha: 0, duration: 0.4 }, 'iris+=1.5')

      // ── PHASE 4 — the punch ─────────────────────────────────────────────
      .addLabel('punch', 4.8)

      // Orbit ring blooms outward
      .to(orbitContainerEl!, {
        scale: 5.5, autoAlpha: 0,
        svgOrigin: '500 500',
        duration: 1.0, ease: 'power3.in'
      }, 'punch')

      // Particles scatter radially
      .to(particleEls, {
        attr: {
          cx: (i) => 500 + Math.cos(particleList[i].angle) * 780,
          cy: (i) => 500 + Math.sin(particleList[i].angle) * 780
        },
        autoAlpha: 0,
        duration: 1.0, ease: 'power2.out',
        stagger: 0.04
      }, 'punch')

      // Iris punches to full screen
      .to(irisEl!, {
        clipPath: `circle(${fullR}px at 50% 50%)`,
        duration: 1.4, ease: 'power3.in'
      }, 'punch')
      .to([stripesG!, vigEl!], {
        autoAlpha: 0, duration: 0.9
      }, 'punch+=0.2')

      // ── PHASE 5 — hand off to hero ───────────────────────────────────────
      .addLabel('reveal', 'punch+=0.9')
      .call(() => { introComplete.set(true); unlockScroll(); }, [], 'reveal')
      .to(root!, { autoAlpha: 0, duration: 0.6, ease: 'power2.inOut' }, 'reveal+=0.1');

    tl.timeScale(0.95); // ~7s total

    return () => {
      tl.kill();
      stripeSpin.kill();
      orbitSpin.kill();
      orbitCounterSpin.kill();
      unlockScroll(); // safety net if component unmounts early
    };
  });
</script>

{#if !done}
  <div bind:this={root} class="intro">
    <div class="base-bg"></div>

    <!-- ── Main SVG: stripes, orbit ring, halos, particles ── -->
    <svg class="stage" viewBox="0 0 1000 1000"
         preserveAspectRatio="xMidYMid slice"
         xmlns="http://www.w3.org/2000/svg">

      <!-- Stripes -->
      <g bind:this={stripesG}>
        {#each wedges as w}
          <path class="wedge" d={w.d}
            fill={w.red ? 'var(--color-lightred)' : 'var(--color-beige)'} />
        {/each}
      </g>

      <!-- Halo shockwaves -->
      <circle bind:this={haloEl}  cx="500" cy="500" r="10"
        fill="none" stroke="var(--color-lightaccent)" stroke-width="1.5" />
      <circle bind:this={halo2El} cx="500" cy="500" r="10"
        fill="none" stroke="var(--color-lightaccent)" stroke-width="1" />

      <!-- Orbit ring container — GSAP rotates this; each star counter-rotates -->
      <g bind:this={orbitContainerEl}>
        {#each orbitItems as item}
          <path class="o-star" d={MINI_STAR}
            transform={`translate(${item.x} ${item.y})`}
            fill="var(--color-lightaccent)" />
        {/each}
      </g>

      <!-- Scatter particles (start at center, explode on punch) -->
      <g bind:this={particlesG}>
        {#each particleList as p}
          <circle class="particle" cx="500" cy="500" r={p.r} fill={p.fill} />
        {/each}
      </g>

    </svg>

    <!-- Vignette (above SVG, below iris + star) -->
    <div bind:this={vigEl} class="vignette"></div>

    <!-- ── Iris: dark circle that opens, holds SVG outline + PNG logo ── -->
    <div bind:this={irisEl} class="iris">
      <div class="iris-bg"></div>

      <!-- SVG logo outline — DrawSVG draws letterforms, then dissolves -->
      <div bind:this={logoSvgWrap} class="logo-svg-wrap" aria-hidden="true">
        {@html logoSvgRaw}
      </div>

      <!-- PNG logo — blooms in after SVG outline is drawn, stays through punch -->
      <img bind:this={logoEl} src={logo} alt="Produktworld" class="preloader-logo" />
    </div>

    <!-- ── Center star overlay (z-index above iris) ── -->
    <div bind:this={starOverlayEl} class="star-overlay">
      <svg class="cstar-svg" viewBox="-100 -100 200 200"
           xmlns="http://www.w3.org/2000/svg" overflow="visible">
        <!-- Glow: slightly larger, very transparent -->
        <path class="cstar-glow" d={CENTER_STAR} transform="scale(1.35)" />
        <!-- Fill: brand red, blooms in after stroke draws -->
        <path bind:this={starFillEl} class="cstar-fill" d={CENTER_STAR} />
        <!-- Stroke: DrawSVG traces this -->
        <path bind:this={starStrokeEl} class="cstar-stroke" d={CENTER_STAR} />
      </svg>
    </div>
  </div>
{/if}

<style>
  /* ── wrapper ── */
  .intro    { position: fixed; inset: 0; z-index: 60; overflow: hidden; }
  .base-bg  { position: absolute; inset: 0; background: var(--color-darkaccent); }

  /* ── main SVG ── */
  .stage { position: absolute; inset: 0; width: 100%; height: 100%; }

  /* ── orbit mini-stars ── */
  .o-star {
    /* transform-box: fill-box lets transformOrigin: '50% 50%' resolve to
       each star's own bounding-box center, enabling clean counter-rotation */
    transform-box: fill-box;
    transform-origin: center;
    filter: drop-shadow(0 0 4px rgba(232, 154, 60, 0.9));
  }

  /* ── scatter particles ── */
  .particle { filter: drop-shadow(0 0 3px rgba(232, 154, 60, 0.7)); }

  /* ── vignette ── */
  .vignette {
    position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background: radial-gradient(circle at 50% 50%,
      transparent 20%, rgba(0,0,0,0.90) 70%);
  }

  /* ── iris ── */
  .iris {
    position: absolute; inset: 0; z-index: 2;
    /* clip-path driven by GSAP */
  }
  .iris-bg {
    position: absolute; inset: 0;
    background: radial-gradient(circle at 50% 50%, #1e0606 0%, var(--color-darkaccent) 70%);
  }

  /* SVG logo outline: absolutely centered, draws then dissolves */
  .logo-svg-wrap {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: min(58vw, 480px);
    z-index: 1;
  }
  .logo-svg-wrap :global(svg) {
    width: 100%;
    height: auto;
    display: block;
    overflow: visible;
  }

  /* PNG logo: sits directly on top of SVG wrap, blooms in as SVG dissolves */
  .preloader-logo {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
    width: min(58vw, 480px);
    will-change: opacity;
  }

  /* ── center star overlay (above iris) ── */
  .star-overlay {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 4;
    width: min(28vmin, 180px);
    height: min(28vmin, 180px);
    filter:
      drop-shadow(0 0 18px rgba(214,  38,  28, 0.65))
      drop-shadow(0 0 42px rgba(232, 154,  60, 0.30));
  }
  .cstar-svg   { width: 100%; height: 100%; overflow: visible; }
  .cstar-glow  { fill: rgba(232, 154, 60, 0.12); transform-origin: 0 0; }
  .cstar-fill  { fill: var(--color-lightred); }
  .cstar-stroke {
    fill: none;
    stroke: var(--color-lightaccent);
    stroke-width: 4;
    stroke-linejoin: round;
  }
</style>