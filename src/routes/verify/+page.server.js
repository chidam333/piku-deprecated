/** @type {import('./$types').PageLoad} */
const r = "https://piku.chidam.xyz/";
export function load({ url }) {
    return {fetchurl:`${r}api/verify?verify=${url.searchParams.get('verify')}`}
  }