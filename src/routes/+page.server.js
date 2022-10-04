/** @type {import('./$types').Actions} */
import {invalid, redirect} from '@sveltejs/kit';
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from 'uuid';
// /** @type {import('@sveltejs/kit').Handle} */
const p = process.env.E_PASS
const r = "https://piku.chidam.xyz/";
export const actions = {
    login: async({locals,request,cookies})=>{
      const data = await request.formData();
      const username = data.get('loguser');
      const password = data.get('logpass');
      const{sql} = locals;
      const{redis} = locals;
      const psdata = await sql `select * from pikuusers where username=${username}`
      const compare = await bcrypt.compare(password,psdata[0].password);
      if(!compare){return invalid(400, {cred:true})}
      if(compare){
        const sessionid=uuidv4();
        cookies.set("sessionid",sessionid)
        redis.set(`${sessionid}`,`${username}`);
        redis.expire(`${sessionid}`,15*60)
        console.log("done!!")
        throw redirect(307,'/city')
      }  
    },
    signup: async ({locals,request}) => {
      const data= await request.formData();
      const email = data.get('email');
      const trimemail = email.trim()
      const name = email.split("@")[0]
      const {sql} = locals
      let hakya = await sql `select exists(select username from pikuusers where username=${name})`
      console.log("hakya is",hakya[0].exists)
      if(hakya[0].exists){return {name,exist:true}}
      else{
      const pass = data.get('pass');
      const pass1 = data.get('pass1');
      if(pass!=pass1){console.log("False");return invalid(400, {missing: true });}
      else{
        console.log(name,email,pass,pass1);
        let details = {myemail:"verify@chidam.xyz",mypass:p}
        console.log("pass is ",details.mypass)
        const salt =await bcrypt.genSalt(9)
        const hashpass = await bcrypt.hash(pass,salt)
        const{redis}=locals;
        let formda = [name,email,hashpass]
        const sessionid2 = uuidv4()
        redis.lpush(sessionid2,formda)
        redis.expire(sessionid2,15*60)
        const transpoter = nodemailer.createTransport({
          host: 'smtppro.zoho.in',
          secure: true,
          port: 465,
          auth:{
            user:details.myemail,
            pass:details.mypass
          }
        })
        let info = await transpoter.sendMail({
          from:'"Chidam"<verify@chidam.xyz>',
          to: email,
          subject : `Hello ${name} verify your piku account`,
          html:`
          <h1>Hello ! your username is  ${name} <h1/>
          <b>Please click the following link to verify your account<b/>
          <div><a href="${r}verify?verify=${sessionid2}" target="_blank">${r}/verify?verify=${sessionid2}</a></div>
          `
        })
        console.log("Message sent: %s", info.messageId);
        return { email,success: true };
      }
    }}
  };