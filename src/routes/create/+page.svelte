<script>
  import { browser } from '$app/environment';
    import maplibregl from 'maplibre-gl'; // or "const maplibregl = require('maplibre-gl');"
    let availableFeatures = ["zooming","panning","tilt","create-itinerary"]
    let active="zooming"
    if(browser){
        let map = new maplibregl.Map({
            container: 'map',
            style: 'https://demotiles.maplibre.org/style.json', // stylesheet location
            center: [0, 40], // starting position [lng, lat]
            zoom: 3// starting zoom
        });
        console.log({map:map})
        console.log("Hello")
    }
    
</script>
<nav class="bg-black h-8 flex">
    {#each availableFeatures as feature}
        <div class="box text-amber-200 px-8 border-r-2 border-amber-400 cursor-pointer" class:active={active==feature} on:click={()=>{active=feature}}>
            {feature}
        </div>
    {/each}
</nav>
{#if {browser}}
    <div id="map" style='width: 600px; height: 400px;'></div>
{/if}

<style>
    .active{
        background: rgb(59, 59, 59);
        border-top: solid wheat;
    }
</style>