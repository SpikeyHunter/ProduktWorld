<script lang="ts">
	import { onMount } from 'svelte';
	import Signup from '$lib/components/Signup.svelte';
	import Info from '$lib/components/Info.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import bg from '$lib/assets/BG_PW.jpg';
	import { isInfoSectionVisible } from '$lib/config';

	// Starts false (safe for SSR) and flips on the client once we can check
	// window.location.hostname — see $lib/config.ts to change the toggle.
	let showInfo = $state(false);
	onMount(() => {
		showInfo = isInfoSectionVisible();
	});
</script>

<div class="site-bg" aria-hidden="true">
	<div class="site-bg-img" style={`background-image:url(${bg})`}></div>
	<div class="site-bg-darken"></div>
	<div class="site-bg-vignette"></div>
</div>

<main class="relative z-10">
	<Signup />
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
	.site-bg-img {
		position: absolute;
		inset: 0;
		background-size: cover;
		background-position: 50% 25%;
		background-repeat: no-repeat;
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