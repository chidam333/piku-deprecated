import postgres from 'postgres'
import 'dotenv/config'
import Redis from "ioredis";
/** @type {import('@sveltejs/kit').Handle} */
const urlo=process.env.POSTGRES_URL
/** @type {import('@sveltejs/kit').Handle} */
const redisurl=process.env.REDIS_URL
export async function handle({ event, resolve }) {
    const sql = postgres(urlo);
    const redis = new Redis(redisurl);
    event.locals = {
        sql:sql,
        redis:redis,
    }
    const response = await resolve(event);
    return response;
}