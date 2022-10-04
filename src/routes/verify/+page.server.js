/** @type {import('./$types').PageLoad} */
const r = process.env.R;
export function load({ url }) {
    return {fetchurl:`${r}api/verify?verify=${url.searchParams.get('verify')}`}
  }