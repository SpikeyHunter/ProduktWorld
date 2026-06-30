<script lang="ts">
  import { onMount } from 'svelte';
  
  let el = $state<HTMLElement>();
  
  onMount(() => {
    let trigger: any;
    
    (async () => {
      const { gsap } = await import('$lib/gsap');
      const anim = gsap.from(el!, { autoAlpha: 0, y: 30, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el!, start: 'top 90%' } });
        
      trigger = anim.scrollTrigger;
    })();
    
    return () => trigger?.kill();
  });
</script>
  
  <footer bind:this={el}
    class="border-t border-beige/15 px-5 md:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs tracking-[0.2em] uppercase">
    <span class="font-display font-bold text-base normal-case tracking-normal">Prodkt</span>
    <span class="text-beige/60">5 — 7 Septembre 2026 · Montréal</span>
    <span class="flex items-center gap-1">New City Gas ⌂</span>
  </footer>