// Vercel serverless function: optional AI suggestions using Groq.
// Required server env: GROQ_API_KEY. Optional STUDIO_AI_ACCESS_CODE.
const crypto = require('crypto');
function safeEqual(a,b){const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&crypto.timingSafeEqual(x,y);}
const allowKeys = new Set(['text','color','bg','opacity','fontSize','fontWeight','fontFamily','shadow','blur','radius','border','borderColor','align','x','y','w','h']);
function sanitizeChanges(input){const out={};for(const [key,val] of Object.entries(input||{})){if(!allowKeys.has(key))continue;if(['color','bg','borderColor'].includes(key)){if(typeof val==='string'&&/^#[\da-fA-F]{6}$/.test(val))out[key]=val;}else if(key==='fontFamily'){if(['system','rounded','serif','mono'].includes(val))out[key]=val;}else if(key==='align'){if(['left','center','right'].includes(val))out[key]=val;}else if(key==='text'){if(typeof val==='string')out[key]=val.slice(0,160);}else if(typeof val==='number'&&Number.isFinite(val)){const limits={opacity:[0,100],fontSize:[6,110],fontWeight:[400,900],shadow:[0,80],blur:[0,30],radius:[0,160],border:[0,12],x:[0,374],y:[0,697],w:[20,374],h:[16,697]};const lim=limits[key];if(lim)out[key]=Math.max(lim[0],Math.min(lim[1],val));}}return out;}
module.exports = async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='POST')return res.status(405).json({error:'Use POST.'});
 const access=process.env.STUDIO_AI_ACCESS_CODE;
 if(access&&!safeEqual(req.headers['x-studio-code']||'',access))return res.status(401).json({error:'Código de acesso incorreto.'});
 if(!process.env.GROQ_API_KEY)return res.status(503).json({error:'A IA ainda não está configurada no servidor. GROQ_API_KEY ausente.'});
 if(!access)return res.status(503).json({error:'Configure STUDIO_AI_ACCESS_CODE no servidor para proteger a IA antes de ativá-la.'});
 let body=req.body;if(typeof body==='string'){try{body=JSON.parse(body);}catch{return res.status(400).json({error:'JSON inválido.'});}}
 const prompt=String(body?.prompt||'').slice(0,550),element=body?.element||null,theme=body?.theme||{};
 if(prompt.length<5||!element||typeof element!=='object'||!['text','card','button','switch','image','icon','input'].includes(element.type))return res.status(400).json({error:'Pedido inválido.'});
 const safeElement={type:element.type,text:String(element.text||'').slice(0,150),x:element.x,y:element.y,w:element.w,h:element.h,color:element.color,bg:element.bg,opacity:element.opacity,radius:element.radius,fontSize:element.fontSize,fontWeight:element.fontWeight,fontFamily:element.fontFamily,shadow:element.shadow,blur:element.blur,align:element.align,border:element.border,borderColor:element.borderColor};
 const controller=new AbortController(),abort=setTimeout(()=>controller.abort(),16000);
 try{
  const response=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+process.env.GROQ_API_KEY,'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({model:process.env.GROQ_MODEL||'openai/gpt-oss-120b',temperature:0.2,max_completion_tokens:420,messages:[{role:'system',content:'Você edita apenas propriedades visuais de componentes de UI. Nunca altere lógica, chaves, APIs, URLs ou funções. Retorne somente um objeto JSON válido no formato {"changes":{...}}. Chaves permitidas: text (até 160 caracteres), color, bg, opacity (0-100), fontSize (6-110), fontWeight (400,500,600,700,800,900), fontFamily (system/rounded/serif/mono), shadow (0-80), blur (0-30), radius (0-160), border (0-12), borderColor, align (left/center/right), x (0-374), y (0-697), w (20-374), h (16-697). Cores em hex #RRGGBB. Mude apenas as propriedades necessárias. Não inclua markdown.'},{role:'user',content:JSON.stringify({pedido:prompt,elemento:safeElement,tema:theme})}]})});
  const data=await response.json();if(!response.ok)return res.status(502).json({error:'Groq: '+String(data?.error?.message||response.status).slice(0,180)});
  let raw=data?.choices?.[0]?.message?.content||'';raw=String(raw).replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'').trim();let out;try{out=JSON.parse(raw);}catch{const a=raw.indexOf('{'),b=raw.lastIndexOf('}');if(a<0||b<=a)throw Error('Resposta inesperada do modelo');out=JSON.parse(raw.slice(a,b+1));}
  const changes=sanitizeChanges(out.changes);if(!Object.keys(changes).length)return res.status(422).json({error:'Nenhuma propriedade visual válida foi sugerida.'});return res.status(200).json({changes});
 }catch(err){return res.status(502).json({error:err.name==='AbortError'?'A consulta excedeu o tempo limite.':'Falha ao consultar a IA.'});}finally{clearTimeout(abort);}
};
