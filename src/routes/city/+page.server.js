import {error, redirect} from '@sveltejs/kit';
const MMI_CLIENT_ID = import.meta.env.VITE_MMI_CLIENT_ID;
const MMI_CLIENT_SEC = import.meta.env.VITE_MMI_CLIENT_SEC;
/** @type {import('./$types').PageServerLoad} */
export async function load({locals,cookies}) {
    const sessionid = cookies.get("sessionid");
    const {redis} =locals;
    console.log("session id is : ",sessionid)
    const redsid = await redis.get("bug")
    if(!(redsid==sessionid)){
        throw redirect(302,"/")
    }else{
        const data={
            "grant_type": "client_credentials",
            "client_id": MMI_CLIENT_ID,
            "client_secret": MMI_CLIENT_SEC
        };
        const request = await fetch('https://outpost.mapmyindia.com/api/security/oauth/token', {
            method: 'POST',
            body: new URLSearchParams(data),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        const response = await request.json()
        if(response){
            console.log(response)
            console.log("Sometimes works too.")
            console.log(response.access_token)
            const maxAge= response.expires_in
            cookies.set("mmitk",response.access_token,{path:"/",maxAge})
            return {
            status: 302
            }
        }
        if(response.error){
            console.log("shit happens")
            throw error(302,'it is what it it is')
        }
    }
}