<script>
	import { browser } from '$app/environment';
    import maplibregl from 'maplibre-gl'; // or "const maplibregl = require('maplibre-gl');"
    import { onMount } from 'svelte';
    import {createFFmpeg,fetchFile} from "@ffmpeg/ffmpeg";
    import html2canvas from 'html2canvas';
    let availableFeatures = ["zooming","panning","tilt","create-itinerary"]
    let active="zooming"
    let map=null,ffmpeg;
    let lon=80.28,lat=13.077,minz=3,maxz=6;
    onMount(()=>{
        map = new maplibregl.Map({
            container: 'map',
            style: 'https://demotiles.maplibre.org/style.json', // stylesheet location
            center: [80.28,13.077], // starting position [lng, lat]
            zoom: 3,
            preserveDrawingBuffer: true // starting zoom
        }); 
        ffmpeg = createFFmpeg({ log: true });
    })
    class zoomer{
        constructor(map,min,max,lat,lon){
            this.min=min
            this.max=max
            this.lat=lat
            this.lon=lon
            this.skip=false
            this.map=map
            this.canvasarr = []
        }
        setView(){
            map.flyTo({
                center: [this.lon, this.lat],
                zoom: this.min,
                duration: 0
            });
        }
        zoom(){
            let canvasarr = this.canvasarr
            let min = this.min
            let max = this.max
            let skip = false
            map.flyTo({
                center: [this.lon, this.lat],
                zoom: this.min,
                duration: 0
            });
            let looper = setInterval(()=>{
                if(skip==false){
                    if(min>max){
                        clearInterval(looper)
                    }
                    map.setZoom(min)
                    skip=true
                    setTimeout(()=>{html2canvas(document.getElementById('map'),{allowTaint:true,useCORS:true}).then(
                        async function(canvas){
                            document.querySelector("#img").append(canvas)
                            const blob = canvas.toBlob(async(blob)=>{
                                const arrayBuffer = await blob.arrayBuffer();
                                canvasarr.push(arrayBuffer)
                            });
                            min+=1
                            skip=false
                        }
                    )},200)
                }
            },200)
            map.flyTo({
                center: [this.lon, this.lat],
                zoom: this.min,
                duration: 0
            });
            const merge = async()=>{
                await ffmpeg.load().then(console.log("yahh loaded"))
                let num=0;
                for(const arrayBuffer of canvasarr){
                    await ffmpeg.FS('writeFile', `temp.${num}.png`, new Uint8Array(arrayBuffer));
                    num++
                    console.log(`Wrote ${num-1} file`)
                }
                setTimeout(async()=>{
                    await ffmpeg.run('-i','temp.1.png', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', 'out.mp4').then(
                        function(video){
                            console.log({video})
                        }
                    )
                    const data = await ffmpeg.FS('readFile', 'out.mp4');
                    num=0;
                    for(const i of canvasarr){
                        await ffmpeg.FS('unlink', `${num}.png`);
                        num++
                    }
                    const video = document.getElementById('output-video');
                    video.src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
                },3000)
            }
            merge(canvasarr)
        }
    }
    const first = new zoomer(map,minz,maxz,lat,lon)
    const zoomObjInit=()=>{
        first.zoom()
    }
    const updateFirst=()=>{
        first.min=minz;
        first.max=maxz;
        first.lat=lat;
        first.lon=lon;
        first.setView();
    }
</script>
<div class="layout flex">
    <div class="side-bar h-[100vh] w-48 bg-black border-r-2 border-amber-400">
        <div class="storage flex">
            <span class="text-amber-200 ml-4">storage</span>
            <span class="text-amber-200 my-auto ml-auto mr-4 text-4xl cursor-pointer -mt-4">...</span>
        </div>
    </div>
    <nav class="bg-black h-[4vh] flex border-b-2 border-zinc-300">
        {#each availableFeatures as feature}
        <div class="box text-amber-200 px-8 border-r-2 border-amber-400 cursor-pointer" class:active={active==feature} on:click={()=>{active=feature}}>
            {feature}
        </div>
        {/each}
    </nav>
    <div class="black-bar absolute top-0 left-0 h-[4vh] -z-10 bg-black w-[100vw]"></div>
    <div class="inp-out ml-64 mt-14 absolute">
        <div class="params bg-black w-[600px] h-32 mb-4">
            <h3 class="text-amber-200 font-mono px-6 py-2">params</h3>
            <div class="inp-flex flex gap-4">
                <div class="grid gap-2 ml-4">
                    <label for="lat" class="text-amber-200 font-mono">lat :&nbsp;<input type="number" class="text-black" step="0.01" id="lat" bind:value={lat} on:input={updateFirst}></label>
                    <label for="lon" class="text-amber-200 font-mono">lon :&nbsp;<input type="number" class="text-black" step="0.01" id="lon" bind:value={lon} on:input={updateFirst}></label>
                </div>
                <div class="grid gap-2 ml-4">
                    <label for="min-zoom" class="text-amber-200 font-mono">min-zoom :&nbsp;<input type="number" class="text-black" id="min-zoom" bind:value={minz} on:input={updateFirst}></label>
                    <label for="max-zoom" class="text-amber-200 font-mono">max-zoom :&nbsp;<input type="number" class="text-black" id="max-zoom" bind:value={maxz} on:input={updateFirst}></label>
                </div>
            </div>
        </div>
        <div id="map" class=" border-2 border-black" style='width: 600px; height: 400px;'></div>
        <button on:click={()=>{zoomObjInit()}} class="generate px-4 py-2 bg-lime-500 text-2xl font-serif mt-6">
            generate
        </button>
        <!-- <video src="" id="output-video" class="border-2 border-black"></video> -->
    </div>
</div>
<div id="img"></div>
<style>
    .active{
        background: rgb(59, 59, 59);
        border-top: 3px solid wheat;
    }
    .storage span{
        font-family: "ROboto";
    }

</style>