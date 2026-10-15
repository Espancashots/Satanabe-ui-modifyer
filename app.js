(() => {
'use strict';
const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>[...root.querySelectorAll(s)];
const CW=374,CH=697;
const ID=()=> 'n'+Math.random().toString(36).slice(2,10);
const deep=x=>JSON.parse(JSON.stringify(x));
const bound=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));
const esc=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const presets={wine:{bg:'#0d0b10',accent:'#cf3854',text:'#f8eaf0',surface:'#22141d',secondary:'#a4919e'},ocean:{bg:'#071529',accent:'#0ab6ed',text:'#f0f9ff',surface:'#132c4b',secondary:'#a1bcd7'},light:{bg:'#f5f2f3',accent:'#c72c4e',text:'#221823',surface:'#ffffff',secondary:'#7d6878'}};
const mk=(type,name,x,y,w,h,extras={})=>({id:ID(),type,name,x,y,w,h,text:'',color:'#f6eaf0',bg:'#25151e',fontSize:15,fontWeight:600,fontFamily:'system',radius:13,shadow:0,blur:0,opacity:100,border:0,borderColor:'#8e3b4e',align:'left',visible:true,locked:false,on:false,...extras});
const initModel=()=>{
  const t=deep(presets.wine);
  const heading=(name,text,y)=>mk('text',name,22,y,330,32,{text,fontSize:23,fontWeight:800});
  const sub=(text,y)=>mk('text','Descrição',22,y,330,27,{text,fontSize:12,color:'#a897a5',fontWeight:400});
  const card=(name,text,y,on=false)=>[
    mk('card','Cartão • '+name,17,y,340,72,{bg:'#231820',radius:15,border:1,borderColor:'#563241'}),
    mk('text','Nome • '+name,34,y+13,238,23,{text,fontSize:14,fontWeight:700}),
    mk('text','Descrição • '+name,34,y+38,230,19,{text:'Toque para configurar',fontSize:10,fontWeight:400,color:'#a08c99'}),
    mk('switch','Switch • '+name,290,y+22,44,27,{on,bg:'#cf3854'})
  ];
  return {version:1,title:'Satanabe External',theme:t,pages:[
    {id:'ranked',name:'Rankeada',icon:'✦',elements:[
      mk('text','Marca',22,19,330,21,{text:'S A T A N A B E',fontSize:11,color:'#ed7188',fontWeight:800}),
      mk('text','Cabeçalho',21,56,332,48,{text:'RANKEADA',fontSize:31,fontWeight:900}),
      sub('Personalize sua experiência',108),
      mk('card','Resumo',17,156,340,84,{bg:'#351825',radius:17,border:1,borderColor:'#743047'}),
      mk('icon','Ícone do resumo',32,180,30,35,{text:'✧',fontSize:28,color:'#f26e8b'}),
      mk('text','Título resumo',73,174,261,29,{text:'Painel de ajustes',fontSize:16,fontWeight:800}),
      mk('text','Subtítulo resumo',73,202,257,20,{text:'Configurações da partida',fontSize:11,color:'#c49aa9',fontWeight:400}),
      ...card('Opção 01','Opção principal',261,true),...card('Opção 02','Ajuste secundário',344),...card('Opção 03','Outra configuração',427),
      mk('button','Aplicar configurações',17,547,340,48,{text:'APLICAR CONFIGURAÇÕES',bg:'#be2c49',color:'#ffffff',radius:13,align:'center',fontSize:13,fontWeight:800})] },
    {id:'texture',name:'Textura',icon:'▧',elements:[heading('Cabeçalho','TEXTURAS',50),sub('Escolha suas preferências visuais',103),...card('Textura 01','Textura padrão',174,true),...card('Textura 02','Textura alternativa',258),mk('button','Aplicar textura',17,365,340,48,{text:'APLICAR TEXTURA',align:'center',bg:'#be2c49',color:'#fff',fontWeight:800})]},
    {id:'bet',name:'Apostado',icon:'◈',elements:[heading('Cabeçalho','APOSTADO',50),sub('Controles da categoria',103),...card('Opção 01','Configuração A',174),...card('Opção 02','Configuração B',258,true),mk('button','Aplicar',17,365,340,48,{text:'APLICAR ALTERAÇÕES',bg:'#be2c49',color:'#fff',align:'center',fontWeight:800})]},
    {id:'license',name:'Key',icon:'◇',elements:[heading('Cabeçalho','ATIVAÇÃO',50),sub('Acesso ao Satanabe External',103),mk('card','Cartão da licença',17,165,340,178,{bg:'#251720',radius:17,border:1,borderColor:'#573040'}),mk('text','Texto da key',34,190,310,26,{text:'Insira sua licença',fontSize:16,fontWeight:800}),mk('input','Campo da key',34,232,306,44,{text:'SUA KEY AQUI',color:'#c9a8b7',bg:'#140d13',fontSize:12,radius:10,border:1,borderColor:'#724459'}),mk('button','Validar key',34,290,306,42,{text:'VALIDAR KEY',bg:'#be2c49',color:'#fff',align:'center',fontSize:13,fontWeight:800})]}
  ],assets:[]};
};
let model=initModel(),screenId=model.pages[0].id,selectedId=null,history=[],future=[],editing=false,zoom=1,showPreview=false,importedDesignSystem='',pendingAi=null,saveTimer=null,toastTimer=null;
const page=()=>model.pages.find(p=>p.id===screenId)||model.pages[0];
const selected=()=>page().elements.find(e=>e.id===selectedId)||null;
function notify(msg){const box=$('#toast');box.textContent=msg;box.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>box.classList.remove('show'),3300);}
function markSave(){const s=$('#saveState');s.textContent='Alterações não salvas';clearTimeout(saveTimer);saveTimer=setTimeout(()=>saveModel(false),850);}
function checkpoint(){history.push(JSON.stringify(model));if(history.length>40)history.shift();future=[];updateUndo();}
function updateUndo(){$('#undoBtn').disabled=history.length===0;$('#redoBtn').disabled=future.length===0;}
function transact(fn){checkpoint();fn();render();markSave();}
function undo(){if(!history.length)return;future.push(JSON.stringify(model));model=JSON.parse(history.pop());if(!model.pages.some(p=>p.id===screenId))screenId=model.pages[0].id;selectedId=null;render();markSave();}
function redo(){if(!future.length)return;history.push(JSON.stringify(model));model=JSON.parse(future.pop());if(!model.pages.some(p=>p.id===screenId))screenId=model.pages[0].id;selectedId=null;render();markSave();}
function dbOpen(){return new Promise((resolve,reject)=>{if(!('indexedDB' in window))return reject(new Error('Sem IndexedDB'));const req=indexedDB.open('satanabe-ui-studio',1);req.onupgradeneeded=()=>req.result.createObjectStore('projects');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function dbStore(value){const db=await dbOpen();return new Promise((resolve,reject)=>{const tr=db.transaction('projects','readwrite');tr.objectStore('projects').put(value,'current');tr.oncomplete=()=>{db.close();resolve();};tr.onerror=()=>{db.close();reject(tr.error);};});}
async function dbLoad(){const db=await dbOpen();return new Promise((resolve,reject)=>{const tr=db.transaction('projects','readonly');const r=tr.objectStore('projects').get('current');r.onsuccess=()=>{db.close();resolve(r.result||null);};r.onerror=()=>{db.close();reject(r.error);};});}
async function saveModel(loud=true){clearTimeout(saveTimer);try{await dbStore(model);$('#saveState').textContent='Salvo automaticamente';if(loud)notify('Projeto salvo neste aparelho ✓');}catch(e){try{localStorage.setItem('satanabe-studio-project',JSON.stringify(model));$('#saveState').textContent='Salvo localmente';if(loud)notify('Projeto salvo');}catch(e2){$('#saveState').textContent='Armazenamento cheio';notify('Espaço insuficiente. Exporte o projeto JSON para guardar.');}}}
async function loadModel(){try{const stored=await dbLoad()||JSON.parse(localStorage.getItem('satanabe-studio-project')||'null');if(stored&&validModel(stored)){model=stored;screenId=model.pages[0].id;}}catch(err){try{const stored=JSON.parse(localStorage.getItem('satanabe-studio-project')||'null');if(validModel(stored)){model=stored;screenId=model.pages[0].id;}}catch(_){}}render();document.documentElement.classList.remove('no-js');document.documentElement.classList.add('js-ready');}
function validModel(m){return !!(m&&m.version===1&&typeof m.title==='string'&&Array.isArray(m.pages)&&m.pages.length&&m.pages.length<40&&m.pages.every(p=>typeof p.name==='string'&&Array.isArray(p.elements)&&p.elements.length<500)&&Array.isArray(m.assets)&&m.assets.length<300&&m.theme);}
function render(){renderScreens();renderLayers();renderCanvas();renderProps();renderGallery();renderTheme();updateUndo();$('#crumbName').textContent=model.title;$('#nodeCount').textContent=page().elements.length;$('#currentScreen').textContent=page().name;}
function renderScreens(){const root=$('#screens');root.replaceChildren();for(const p of model.pages){const b=document.createElement('button');b.className='screen-pill'+(screenId===p.id?' active':'');b.textContent=p.name;b.addEventListener('click',()=>{screenId=p.id;selectedId=null;render();});root.append(b);}}
function layerGlyph(type){return ({text:'T',button:'▣',card:'▢',switch:'⏼',image:'▧',icon:'✧',input:'▤'}[type]||'▢');}
function renderLayers(){const list=$('#layersList');list.replaceChildren();for(const e of [...page().elements].reverse()){const row=document.createElement('div');row.className='layer-row'+(selectedId===e.id?' selected':'');row.innerHTML=`<span class="layer-icon">${layerGlyph(e.type)}</span><span class="layer-name">${esc(e.name)}</span>`;const b=document.createElement('button');b.className='layer-eye'+(e.visible===false?' is-hidden':'');b.textContent=e.visible===false?'◌':'◉';b.title='Mostrar ou ocultar';b.onclick=(event)=>{event.stopPropagation();transact(()=>e.visible=!e.visible);};row.onclick=()=>selectNode(e.id);row.append(b);list.append(row);}}
function cssColor(c){return /^#[a-fA-F0-9]{6}$/.test(c||'')?c:'#ffffff';}
function renderCanvas(){const root=$('#deviceElements');root.replaceChildren();const t=model.theme;$('#phoneScreen').style.setProperty('--phone-bg',cssColor(t.bg));$('#phoneScreen').style.setProperty('--phone-glow',hexAlpha(t.accent,0.23));$('#phoneNav').style.setProperty('--phone-accent',cssColor(t.accent));$('#phoneNav').style.background=hexAlpha(t.surface,.96);$$('.phone-status span').forEach(n=>n.style.color=t.text);$('.home-indicator').style.background=t.text;
  for(const e of page().elements){if(e.visible===false)continue;const el=document.createElement('div');el.className='device-element'+(selectedId===e.id&&!showPreview?' selected':'')+(showPreview?' previewing':'');el.dataset.id=e.id;place(el,e);
    if(e.type==='card'){el.style.background=cssColor(e.bg);}
    else if(e.type==='text'||e.type==='icon'){const s=document.createElement('span');s.className=e.type==='icon'?'node-icon':'node-label';s.textContent=e.text;s.style.width='100%';el.append(s);}
    else if(e.type==='button'){el.style.background=cssColor(e.bg);const s=document.createElement('span');s.className='node-label';s.textContent=e.text;s.style.width='100%';el.append(s);}
    else if(e.type==='input'){el.style.background=cssColor(e.bg);const s=document.createElement('span');s.className='node-label';s.textContent=e.text||'Digite aqui';s.style.width='100%';el.append(s);}
    else if(e.type==='switch'){const sw=document.createElement('div');sw.className='node-switch'+(e.on?' on':'');sw.style.background=e.on?cssColor(e.bg):'#66606a';sw.innerHTML='<span></span>';el.append(sw);}
    else if(e.type==='image'){const asset=model.assets.find(a=>a.id===e.assetId);if(asset){const img=document.createElement('img');img.src=asset.data;img.alt=e.name;el.append(img);}else{el.textContent='▧';el.style.background='#34202c';el.style.justifyContent='center';}}
    if(e.type==='card'){el.style.pointerEvents=showPreview?'none':'auto';}
    if(selectedId===e.id&&!showPreview){for(const handle of ['se','nw','ne','sw']){const h=document.createElement('div');h.className='selection-handle handle-'+handle;h.dataset.handle=handle;el.append(h);}}
    el.addEventListener('pointerdown',evt=>beginPointer(evt,e));el.addEventListener('click',evt=>{if(showPreview&&e.type==='switch'){transact(()=>e.on=!e.on);}evt.stopPropagation();});root.append(el);
  }
  const nav=$('#phoneNav');nav.replaceChildren();for(const p of model.pages.slice(0,5)){const b=document.createElement('button');b.className='phone-nav-item'+(p.id===screenId?' active':'');b.innerHTML=`<span class="phone-nav-icon">${esc(p.icon||'▤')}</span><span>${esc(p.name)}</span>`;b.onclick=()=>{screenId=p.id;selectedId=null;render();};nav.append(b);}setScaler();}
function place(el,e){el.style.left=e.x+'px';el.style.top=e.y+'px';el.style.width=e.w+'px';el.style.height=e.h+'px';el.style.opacity=(e.opacity??100)/100;el.style.color=cssColor(e.color);el.style.fontSize=(e.fontSize||15)+'px';el.style.fontWeight=e.fontWeight||600;el.style.fontFamily=({system:'-apple-system, BlinkMacSystemFont, sans-serif',rounded:'ui-rounded, -apple-system, sans-serif',serif:'ui-serif, Georgia, serif',mono:'ui-monospace, SFMono-Regular, monospace'}[e.fontFamily]||'-apple-system, sans-serif');el.style.boxShadow=e.shadow?`0 ${Math.ceil(e.shadow/2)}px ${e.shadow}px rgba(0,0,0,.6)`:'none';el.style.filter=e.blur?`blur(${e.blur}px)`:'none';el.style.borderRadius=(e.radius||0)+'px';el.style.border=e.border?`${e.border}px solid ${cssColor(e.borderColor)}`:'none';el.style.textAlign=e.align||'left';el.style.justifyContent=e.align==='center'?'center':e.align==='right'?'flex-end':'flex-start';el.style.padding=(e.type==='text'||e.type==='icon'||e.type==='switch'||e.type==='image')?'0':e.type==='button'?'0 8px':'0 13px';}
function hexAlpha(hex,a){const h=cssColor(hex);return `rgba(${parseInt(h.slice(1,3),16)},${parseInt(h.slice(3,5),16)},${parseInt(h.slice(5,7),16)},${a})`;}
function selectNode(id){selectedId=id;renderLayers();renderCanvas();renderProps();if(innerWidth<=740)openMobile('props');}
function beginPointer(event,e){if(showPreview)return;event.stopPropagation();if(event.button&&event.button!==0)return;event.preventDefault();const handle=event.target.closest('.selection-handle')?.dataset.handle||null;if(e.locked){selectNode(e.id);return;}const before={x:e.x,y:e.y,w:e.w,h:e.h};const sx=event.clientX,sy=event.clientY;selectedId=e.id;renderLayers();renderProps();const root=$('#deviceElements');$$('.device-element',root).forEach(el=>{const sel=el.dataset.id===e.id;el.classList.toggle('selected',sel);$$('.selection-handle',el).forEach(h=>h.remove());if(sel)for(const x of ['se','nw','ne','sw']){const h=document.createElement('div');h.className='selection-handle handle-'+x;h.dataset.handle=x;el.append(h);}});
  const dom=$(`.device-element[data-id="${e.id}"]`,root);let moved=false;let next={...before};
  function onMove(ev){const dx=Math.round((ev.clientX-sx)/(window.__studioScale||1)),dy=Math.round((ev.clientY-sy)/(window.__studioScale||1));if(Math.abs(dx)+Math.abs(dy)>2)moved=true; if(handle){let nx=before.x,ny=before.y,nw=before.w,nh=before.h;if(handle.includes('e'))nw=bound(before.w+dx,20,CW-before.x);if(handle.includes('s'))nh=bound(before.h+dy,16,CH-before.y);if(handle.includes('w')){nx=bound(before.x+dx,0,before.x+before.w-20);nw=before.w+(before.x-nx);}if(handle.includes('n')){ny=bound(before.y+dy,0,before.y+before.h-16);nh=before.h+(before.y-ny);}next={x:nx,y:ny,w:nw,h:nh};}else{next={...before,x:bound(before.x+dx,0,CW-before.w),y:bound(before.y+dy,0,CH-before.h)};}Object.assign(dom.style,{left:next.x+'px',top:next.y+'px',width:next.w+'px',height:next.h+'px'});}
  function finish(){document.removeEventListener('pointermove',onMove);document.removeEventListener('pointerup',finish);document.removeEventListener('pointercancel',cancel);if(moved){transact(()=>Object.assign(e,next));}else{renderCanvas();renderProps();}}
  function cancel(){document.removeEventListener('pointermove',onMove);document.removeEventListener('pointerup',finish);document.removeEventListener('pointercancel',cancel);renderCanvas();}
  document.addEventListener('pointermove',onMove);document.addEventListener('pointerup',finish,{once:true});document.addEventListener('pointercancel',cancel,{once:true});}
// Fit the entire 390 x 844 device into the *actual* visible canvas.
// ResizeObserver also catches changes in iOS document viewers and Safari toolbars.
function setScaler(){
  const host=$('#canvasCenter'),wrapper=$('#phoneScaler'),frame=$('#phoneFrame');
  if(!host||!wrapper||!frame)return;
  const bounds=host.getBoundingClientRect(),css=getComputedStyle(host);
  const availableW=Math.max(1,bounds.width-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight)-12);
  const availableH=Math.max(1,bounds.height-parseFloat(css.paddingTop)-parseFloat(css.paddingBottom)-12);
  // Do not calculate a bogus zoom while a browser is still laying out the page.
  if(availableW<100||availableH<100)return;
  const fitting=Math.min(1,availableW/390,availableH/844);
  const effective=zoom*fitting;
  wrapper.style.position='relative';
  wrapper.style.flex='none';
  wrapper.style.width=(390*effective)+'px';
  wrapper.style.height=(844*effective)+'px';
  frame.style.transform=`scale(${effective})`;
  frame.style.transformOrigin='top left';
  host.classList.toggle('is-zoomed',zoom>1.01);
  // Mobile text tools remain readable even though the mock device is fitted.
  window.__studioScale=effective;
  $('#zoomLabel').textContent=Math.round(zoom*100)+'%';
}

function renderProps(){const e=selected(),root=$('#propertyFields');$('#propertySubtitle').textContent=e?e.name:'Selecione um elemento';$('#duplicateBtn').disabled=!e;$('#deleteBtn').disabled=!e;$('#upBtn').disabled=!e;$('#downBtn').disabled=!e;if(!e){root.innerHTML='<div class="no-selection"><div>⌗</div><strong>Nenhum elemento selecionado</strong><span>Toque em um componente da tela ou selecione uma camada.</span></div>';return;}
  root.replaceChildren();const title=(s)=>{const h=document.createElement('div');h.className='property-group-title';h.textContent=s;root.append(h);};
  const field=(label,prop,type='text',opts={})=>{const cell=document.createElement('div');cell.className='prop-field';const l=document.createElement('label');l.className='field-label';l.textContent=label;cell.append(l);let input;
    if(type==='select'){input=document.createElement('select');for(const [val,text] of opts.options){const o=document.createElement('option');o.value=val;o.textContent=text;input.append(o);}}
    else{input=document.createElement('input');input.type=type==='color'?'color':type==='number'||type==='range'?'number':type; if(type==='number'){input.min=opts.min??0;input.max=opts.max??999;input.step=opts.step??1;}}
    input.value=e[prop]??'';input.dataset.prop=prop;if(type==='color'){const line=document.createElement('div');line.className='prop-color';line.append(input);const text=document.createElement('code');text.textContent=e[prop];line.append(text);cell.append(line);input.addEventListener('input',()=>text.textContent=input.value);}else cell.append(input);
    let focusVal=null;input.addEventListener('focus',()=>focusVal=e[prop]);input.addEventListener('change',()=>{const newValue=(type==='number')?bound(input.value,Number(opts.min??0),Number(opts.max??999)):input.value;if(newValue!==e[prop])transact(()=>e[prop]=newValue);else renderCanvas();});return cell;};
  title('GERAL');root.append(field('Nome da camada','name'));
  if(['text','button','input','icon'].includes(e.type))root.append(field('Conteúdo','text'));
  const stateRow=document.createElement('div');stateRow.className='prop-grid';stateRow.append(field('Tipo','type','select',{options:[[e.type,e.type.toUpperCase()]]}));stateRow.append(field('Opacidade %','opacity','number',{min:0,max:100}));root.append(stateRow);
  title('POSIÇÃO E TAMANHO');const pos=document.createElement('div');pos.className='prop-grid';for(const [label,key,max] of [['X','x',CW],['Y','y',CH],['Largura','w',CW],['Altura','h',CH]])pos.append(field(label,key,'number',{min:0,max}));root.append(pos);
  title('ESTILO');const style=document.createElement('div');style.className='prop-grid';if(e.type!=='image'&&e.type!=='switch')style.append(field('Texto','color','color'));if(['card','button','switch','input'].includes(e.type))style.append(field('Fundo','bg','color'));style.append(field('Borda (px)','border','number',{min:0,max:12}));style.append(field('Cor da borda','borderColor','color'));style.append(field('Raio (px)','radius','number',{min:0,max:160}));style.append(field('Sombra','shadow','number',{min:0,max:80}));style.append(field('Desfoque','blur','number',{min:0,max:30}));if(!['card','switch','image'].includes(e.type)){style.append(field('Fonte (px)','fontSize','number',{min:6,max:110}));style.append(field('Tipo de fonte','fontFamily','select',{options:[['system','Sistema iOS'],['rounded','Arredondada'],['serif','Serifada'],['mono','Monoespaçada']]}));style.append(field('Peso','fontWeight','select',{options:[[400,'Regular'],[500,'Médio'],[600,'Semibold'],[700,'Bold'],[800,'Extra bold'],[900,'Black']]}));style.append(field('Alinhamento','align','select',{options:[['left','Esquerda'],['center','Centro'],['right','Direita']]}));}root.append(style);
  if(e.type==='switch'){const row=document.createElement('label');row.className='prop-switch-row';row.textContent='Ativado na prévia';const ck=document.createElement('input');ck.type='checkbox';ck.checked=e.on;ck.onchange=()=>transact(()=>e.on=ck.checked);row.append(ck);root.append(row);}
  if(e.type==='image'){const label=document.createElement('label');label.className='field-label';label.textContent='IMAGEM';root.append(label);const pick=document.createElement('select');pick.className='field';pick.innerHTML='<option value="">Selecione uma imagem</option>';for(const a of model.assets){const o=document.createElement('option');o.value=a.id;o.textContent=a.name;pick.append(o);}pick.value=e.assetId||'';pick.onchange=()=>transact(()=>e.assetId=pick.value);root.append(pick);}
  for(const [label,key] of [['Visível','visible'],['Bloquear movimento','locked']]){const row=document.createElement('label');row.className='prop-switch-row';row.textContent=label;const ck=document.createElement('input');ck.type='checkbox';ck.checked=e[key]!==false; if(key==='locked')ck.checked=!!e.locked;ck.onchange=()=>transact(()=>e[key]=ck.checked);row.append(ck);root.append(row);}
}
function renderGallery(){const grid=$('#assetsGrid');grid.replaceChildren();for(const a of model.assets){const b=document.createElement('button');b.className='asset-card';const img=document.createElement('img');img.src=a.data;img.alt=a.name;const cap=document.createElement('span');cap.textContent=a.name;b.append(img,cap);b.title='Adicionar imagem à tela';b.onclick=()=>{addElement('image',{assetId:a.id,name:a.name});openMobile('props');};grid.append(b);}if(!model.assets.length){const hint=document.createElement('p');hint.className='help-mini';hint.textContent='Sua galeria está vazia. Toque em “Adicionar imagem” para importar da biblioteca do iPhone.';grid.append(hint);}}
function renderTheme(){const root=$('#themeSettings');root.replaceChildren();for(const [key,label] of [['bg','Cor do fundo'],['accent','Cor de destaque'],['text','Cor do texto'],['surface','Cor dos cartões'],['secondary','Texto secundário']]){const box=document.createElement('div');const l=document.createElement('label');l.className='field-label';l.textContent=label.toUpperCase();const row=document.createElement('div');row.className='prop-color';const input=document.createElement('input');input.type='color';input.value=model.theme[key];const code=document.createElement('code');code.textContent=model.theme[key];input.addEventListener('input',()=>code.textContent=input.value);input.addEventListener('change',()=>transact(()=>model.theme[key]=input.value));row.append(input,code);box.append(l,row);root.append(box);}}
function addElement(type,ext={}){const count=page().elements.length;const left=40+((count%5)*9),top=180+((count%4)*18);const schema={text:mk('text','Novo texto',left,top,260,38,{text:'Seu texto aqui',fontSize:20,fontWeight:800}),button:mk('button','Novo botão',left,top,283,47,{text:'NOVO BOTÃO',bg:model.theme.accent,align:'center',color:'#ffffff',fontWeight:800}),card:mk('card','Novo cartão',left,top,288,80,{bg:model.theme.surface,border:1,borderColor:'#623645'}),switch:mk('switch','Novo switch',left,top,44,27,{on:true,bg:model.theme.accent}),image:mk('image','Nova imagem',left,top,160,125,{radius:13}),icon:mk('icon','Novo ícone',left,top,42,42,{text:'✦',fontSize:30,color:model.theme.accent}),input:mk('input','Novo campo',left,top,281,44,{text:'Digite aqui',bg:model.theme.surface,color:model.theme.secondary,border:1,borderColor:'#5c3a4c'})};const obj={...schema[type],...ext};transact(()=>{page().elements.push(obj);selectedId=obj.id;});hideModal('addModal');if(innerWidth<=740)openMobile('props');}
function arrangeSelected(direction){const e=selected();if(!e)return;const arr=page().elements,index=arr.findIndex(x=>x.id===e.id),to=direction==='up'?index+1:index-1;if(to<0||to>=arr.length)return;transact(()=>{arr.splice(index,1);arr.splice(to,0,e);});}
function removeSelected(){const e=selected();if(!e)return;transact(()=>{page().elements=page().elements.filter(x=>x.id!==e.id);selectedId=null;});}
function duplicateSelected(){const e=selected();if(!e)return;const copy=deep(e);copy.id=ID();copy.name=e.name+' cópia';copy.x=bound(e.x+15,0,CW-e.w);copy.y=bound(e.y+15,0,CH-e.h);transact(()=>{page().elements.push(copy);selectedId=copy.id;});}
function showModal(id){$('#'+id).classList.remove('hidden');}function hideModal(id){$('#'+id).classList.add('hidden');}
const catalog=[['text','T','Texto','Títulos, legendas e descrições'],['button','▣','Botão','Botões com ação'],['card','▢','Cartão','Painéis e fundos'],['switch','⏼','Switch','Chave liga/desliga'],['image','▧','Imagem','Recurso da galeria'],['icon','✦','Ícone','Símbolo ou emoji'],['input','▤','Campo','Campo de entrada']];
function setupCatalog(){const root=$('#elementCatalog');for(const [type,glyph,title,desc] of catalog){const b=document.createElement('button');b.className='element-option';b.innerHTML=`<span class="el-glyph">${glyph}</span><strong>${title}</strong><small>${desc}</small>`;b.onclick=()=>addElement(type);root.append(b);}}
function choosePanel(name){$$('.nav-item[data-panel]').forEach(x=>x.classList.toggle('active',x.dataset.panel===name));$$('.panel-view').forEach(x=>x.classList.toggle('hidden',x.dataset.view!==name));}
function openMobile(name){if(innerWidth>740){if(name!=='props')choosePanel(name);return;}$$('[data-mobile-tab]').forEach(x=>x.classList.toggle('active',x.dataset.mobileTab===name));const left=$('#leftpanel'),right=$('#rightpanel');if(name==='props'){left.classList.remove('mobile-open');right.classList.add('mobile-open');}else{right.classList.remove('mobile-open');left.classList.add('mobile-open');choosePanel(name);}}
function closeMobile(){if(innerWidth>740)return;$('#leftpanel').classList.remove('mobile-open');$('#rightpanel').classList.remove('mobile-open');$$('[data-mobile-tab]').forEach(x=>x.classList.remove('active'));}
function downloadBlob(filename,blob){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),5000);notify('Arquivo '+filename+' gerado ✓');}
function download(filename,text,mime='text/plain;charset=utf-8'){downloadBlob(filename,new Blob([text],{type:mime}));}
function fname(s){return String(s).replace(/[^a-z0-9_-]/ig,'_').slice(0,60)||'Satanabe';}
async function readImage(file){if(!file.type.startsWith('image/'))throw Error('Formato inválido');if(file.size>20*1024*1024)throw Error('Imagem maior que 20 MB');const obj=URL.createObjectURL(file);try{let image=null,release=()=>{};if(typeof createImageBitmap==='function'){try{image=await createImageBitmap(file);release=()=>image.close();}catch(_){}}if(!image){image=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('Não foi possível abrir a imagem'));i.src=obj;});}const width=Math.min(image.width,1280),height=Math.max(1,Math.round(image.height*width/image.width)),canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0,width,height);release();return canvas.toDataURL('image/png');}finally{URL.revokeObjectURL(obj);}}
async function importAssets(files){let success=0;const newAssets=[];for(const f of files){try{const data=await readImage(f);newAssets.push({id:'asset_'+ID(),name:f.name.slice(0,90),data});success++;}catch(err){notify(f.name+': '+err.message);}}if(success)transact(()=>model.assets.push(...newAssets));if(success)notify(success+' imagem(ns) adicionada(s) à galeria');}
function exportJson(){download(fname(model.title)+'.studio.json',JSON.stringify(model,null,2),'application/json');}
// ZIP armazenado sem compactação: compatível com Safari, sem dependências externas.
const utf8=t=>new TextEncoder().encode(t);
const crcTable=(()=>{const t=[];for(let i=0;i<256;i++){let c=i;for(let j=0;j<8;j++)c=c&1?(0xedb88320^(c>>>1)):(c>>>1);t.push(c>>>0);}return t;})();
function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
function binaryZip(items){const files=[],central=[];let offset=0;for(const item of items){const name=utf8(item.name),body=item.bytes,crc=crc32(body);const local=new Uint8Array(30+name.length),dv=new DataView(local.buffer);dv.setUint32(0,0x04034b50,true);dv.setUint16(4,20,true);dv.setUint16(6,0x800,true);dv.setUint16(8,0,true);dv.setUint32(14,crc,true);dv.setUint32(18,body.length,true);dv.setUint32(22,body.length,true);dv.setUint16(26,name.length,true);local.set(name,30);files.push(local,body);const cd=new Uint8Array(46+name.length),cv=new DataView(cd.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x800,true);cv.setUint32(16,crc,true);cv.setUint32(20,body.length,true);cv.setUint32(24,body.length,true);cv.setUint16(28,name.length,true);cv.setUint32(42,offset,true);cd.set(name,46);central.push(cd);offset+=local.length+body.length;}const cdSize=central.reduce((s,c)=>s+c.length,0),eocd=new Uint8Array(22),v=new DataView(eocd.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,items.length,true);v.setUint16(10,items.length,true);v.setUint32(12,cdSize,true);v.setUint32(16,offset,true);return new Blob([...files,...central,eocd],{type:'application/zip'});}
const integrationGuide=()=>`SATANABE UI STUDIO — PACOTE DE EXPORTAÇÃO

1. Projeto .studio.json: reabra no editor para modificar a UI.
2. SatanabeGeneratedUI.swift: adicione ao target do app no Xcode.
3. Imagens: importe cada PNG de Assets para Assets.xcassets usando exatamente o nome do arquivo sem a extensão.
4. Abra a tela: SatanabeGeneratedUI().
5. Conecte cada botão e switch às ações existentes do Satanabe External. O editor gera APENAS a interface — não conecta validação de key, downloads e APIs por conta própria.
6. Se você importou o DesignSystem.swift original, exporte a opção 'Tema .swift' para receber o DesignSystem refeito com constantes de cores.
7. Compile e assine a IPA no seu ambiente iOS/macOS adequado. O site não altera uma IPA compilada.

IMPORTANTE: Esta é uma interface SwiftUI nova que replica as telas criadas no editor, não um patch automático da UI de um binário existente.
`;
async function exportPack(){try{const items=[{name:'SatanabeGeneratedUI.swift',bytes:utf8(swiftCode())},{name:fname(model.title)+'.studio.json',bytes:utf8(JSON.stringify(model,null,2))},{name:'LEIA_PRIMEIRO.txt',bytes:utf8(integrationGuide())}];for(const asset of model.assets){const base64=asset.data.split(',')[1];if(!base64)continue;const raw=atob(base64),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);items.push({name:'Assets/studio_'+asset.id+'.png',bytes});}downloadBlob('Satanabe_UI_Export.zip',binaryZip(items));}catch(err){notify('Não foi possível gerar o ZIP: '+err.message);}}

async function importProject(file){try{if(file.size>25*1024*1024)throw Error('Projeto muito grande');const data=JSON.parse(await file.text());if(!validModel(data))throw Error('JSON não é um projeto do Studio válido');checkpoint();model=data;screenId=data.pages[0].id;selectedId=null;render();markSave();notify('Projeto importado com sucesso');}catch(err){notify('Erro na importação: '+err.message);}}
function newScreen(){const input=$('#screenNameInput');const name=input.value.trim();if(!name)return notify('Informe o nome da tela');if(model.pages.length>=12)return notify('Limite de 12 telas');const pg={id:ID(),name:name.slice(0,25),icon:'▤',elements:[]};transact(()=>{model.pages.push(pg);screenId=pg.id;selectedId=null;});input.value='';hideModal('screenModal');}
const swiftStr=v=>'"'+String(v??'').replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\n/g,'\\n').replace(/\r/g,'')+'"';
const swiftNum=n=>Number(Number(n).toFixed(2)).toString();
const swiftColor=c=>{const h=cssColor(c);return `Color(red: ${swiftNum(parseInt(h.slice(1,3),16)/255)}, green: ${swiftNum(parseInt(h.slice(3,5),16)/255)}, blue: ${swiftNum(parseInt(h.slice(5,7),16)/255)})`;};
const swiftId=s=>String(s).replace(/[^\w]/g,'_');
function swiftCode(){const lines=[
'// SATANABE UI STUDIO — SwiftUI gerado',
'// Componentes visuais exportados pelo editor.',
'// Integre as ações abaixo ao código real do Satanabe External.',
'// Imagens: adicione cada arquivo na pasta Assets.xcassets com o nome indicado.',
'import SwiftUI','',
'struct SatanabeGeneratedUI: View {',
'    var body: some View {',
'        TabView {'];
 const safePages=model.pages.slice(0,12);
 for(let i=0;i<safePages.length;i++){const p=safePages[i];const systemImages=['flame.fill','square.grid.2x2.fill','shield.fill','key.fill','slider.horizontal.3','gearshape.fill'];lines.push(`            SatanabeStudioScreen${i}()`);lines.push(`                .tabItem { Label(${swiftStr(p.name)}, systemImage: ${swiftStr(systemImages[i%systemImages.length])}) }`);}
 lines.push('        }','        .tint('+swiftColor(model.theme.accent)+')','    }','}','');
 for(let i=0;i<safePages.length;i++){const p=safePages[i];lines.push(`private struct SatanabeStudioScreen${i}: View {`);for(const e of p.elements){if(e.type==='switch')lines.push(`    @State private var toggle_${swiftId(e.id)} = ${e.on?'true':'false'}`);}lines.push('    var body: some View {','        GeometryReader { geo in',`            let scale = max(0.1, geo.size.width / ${CW}.0)`,'            ScrollView {','                ZStack(alignment: .topLeading) {',`                    ${swiftColor(model.theme.bg)}`,'                        .frame(width: '+CW+', height: '+CH+')');
 for(const e of p.elements){if(e.visible===false)continue;let code='';const txt=swiftStr(e.text||'');switch(e.type){
 case 'text':code=`Text(${txt})`;break;
 case 'icon':code=`Text(${txt})`;break;
 case 'button':code=`Button(action: {\n                        // TODO: vincule a ação original do botão ${e.name.replace(/[^\w\s-]/g,'')}\n                    }) { Text(${txt}) }`;break;
 case 'input':code=`Text(${txt})`;break;
 case 'switch':code=`Toggle("", isOn: $toggle_${swiftId(e.id)})\n                        .labelsHidden()\n                        .toggleStyle(.switch)\n                        .tint(${swiftColor(e.bg)})`;break;
 case 'image':code=`Image(${swiftStr(e.assetId?'studio_'+e.assetId:'studio_image')})\n                        .resizable()\n                        .scaledToFill()`;break;
 case 'card':code=`RoundedRectangle(cornerRadius: ${swiftNum(e.radius)}).fill(${swiftColor(e.bg)})`;break;
 }
 lines.push('                    '+code);
 if(e.type==='text'||e.type==='icon'||e.type==='button'||e.type==='input'){
  lines.push(`                        .font(.system(size: ${swiftNum(e.fontSize)}, weight: ${({400:'.regular',500:'.medium',600:'.semibold',700:'.bold',800:'.heavy',900:'.black'}[e.fontWeight]||'.semibold')}, design: ${({system:'.default',rounded:'.rounded',serif:'.serif',mono:'.monospaced'}[e.fontFamily]||'.default')}))`);
  lines.push(`                        .foregroundStyle(${swiftColor(e.color)})`);
  if(e.type==='button'||e.type==='input')lines.push('                        .frame(maxWidth: .infinity, alignment: '+(e.align==='right'?'.trailing':e.align==='center'?'.center':'.leading')+')');
  lines.push(`                        .multilineTextAlignment(${e.align==='right'?'.trailing':e.align==='center'?'.center':'.leading'})`);
 }
 lines.push(`                        .frame(width: ${swiftNum(e.w)}, height: ${swiftNum(e.h)}, alignment: ${e.align==='right'?'.trailing':e.align==='center'?'.center':'.leading'})`);
 if(['button','input'].includes(e.type))lines.push(`                        .background(${swiftColor(e.bg)}, in: RoundedRectangle(cornerRadius: ${swiftNum(e.radius)}))`);
 if(e.border)lines.push(`                        .overlay(RoundedRectangle(cornerRadius: ${swiftNum(e.radius)}).stroke(${swiftColor(e.borderColor)}, lineWidth: ${swiftNum(e.border)}))`);
 if(e.type==='image')lines.push(`                        .clipShape(RoundedRectangle(cornerRadius: ${swiftNum(e.radius)}))`);
 if(e.shadow)lines.push(`                        .shadow(color: Color.black.opacity(0.6), radius: ${swiftNum(e.shadow)}, y: ${swiftNum(e.shadow/2)})`);
 if(e.blur)lines.push(`                        .blur(radius: ${swiftNum(e.blur)})`);
 lines.push(`                        .opacity(${swiftNum((e.opacity??100)/100)})`);
 lines.push(`                        .position(x: ${swiftNum(e.x+e.w/2)}, y: ${swiftNum(e.y+e.h/2)})`);
 }
 lines.push('                }',`                .frame(width: ${CW}, height: ${CH})`,'                .scaleEffect(scale, anchor: .topLeading)',`                .frame(width: geo.size.width, height: ${CH} * scale, alignment: .topLeading)`,'            }','        }','    }','}','');
 }
 return lines.join('\n');}
function exportSwift(){download('SatanabeGeneratedUI.swift',swiftCode());}
function replaceNumber(source,key,value){const rx=new RegExp(`(static let ${key}\\s*:\\s*CGFloat\\s*=\\s*)[0-9.]+`);return source.replace(rx,(_,start)=>start+Number(value).toString());}
function exportTheme(){const theme=model.theme;if(!importedDesignSystem){const code=`import SwiftUI\n\n// Tema exportado pelo Satanabe UI Studio.\n// Sem o DesignSystem.swift original, este arquivo é apenas um tema de referência.\nenum SatanabeStudioTheme {\n    static let accent = ${swiftColor(theme.accent)}\n    static let pageBackground = ${swiftColor(theme.bg)}\n    static let surface = ${swiftColor(theme.surface)}\n    static let text = ${swiftColor(theme.text)}\n    static let secondary = ${swiftColor(theme.secondary)}\n}\n`;download('SatanabeStudioTheme.swift',code);notify('Importe o DesignSystem.swift original para gerar uma versão atualizada dele.');return;}
 let text=importedDesignSystem;const accent=theme.accent;const r=swiftNum(parseInt(accent.slice(1,3),16)/255),g=swiftNum(parseInt(accent.slice(3,5),16)/255),b=swiftNum(parseInt(accent.slice(5,7),16)/255);
 text=text.replace(/UIColor\(red:\s*[\d.]+,\s*green:\s*[\d.]+,\s*blue:\s*[\d.]+,\s*alpha:\s*[\d.]+\)/g,`UIColor(red: ${r}, green: ${g}, blue: ${b}, alpha: 1.00)`);
 text=text.replace(/(static let pageBackground\s*=\s*)Color\(uiColor: \.systemBackground\)/,`$1${swiftColor(theme.bg)}`);
 text=text.replace(/(static let consoleBackground\s*=\s*)Color\(uiColor: \.secondarySystemBackground\)/,`$1${swiftColor(theme.surface)}`);
 const cr=model.pages.flatMap(p=>p.elements).find(e=>e.type==='card');if(cr)text=replaceNumber(text,'contentCardCornerRadius',cr.radius);
 download('DesignSystem.swift',text);}
async function loadDesignSystem(file){try{const txt=await file.text();if(!txt.includes('enum AppTheme')||!txt.includes('contentCardCornerRadius'))throw Error('Arquivo não parece o DesignSystem.swift do 3105');importedDesignSystem=txt;const rgba=txt.match(/UIColor\(red:\s*([\d.]+),\s*green:\s*([\d.]+),\s*blue:\s*([\d.]+)/);if(rgba){const hex=x=>Math.round(bound(parseFloat(x)*255,0,255)).toString(16).padStart(2,'0');const c='#'+hex(rgba[1])+hex(rgba[2])+hex(rgba[3]);transact(()=>model.theme.accent=c);}notify('DesignSystem.swift carregado. Agora você pode exportá-lo editado.');hideModal('exportModal');}catch(e){notify(e.message);}}
const aiAllowed={opacity:[0,100],fontSize:[6,110],fontWeight:[400,900],radius:[0,160],shadow:[0,80],blur:[0,30],border:[0,12],x:[0,CW],y:[0,CH],w:[20,CW],h:[16,CH]};
function validateAiDiff(diff){if(!diff||typeof diff!=='object'||Array.isArray(diff))throw Error('Resposta inválida');const accepted={};for(const [key,val] of Object.entries(diff)){if(Object.hasOwn(aiAllowed,key)){if(typeof val!=='number'||!Number.isFinite(val))continue;accepted[key]=bound(val,...aiAllowed[key]);}else if(['color','bg','borderColor'].includes(key)&&/^#[a-fA-F0-9]{6}$/.test(val))accepted[key]=val;else if(key==='align'&&['left','center','right'].includes(val))accepted[key]=val;else if(key==='fontFamily'&&['system','rounded','serif','mono'].includes(val))accepted[key]=val;else if(key==='text'&&typeof val==='string')accepted[key]=val.slice(0,160);}return accepted;}
async function askAi(){const e=selected(),target=$('#aiResult'),prompt=$('#aiPrompt').value.trim();if(!e){target.textContent='Selecione primeiro um elemento no canvas.';return;}if(prompt.length<5){target.textContent='Descreva a alteração que deseja.';return;}const send=$('#aiSend');send.disabled=true;target.textContent='Preparando sugestão...';pendingAi=null;try{const res=await fetch('/api/assist',{method:'POST',headers:{'Content-Type':'application/json','x-studio-code':$('#aiCode').value.trim()},body:JSON.stringify({prompt:prompt.slice(0,550),element:{...e},theme:model.theme})});const data=await res.json().catch(()=>({error:'Resposta do servidor inválida'}));if(!res.ok)throw Error(data.error||'Não foi possível consultar a IA');const change=validateAiDiff(data.changes);if(!Object.keys(change).length)throw Error('A IA não retornou propriedades editáveis');pendingAi={id:e.id,change};target.replaceChildren();const para=document.createElement('div');para.textContent=Object.entries(change).map(([k,v])=>`${k}: ${v}`).join('\n');target.append(para);const apply=document.createElement('button');apply.className='primary-btn';apply.textContent='✓ Aplicar sugestão';apply.onclick=()=>{const found=page().elements.find(x=>x.id===pendingAi?.id);if(!found)return notify('Selecione novamente o elemento');transact(()=>Object.assign(found,pendingAi.change));pendingAi=null;target.textContent='Alteração aplicada. Você pode desfazer.';notify('Sugestão aplicada ✓');};target.append(apply);}catch(err){target.textContent='IA indisponível: '+err.message+'\nVocê pode continuar usando todas as ferramentas manuais.';}finally{send.disabled=false;}}
function bind(){setupCatalog();$('#undoBtn').onclick=undo;$('#redoBtn').onclick=redo;$('#saveBtn').onclick=()=>saveModel(true);$('#exportBtn').onclick=$('#openExport').onclick=()=>showModal('exportModal');$('#addElementQuick').onclick=()=>showModal('addModal');$('#addScreenBtn').onclick=()=>showModal('screenModal');$('#createScreenConfirm').onclick=newScreen;$('#duplicateBtn').onclick=duplicateSelected;$('#deleteBtn').onclick=removeSelected;$('#upBtn').onclick=()=>arrangeSelected('up');$('#downBtn').onclick=()=>arrangeSelected('down');
  $('#zoomOut').onclick=()=>{zoom=bound(zoom-.15,.5,2.4);setScaler();};$('#zoomIn').onclick=()=>{zoom=bound(zoom+.15,.5,2.4);setScaler();};$('#fitBtn').onclick=()=>{zoom=1;setScaler();};
  $('#previewToggle').onclick=()=>{showPreview=!showPreview;$('#previewLabel').textContent=showPreview?'Editar':'Prévia';if(showPreview)closeMobile();renderCanvas();notify(showPreview?'Prévia: toque nos switches para testar':'Modo de edição ativado');};
  $$('.nav-item[data-panel]').forEach(b=>b.onclick=()=>choosePanel(b.dataset.panel));$$('[data-mobile-tab]').forEach(b=>b.onclick=()=>{const same=b.classList.contains('active')&&($('#leftpanel').classList.contains('mobile-open')||$('#rightpanel').classList.contains('mobile-open'));if(same){closeMobile();return;}openMobile(b.dataset.mobileTab);});$('#closeProps').onclick=closeMobile;
  $('#toggleLeft').onclick=()=>$('.sidebar').classList.toggle('open');
  $('#uploadAssetBtn').onclick=()=>$('#assetFile').click();$('#assetFile').onchange=async e=>{await importAssets([...e.target.files]);e.target.value='';};
  $('#importProject').onclick=()=>$('#projectFile').click();$('#projectFile').onchange=async e=>{const f=e.target.files[0];if(f)await importProject(f);e.target.value='';};
  $('#exportPack').onclick=exportPack;$('#exportJson').onclick=exportJson;$('#exportSwift').onclick=exportSwift;$('#exportTheme').onclick=exportTheme;$('#importSwiftTheme').onclick=()=>$('#swiftFile').click();$('#swiftFile').onchange=async e=>{const f=e.target.files[0];if(f)await loadDesignSystem(f);e.target.value='';};
  $$('.preset').forEach(b=>b.onclick=()=>transact(()=>model.theme=deep(presets[b.dataset.preset])));
  $('#aiSend').onclick=askAi;
  $$('[data-close]').forEach(x=>x.onclick=()=>hideModal(x.dataset.close));$$('.modal-overlay').forEach(x=>x.onclick=e=>{if(e.target===x)x.classList.add('hidden');});
  $('#deviceElements').onclick=e=>{if(e.target===$('#deviceElements')){selectedId=null;renderLayers();renderCanvas();renderProps();}};
  window.addEventListener('resize',()=>{setScaler();if(innerWidth>740){$('#leftpanel').classList.remove('mobile-open');$('#rightpanel').classList.remove('mobile-open');}});
  window.addEventListener('keydown',e=>{if(e.target.closest('input,textarea,select')||$('.modal-overlay:not(.hidden)'))return;const mod=e.ctrlKey||e.metaKey;if(mod&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo();}else if(mod&&e.key.toLowerCase()==='y'){e.preventDefault();redo();}else if(mod&&e.key.toLowerCase()==='d'){e.preventDefault();duplicateSelected();}else if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();removeSelected();}else if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)&&selected()&&!selected().locked){e.preventDefault();const el=selected(),step=e.shiftKey?10:1;transact(()=>{if(e.key==='ArrowUp')el.y=bound(el.y-step,0,CH-el.h);if(e.key==='ArrowDown')el.y=bound(el.y+step,0,CH-el.h);if(e.key==='ArrowLeft')el.x=bound(el.x-step,0,CW-el.w);if(e.key==='ArrowRight')el.x=bound(el.x+step,0,CW-el.w);});}});
}
bind();loadModel();

// Match the *visible* height when the browser bars expand/collapse.
let viewportTick=0;
function syncVisibleViewport(){
  cancelAnimationFrame(viewportTick);
  viewportTick=requestAnimationFrame(()=>{
    const height=Math.max(320,Math.round(window.visualViewport?.height || window.innerHeight));
    document.documentElement.style.setProperty('--studio-height',height+'px');
    requestAnimationFrame(setScaler);
  });
}
const canvasResize=new ResizeObserver(()=>requestAnimationFrame(setScaler));
canvasResize.observe($('#canvasCenter'));
syncVisibleViewport();
window.addEventListener('resize',syncVisibleViewport,{passive:true});
window.visualViewport?.addEventListener('resize',syncVisibleViewport,{passive:true});
window.visualViewport?.addEventListener('scroll',syncVisibleViewport,{passive:true});
// Re-measure once after WebKit has completed first paint and font layout.
window.addEventListener('load',()=>{syncVisibleViewport();requestAnimationFrame(()=>requestAnimationFrame(setScaler));});

})();
