const http=require('http'),fs=require('fs'),path=require('path'),https=require('https'),crypto=require('crypto');
const ROOT=__dirname, DATA=path.join(ROOT,'data'), CONFIG=path.join(DATA,'site.json'); fs.mkdirSync(DATA,{recursive:true});
const defaults={contractAddress:'TBA',buyUrl:'',recipient:'To be announced',defensePercent:80,operationsPercent:20,goal:100000,contributions:[]};
if(!fs.existsSync(CONFIG))fs.writeFileSync(CONFIG,JSON.stringify(defaults,null,2));
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon'};
const json=(res,code,obj)=>{res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(obj))};
const body=req=>new Promise((ok,bad)=>{let d='';req.on('data',c=>{d+=c;if(d.length>2e6)req.destroy()});req.on('end',()=>{try{ok(JSON.parse(d||'{}'))}catch(e){bad(e)}})});
const safeEq=(a,b)=>{a=Buffer.from(a||'');b=Buffer.from(b||'');return a.length===b.length&&crypto.timingSafeEqual(a,b)};
function neo(res){let now=new Date(),end=new Date(Date.now()+60*864e5),d=x=>x.toISOString().slice(0,10);let u=`https://ssd-api.jpl.nasa.gov/cad.api?date-min=${d(now)}&date-max=${d(end)}&dist-max=.05&body=Earth&sort=date&diameter=true&fullname=true&limit=4`;https.get(u,r=>{let s='';r.on('data',c=>s+=c);r.on('end',()=>{res.writeHead(r.statusCode||200,{'Content-Type':'application/json','Cache-Control':'public,max-age=900'});res.end(s)})}).on('error',()=>json(res,502,{error:'JPL feed unavailable'}))}
http.createServer(async(req,res)=>{let url=new URL(req.url,'http://x');
 if(url.pathname==='/api/config'&&req.method==='GET')return json(res,200,JSON.parse(fs.readFileSync(CONFIG)));
 if(url.pathname==='/api/config'&&req.method==='POST'){let key=req.headers['x-admin-key'],admin=process.env.ADMIN_KEY;if(!admin)return json(res,503,{error:'ADMIN_KEY is not configured on server'});if(!safeEq(key,admin))return json(res,401,{error:'Invalid admin key'});try{let v=await body(req);v={...defaults,...v};v.defensePercent=Number(v.defensePercent)||80;v.operationsPercent=100-v.defensePercent;v.goal=Math.max(1,Number(v.goal)||100000);v.contributions=Array.isArray(v.contributions)?v.contributions:[];fs.writeFileSync(CONFIG,JSON.stringify(v,null,2));return json(res,200,{ok:true})}catch(e){return json(res,400,{error:'Invalid data'})}}
 if(url.pathname==='/api/neo')return neo(res);
 let p=url.pathname==='/'?'/index.html':url.pathname;try{p=decodeURIComponent(p);let f=path.normalize(path.join(ROOT,p));if(!f.startsWith(ROOT)||!fs.statSync(f).isFile())throw 0;res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res)}catch(e){res.writeHead(404);res.end('Not found')}
}).listen(process.env.PORT||8080,()=>console.log(`$NEO online on http://localhost:${process.env.PORT||8080}`));
