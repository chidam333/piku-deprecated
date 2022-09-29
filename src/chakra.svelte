<script>
    export let height
</script>
<main>
        <div class="whole">
        <div class="chakra" style="height:{height}vh;width:{height}vh">
            <div class="dot"></div>
            {#each Array(12) as intr,i}
                <li style="transform:rotate({i*15}deg);height:{height}vh"></li>
            {/each}
        </div>
        </div>
</main>
<style>
    .whole{
        animation: spin 10s linear infinite;
    }
    @keyframes spin{
        0%{transform: rotate(0deg);}
        100%{transform: rotate(360deg);}
    }
    li{
        position: absolute;
        width: .1vh;
        border-radius: 50%;
        border: navy 2px solid;
        list-style-type: none;
    }

    .chakra{
        border: navy 7px solid;
        border-radius: 50%;
        margin: 0 auto;
        display: grid;
        place-items: center;
        box-shadow: 0px 0px 25px white ;
    }
    .dot{
        background: navy;
        width: 5vh;
        height: 5vh;
        border-radius: 50%;
        position:relative;
    }
    main{
        font-family: 'Roboto', sans-serif;
    }
</style>