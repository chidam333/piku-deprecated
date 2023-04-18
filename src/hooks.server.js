import postgres from 'postgres'
import 'dotenv/config'
import Redis from "ioredis";
/** @type {import('@sveltejs/kit').Handle} */
const urlo=process.env.POSTGRES_URL
console.log({urlo})
/** @type {import('@sveltejs/kit').Handle} */
const redisurl=process.env.REDIS_URL
export async function handle({ event, resolve }) {
    if(!event.url.pathname.startsWith('/create')){
        const sql = postgres(urlo);
        const redis = new Redis(redisurl);
        const session = event.cookies.get("sessionid");
        console.log({session})
        const username = await redis.get(session)
        event.locals = {
            username:username,
            sql:sql,
            redis:redis,
        }
    }
    let response = await resolve(event);
    if (event.url.pathname.startsWith('/create')) {
        response.headers.append('Cross-Origin-Embedder-Policy', `require-corp`);
        response.headers.append('Cross-Origin-Opener-Policy', `same-origin`);
    }
    return response;
}