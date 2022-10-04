/** @type {import('./$types').PageLoad} */
export function load({ url }) {
    return {token:url.searchParams.get('verify')}
  }