<script>
	import { browser } from '$app/environment';
    import maplibregl from 'maplibre-gl'; // or "const maplibregl = require('maplibre-gl');"
    import { onMount } from 'svelte';
    import {createFFmpeg,fetchFile} from "@ffmpeg/ffmpeg";
    import html2canvas from 'html2canvas';
    import 'maplibre-gl/dist/maplibre-gl.css';
    let availableFeatures = ["zooming","panning","tilt","create-itinerary"]
    $: active="panning"
    let map=null,ffmpeg;
    let lon=80.28,lat=13.077,minz=3,maxz=6,lonFrom=80.28,latFrom=13.077,lonTo=-73.9808,latTo=40.7648;
    onMount(async()=>{
        map = new maplibregl.Map({
            container: 'map',
            style: 'https://demotiles.maplibre.org/style.json', // stylesheet location
            center: [80.28,13.077], // starting position [lng, lat]
            zoom: 3,
            preserveDrawingBuffer: true // starting zoom
        }); 
        ffmpeg = createFFmpeg({ log: true });
        await ffmpeg.load()

    })
    class panner{
        constructor(map,latFrom,lonFrom,latTo,lonTo){
            this.map=map
            this.latFrom=latFrom
            this.lonFrom=lonFrom
            this.latTo=latTo
            this.lonTo=lonTo
            this.canvasarr=[]
            this.skip=false
            this.zoom=3
            this.time=2000
            this.factor=30
        }
        setView(){
            map.flyTo({
                center:[this.lonFrom,this.latFrom],
                zoom:this.zoom,
                duration:0
            })
        }
        pan(){
            let xDist,yDist;
            let isLeft,isDown;
            let xStep,yStep;
            let skip= this.skip,lonFrom=this.lonFrom,lonTo=this.lonTo,latFrom=this.latFrom,latTo=this.latTo,map=this.map,zoom=this.zoom,canvasarr=this.canvasarr;
            if(lonFrom>lonTo){
                isLeft=true
                xDist=this.lonFrom-this.lonTo
            }else{
                isLeft=false
                xDist=this.lonTo-this.lonFrom
            }
            if(latFrom>latTo){
                isDown=true
                yDist=this.latFrom-latTo
            }else{
                isDown=false
                yDist=this.latTo-this.latFrom
            }
            xStep = xDist/(this.time/this.factor)
            yStep = yDist/(this.time/this.factor)
            this.setView()
            let looper = setInterval(()=>{
                if(skip==false){
                    if(isLeft && lonFrom<=lonTo){
                        clearInterval(looper)
                        merge(canvasarr)
                    }
                    if(!isLeft && lonFrom>=lonTo){
                        clearInterval(looper)
                        merge(canvasarr)
                    }
                    map.flyTo({
                        center:[lonFrom,latFrom],
                        zoom:zoom,
                        duration:0
                    })
                    skip=true
                    setTimeout(()=>{
                        html2canvas(document.getElementById('map'),{allowTaint:true,useCORS:true}).then(
                            async function(canvas){
                                document.body.append(canvas)
                                canvas.toBlob(async(blob)=>{
                                    const arrayBuffer=await blob.arrayBuffer();
                                    canvasarr.push(arrayBuffer)
                                })
                                if(isLeft){lonFrom-=xStep;}
                                else{lonFrom+=xStep;}
                                if(isDown){latFrom+=yStep;}
                                else{
                                    latFrom+=yStep;
                                }
                                skip=false
                            }
                        )
                    })
                }
            },200)
            const merge = async(canvasarr)=>{
                console.log({canvasarr})
                for(let i=0;i<canvasarr.length;i++){
                    await ffmpeg.FS('writeFile', `temp.${i}.png`, new Uint8Array(canvasarr[i]));
                    console.log(`Wrote ${i} file`)
                }
                await ffmpeg.run('-i','temp.%d.png','-c:v', 'libx264','-r','30', '-pix_fmt', 'yuv420p', 'out.mp4')
                const data = await ffmpeg.FS('readFile', 'out.mp4');
                console.log({data})
                console.log({canvasarrLen:canvasarr.length})
                // for(let i=0;i<canvasarr.length-1;i++){
                //     await ffmpeg.FS('unlink', `temp.${i}.png`);
                // }
                const video = document.getElementById('output-video');
                video.style.display= "block"
                video.src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
                this.canvasarr=[]
            }
        }
    }
    class zoomer{
        constructor(map,min,max,lat,lon){
            this.min=min
            this.max=max
            this.lat=lat
            this.lon=lon
            this.skip=false
            this.map=map
            this.canvasarr = []
            this.zoomRate=0.1
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
            let zoomRate = this.zoomRate
            this.setView()
            let looper = setInterval(()=>{
                if(skip==false){
                    if(min>=max){
                        clearInterval(looper)
                        merge(canvasarr)
                    }
                    map.setZoom(min)
                    skip=true
                    setTimeout(()=>{html2canvas(document.getElementById('map'),{allowTaint:true,useCORS:true}).then(
                        async function(canvas){
                            canvas.toBlob(async(blob)=>{
                                const arrayBuffer = await blob.arrayBuffer();
                                canvasarr.push(arrayBuffer)
                            });
                            min+=zoomRate
                            skip=false
                        }
                    )},200)
                }
            },200)
            const merge = async(canvasarr)=>{
                console.log({canvasarr})
                for(let i=0;i<canvasarr.length;i++){
                    await ffmpeg.FS('writeFile', `temp.${i}.png`, new Uint8Array(canvasarr[i]));
                    console.log(`Wrote ${i} file`)
                }
                await ffmpeg.run('-i','temp.%d.png','-c:v', 'libx264','-r','30', '-pix_fmt', 'yuv420p', 'out.mp4')
                const data = await ffmpeg.FS('readFile', 'out.mp4');
                console.log({data})
                console.log({canvasarrLen:canvasarr.length})
                // for(let i=0;i<canvasarr.length-1;i++){
                //     await ffmpeg.FS('unlink', `temp.${i}.png`);
                // }
                const video = document.getElementById('output-video');
                video.style.display= "block"
                video.src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
                this.canvasarr=[]
            }
        }
    }
    const first = new zoomer(map,minz,maxz,lat,lon)
    const zoomObjInit=()=>{
        first.zoom()
    }
    const PanObjInit=()=>{
        const panobj = new panner(map,latFrom,lonFrom,latTo,lonTo)
        panobj.pan()
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
    <div class="side-bar h-[100vh] w-[12vw] bg-black border-r-2 border-amber-400">
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
    <div class="inp-out ml-56 mt-14 absolute">
        <div class="params bg-black max-w-[800px] h-32 mb-4">
            <h3 class="text-amber-200 font-mono px-6 py-2">params</h3>
            <div class="inp-flex flex gap-4">
                {#if active=="zooming"}
                    <div class="grid gap-2 ml-4">
                        <label for="lat" class="text-amber-200 font-mono">lat :&nbsp;<input type="number" class="text-black" step="0.01" id="lat" bind:value={lat} on:input={updateFirst}></label>
                        <label for="lon" class="text-amber-200 font-mono">lon :&nbsp;<input type="number" class="text-black" step="0.01" id="lon" bind:value={lon} on:input={updateFirst}></label>
                    </div>
                    <div class="grid gap-2 ml-4">
                        <label for="min-zoom" class="text-amber-200 font-mono">min-zoom :&nbsp;<input type="number" class="text-black" id="min-zoom" bind:value={minz} on:input={updateFirst}></label>
                        <label for="max-zoom" class="text-amber-200 font-mono">max-zoom :&nbsp;<input type="number" class="text-black" id="max-zoom" bind:value={maxz} on:input={updateFirst}></label>
                    </div>
                {/if}
                {#if active=="panning"}
                    <div class="grid gap-2 ml-4">
                        <label for="latPanfrom" class="text-amber-200 font-mono">lat-from :&nbsp;<input type="number" class="text-black" step="0.01" id="latPanfrom" bind:value={latFrom} on:input={updateFirst}></label>
                        <label for="lonPAnfrom" class="text-amber-200 font-mono">lon-from :&nbsp;<input type="number" class="text-black" step="0.01" id="lonPanfrom" bind:value={lonFrom} on:input={updateFirst}></label>
                    </div>
                    <div class="grid gap-2 ml-4">
                        <label for="latPanto" class="text-amber-200 font-mono">lat-to :&nbsp;<input type="number" class="text-black" step="0.01" id="latPanto" bind:value={latTo} on:input={updateFirst}></label>
                        <label for="lonPAnto" class="text-amber-200 font-mono">lon-to :&nbsp;<input type="number" class="text-black" step="0.01" id="lonPanto" bind:value={lonTo} on:input={updateFirst}></label>
                    </div>
                {/if}
            </div>
        </div>
        <div class="map-contain grid grid-flow-col gap-6 w-[80vw] grid-cols-2">
            <div id="map" class=" border-2 border-black aspect-video "></div>
            <video src="" id="output-video" class="border-2 border-black aspect-video" style="display:none" controls></video>
        </div>
        <button on:click={()=>{
            if(active=="zooming"){zoomObjInit()}
            if(active=="panning"){PanObjInit()}
        }} class="generate px-4 py-2 bg-lime-500 text-2xl font-serif mt-6">
            generate
        </button>
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