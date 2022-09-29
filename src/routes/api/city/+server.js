import { error, json } from '@sveltejs/kit';
 
/** @type {import('./$types').RequestHandler} */

export async function GET({url,cookies}){
    const value = cookies.get('mmitk')
    const address=url.searchParams.get('address')
    const response = await fetch(`https://atlas.mapmyindia.com/api/places/geocode?address=${address}&bias=1&podFilter=city&itemCount=2`,
    {headers: {'Authorization': `Bearer ${value}`}})
    const data = await response.json()
    // return new Response(JSON.stringify(data))
    return json(data)
    if(!response.ok){
        console.log("Redirecting to index hmm ):")
        throw error(400,'Can fetch data ! sorrry')
    }

}