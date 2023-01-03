<script>
  import { onMount } from "svelte";
	export let data;
    let name,realdata;
    onMount(async()=>{
        console.log(data.fetchurl)
        const response = await fetch(data.fetchurl)
        realdata = await response.json()
        name= await realdata.name
    })
</script>
<main>
    <div>
        <div> Your profile is successfully verified .</div>
        <div>Your username is {name}</div>
        <div class="grid justify-center"><a href="/" class="bg-amber-700 text-amber-200 px-4 py-2 my-2 hover:bg-amber-200 hover:text-amber-700 hover:border-2 border-black">Login</a></div>
    </div>
</main>
<style>
    main{
        width: 100vw;
        height: 100vh;
        display: grid;
        place-items: center;
    }
</style>