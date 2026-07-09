<script lang="ts">
	import Signup from '$lib/components/Signup.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import bg from '$lib/assets/BG_PW.jpg';
</script>

<svelte:head>
	<title>Produktworld — Festival Musique + Arts</title>
	<meta
		name="description"
		content="Produktworld · 4–6 septembre 2026 · New City Gas, Montréal."
	/>
</svelte:head>

<div class="site-bg" aria-hidden="true">
	<div class="site-bg-img" style={`background-image:url(${bg})`}></div>
	<div class="site-bg-darken"></div>
	<div class="site-bg-vignette"></div>
</div>

<main class="relative z-10">
	<Signup />
	<Footer />
</main>

<style>
	.site-bg {
		position: fixed;
		inset: 0;
		/* FIX: Changed from -10 to 0 to prevent hiding behind the body background */
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