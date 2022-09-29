/** @type {import('./$types').Actions} */
import {error, redirect} from '@sveltejs/kit';
import { invalid } from '@sveltejs/kit';
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
export const actions = {
    login: async({locals,request,cookies})=>{
      const data = await request.formData();
      const username = data.get('loguser');
      const password = data.get('logpass');
      const{sql} = locals;
      const{redis} = locals;
      const psdata = await sql `select * from pikuusers where username=${username}`
      const compare = await bcrypt.compare(password,psdata[0].password);
      if(compare){
        const sessionid=uuidv4();
        cookies.set("sessionid",sessionid)
        redis.set(`${username}`, `${sessionid}`);
        redis.expire(`${username}`,15*60)
        console.log("done!!")
        throw redirect(307,'/city')
      }  
    },
    signup: async ({locals,request}) => {
      const data= await request.formData();
      const email = data.get('email');
      const trimemail = email.trim()
      const name = email.split("@")[0]
      const pass = data.get('pass');
      const pass1 = data.get('pass1');
      if(pass!=pass1){console.log("False");return invalid(400, {missing: true });}
      else{
        console.log(name,email,pass,pass1);
        const salt =await bcrypt.genSalt(9)
        const hashpass = await bcrypt.hash(pass,salt)
        const{sql}=locals;
        const response = await sql `insert into pikuusers(username,email,password) values(${name},${trimemail},${hashpass});`;
        return { success: true };
      }
    }
  };