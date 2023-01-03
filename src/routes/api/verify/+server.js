import {redirect,json} from '@sveltejs/kit';
/** @type {import('./$types').RequestHandler} */
export async function GET({url,locals}){
    const {sql} = locals;
    const {redis} = locals;
    let token=url.searchParams.get('verify')
    console.log(token)
    let data=await redis.lrange(token,0,-1)
    await sql `insert into pikuusers(username,email,password) values(${data[2]},${data[1]},${data[0]})`
    redis.del(token)
    return json({name:data[2]})
}
