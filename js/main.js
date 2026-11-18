(()=>{
const{Api}=window,G=Api.G,page=document.body.dataset.page,q=new URLSearchParams(location.search);
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const LS={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=u=>/^https?:\/\//i.test(u||'')?u:'';
const key=i=>i.type+':'+i.id,REG={},app=()=>$('#app');
const hue=s=>[...String(s)].reduce((a,c)=>a+c.charCodeAt(0),0)%360;
const grad=i=>`background:linear-gradient(160deg,hsl(${hue(i.title)} 55% 26%),#11131A)`;
const bgOf=i=>i.backdrop?`background-image:url('${esc(i.backdrop)}')`:grad(i);
const poster=i=>i.poster?`<img loading="lazy" src="${esc(i.poster)}" alt="${esc(i.title)} posteri">`:`<span class="ph">${esc(i.title)}</span>`;
const href=i=>`details.html?t=${i.type}&id=${encodeURIComponent(i.id)}`;
const meta=i=>`<span><b>★ ${i.rating||'–'}</b></span><span>${esc(i.year)}</span>${i.runtime?`<span>${i.runtime} daq</span>`:''}${i.seasons?`<span>${i.seasons} mavsum</span>`:''}<span>${i.genres.map(g=>G[g]).slice(0,3).join(', ')}</span>`;
// ---------- toast / modal ----------
function toast(m){let t=$('#toasts');if(!t){t=document.createElement('div');t.id='toasts';t.setAttribute('aria-live','polite');document.body.append(t)}
 const e=document.createElement('div');e.className='toast';e.textContent=m;t.append(e);setTimeout(()=>e.remove(),3000)}
function modal(html){const m=document.createElement('div');m.className='md';m.innerHTML=`<div><button class="x" aria-label="Yopish">✕</button>${html}</div>`;
 const close=()=>{m.remove();document.removeEventListener('keydown',esc_)},esc_=e=>e.key==='Escape'&&close();
 m.onclick=e=>{if(e.target===m||e.target.closest('.x'))close()};document.addEventListener('keydown',esc_);document.body.append(m)}
// ---------- storage: favorites, auth ----------
const favs=()=>LS.get('kf_favs',[]),isFav=i=>favs().some(f=>key(f)===key(i));
function toggleFav(k){const i=REG[k];if(!i)return;let f=favs();const on=f.some(x=>key(x)===k);
 f=on?f.filter(x=>key(x)!==k):[...f,i];LS.set('kf_favs',f);$$(`[data-fav="${CSS.escape(k)}"]`).forEach(b=>b.classList.toggle('on',!on));
 toast(on?'Saqlanganlardan olib tashlandi':'Saqlanganlarga qo\'shildi');return!on}
const hash=async s=>{const d='kf:'+s;if(!crypto.subtle)return btoa(unescape(encodeURIComponent(d)));
 return[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(d)))].map(b=>b.toString(16).padStart(2,'0')).join('')};
const user=()=>{const e=LS.get('kf_session');return LS.get('kf_users',[]).find(u=>u.email===e)};
const isAdmin=u=>!!u&&(u.role==='admin'||(KF.ADMIN_EMAILS||[]).map(e=>e.toLowerCase()).includes(u.email));
const gid=()=>LS.get('kf_guest');
const who=()=>{const u=user();return u?u.email:gid()};
function beat(){const id=who();if(!id)return;const a=LS.get('kf_active',{}),n=Date.now();a[id]=n;for(const k in a)if(n-a[k]>3e5)delete a[k];LS.set('kf_active',a)}
function guestIn(){const id='g'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);LS.set('kf_guest',id);LS.set('kf_guests',[...LS.get('kf_guests',[]),{id,t:Date.now()}]);beat();toast('Mehmon sifatida kirdingiz');setTimeout(()=>location.href='index.html',400)}
function leave(){const a=LS.get('kf_active',{});delete a[who()];LS.set('kf_active',a);localStorage.removeItem('kf_guest');localStorage.removeItem('kf_session');location.href='index.html'}
// ---------- UI pieces ----------
const sk=(n=8)=>Array(n).fill('<div class="sk"></div>').join('');
const card=i=>{REG[key(i)]=i;return`<a class="card" href="${href(i)}"><div class="poster" style="${grad(i)}">${poster(i)}<button class="fav${isFav(i)?' on':''}" data-fav="${esc(key(i))}" aria-label="Saqlash">♥</button></div><h3>${esc(i.title)}</h3><p><b>★ ${i.rating||'–'}</b> ${esc(i.year)} ${i.genres[0]?esc(G[i.genres[0]]):''}${i.seasons?', '+i.seasons+' mavsum':''}</p></a>`};
const empty=(t,s,b='')=>`<div class="empty"><div class="big">🎬</div><h3>${t}</h3><p>${s}</p>${b}</div>`;
async function load(el,fn,render){el.innerHTML=sk();try{render(await fn())}catch(e){el.innerHTML=`<div class="err"><p>Ma'lumotni yuklab bo'lmadi: ${esc(e.message)}</p><br><button class="btn red" data-retry>Qayta urinish</button></div>`;$('[data-retry]',el).onclick=()=>load(el,fn,render)}}
function trailer(i){const k=i.trailer;if(/^[\w-]{11}$/.test(k||''))return modal(`<iframe src="https://www.youtube-nocookie.com/embed/${k}?autoplay=1" allow="autoplay;encrypted-media;fullscreen" allowfullscreen title="${esc(i.title)} treyleri"></iframe>`);
 window.open('https://www.youtube.com/results?search_query='+encodeURIComponent(i.title+' '+i.year+' official trailer'),'_blank','noopener');toast('Treyler YouTube’da ochildi')}
async function trailerById(k){const i=REG[k];if(!i)return;if(i.trailer!==undefined&&(i.trailer||String(i.id)[0]==='d'))return trailer(i);try{trailer(await Api.detail(i.type,i.id))}catch{trailer({...i,trailer:''})}}
// ---------- chrome ----------
const NAV=[['index.html','home','Bosh sahifa'],['movies.html','movies','Filmlar'],['cartoons.html','cartoons','Multfilmlar'],['series.html','series','Seriallar'],['index.html#janrlar','genres','Janrlar'],['favorites.html','favorites','Saqlanganlar']];
function chrome(){const u=user();
 $('#hd').outerHTML=`<header class="hd"><a class="logo" href="${isAdmin(u)?'admin.html':'index.html'}">KINOFLIX</a><button class="burger" aria-label="Menyu" aria-expanded="false"><i></i></button><nav class="nav" id="nav">${NAV.map(([h,k,t])=>`<a href="${h}"${k===page?' class="on"':''}>${t}</a>`).join('')}</nav><div class="tools"><button class="ib" id="sb" aria-label="Qidiruv">⌕</button>${u?`<a class="ib av" href="profile.html" aria-label="Profil">${esc(u.name[0].toUpperCase())}</a>`:gid()?`<a class="btn sm" href="register.html">Ro‘yxatdan o‘tish</a><button class="btn sm" id="go">Chiqish</button>`:`<a class="btn sm lg" href="login.html">Kirish</a><a class="btn sm red" href="register.html">Ro‘yxatdan o‘tish</a><button class="btn sm" id="gs">Mehmon<span class="lg"> sifatida kirish</span></button>`}</div></header>
 <div class="so" hidden><button class="x" aria-label="Yopish">✕</button><input id="si" type="search" placeholder="Film, serial, aktyor yoki janr..." autocomplete="off"><div id="sres"></div></div>`;
 $('#ft').outerHTML=`<footer class="ft"><p>© Kinoflix. Faqat qonuniy va rasmiy manbalar.</p><p>Bu sayt TMDB API’dan foydalanadi, ammo TMDB tomonidan tasdiqlanmagan yoki sertifikatlanmagan. Kino ma’lumotlari: <a href="https://www.themoviedb.org" rel="noopener" target="_blank"><u>TMDB</u></a>. <button id="fk" style="background:none;border:0;color:inherit;cursor:pointer"><u>TMDB kaliti</u></button></p></footer>`;
 $('#fk').onclick=tmdbKey;const gs=$('#gs'),go=$('#go');if(gs)gs.onclick=guestIn;if(go)go.onclick=leave;const b=$('.burger'),n=$('#nav');b.onclick=()=>b.setAttribute('aria-expanded',n.classList.toggle('open'));
 const so=$('.so'),si=$('#si');let tm;
 $('#sb').onclick=()=>{so.hidden=false;si.focus()};$('.so .x').onclick=()=>so.hidden=true;
 document.addEventListener('keydown',e=>{if(e.key==='Escape')so.hidden=true});
 si.onkeydown=e=>{if(e.key==='Enter'&&si.value.trim())location.href='search.html?q='+encodeURIComponent(si.value.trim())};
 si.oninput=()=>{clearTimeout(tm);const v=si.value.trim(),r=$('#sres');if(!v){r.innerHTML='';return}
  tm=setTimeout(async()=>{try{const s=await Api.search(v),a=[...s.movies,...s.cartoons,...s.series,...s.actors].slice(0,8);
   r.innerHTML=a.length?a.map(i=>(REG[key(i)]=i,`<a class="sr" href="${href(i)}"><div class="poster" style="${grad(i)}">${i.poster?poster(i):''}</div><div>${esc(i.title)}<small>${esc(i.year)} ${i.type==='tv'?'Serial':i.genres.includes(16)?'Multfilm':'Film'}</small></div></a>`)).join('')+`<p style="padding:12px"><a href="search.html?q=${encodeURIComponent(v)}"><u>Barcha natijalar</u></a></p>`:empty('Hech narsa topilmadi',`“${esc(v)}” bo‘yicha natija yo‘q. Boshqa nom yoki janrni sinab ko‘ring.`)}
   catch(e){r.innerHTML=`<div class="err">Qidiruvda xatolik: ${esc(e.message)}</div>`}},250)}}
// ---------- TMDB key ----------
function tmdbKey(){modal(`<form class="f" id="kf" style="padding:16px"><h2>TMDB API kaliti</h2><p style="color:var(--mu);font-size:.9rem">Kalitni <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener"><u>themoviedb.org/settings/api</u></a> sahifasidan bepul oling (v3 auth, 32 belgi). Kalit faqat shu brauzerda saqlanadi.</p><label>API kalit<input name="k" value="${esc(KF.TMDB_KEY)}" pattern="[0-9a-fA-F]{32}" placeholder="32 belgili kalit" required></label><button class="btn red" style="justify-content:center">Saqlash</button>${KF.TMDB_KEY?'<button type="button" class="btn" id="kr" style="justify-content:center">Kalitni o‘chirish (demo)</button>':''}</form>`);
 $('#kf').onsubmit=e=>{e.preventDefault();localStorage.setItem('kf_tmdb',new FormData(e.target).get('k').trim());location.reload()};const r=$('#kr');if(r)r.onclick=()=>{localStorage.removeItem('kf_tmdb');location.reload()}}
// ---------- HOME ----------
function rowSec(title,link,id){return`<section class="row wrap"><div class="rh"><h2>${title}</h2><a href="${link}">Barchasini ko‘rish</a></div><div class="strip" id="${id}"></div></section>`}
function hero(el,items){let n=0,t;const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const draw=()=>{const i=items[n];REG[key(i)]=i;el.innerHTML=`<div class="hbg" style="${bgOf(i)}"></div><div class="hin"><h1>${esc(i.title)}</h1><div class="meta">${meta(i)}</div><p class="ov">${esc(i.overview)}</p><div class="acts"><a class="btn red" href="${href(i)}">Batafsil ma’lumot</a><button class="btn" data-trailer="${esc(key(i))}">▶ Treylerni ko‘rish</button></div></div><div class="hctl"><button class="ib" data-go="-1" aria-label="Oldingi">‹</button>${items.map((_,k)=>`<button class="dot${k===n?' on':''}" data-go="${k}" data-abs aria-label="${k+1}-slayd"></button>`).join('')}<button class="ib" data-go="1" aria-label="Keyingi">›</button></div>`;
  $$('[data-go]',el).forEach(b=>b.onclick=()=>{n=b.hasAttribute('data-abs')?+b.dataset.go:(n+ +b.dataset.go+items.length)%items.length;draw();auto()})};
 const auto=()=>{clearInterval(t);if(!reduce)t=setInterval(()=>{n=(n+1)%items.length;draw()},7000)};draw();auto()}
function home(){app().innerHTML=`<section class="hero" id="hero"><div class="sk" style="position:absolute;inset:0;aspect-ratio:auto;border-radius:0"></div></section>
 ${rowSec('Trenddagi kinolar','movies.html','r1')}${rowSec('Yangi filmlar','movies.html?sort=new','r2')}${rowSec('Mashhur multfilmlar','cartoons.html','r3')}${rowSec('Mashhur seriallar','series.html','r4')}
 <section class="row wrap" id="janrlar"><div class="rh"><h2>Janrlar</h2><a href="movies.html">Barchasini ko‘rish</a></div><div class="chips">${Object.entries(G).map(([id,n])=>`<a class="chip" href="${id==16?'cartoons.html':'movies.html?genre='+id}">${n}</a>`).join('')}</div></section>`;
 const fill=(id,o)=>load($('#'+id),()=>Api.list(o),r=>$('#'+id).innerHTML=r.items.length?r.items.map(card).join(''):empty('Hozircha bo‘sh','Keyinroq qaytib keling.'));
 fill('r1',{type:'movie'});fill('r2',{type:'movie',sort:'new'});fill('r3',{cartoon:true});fill('r4',{type:'tv'});
 Api.list({type:'movie'}).then(r=>{const h=r.items.filter(i=>i.backdrop).slice(0,5);hero($('#hero'),h.length?h:r.items.slice(0,5))}).catch(e=>$('#hero').innerHTML=`<div class="err" style="margin:auto"><p>${esc(e.message)}</p><br><button class="btn red" onclick="location.reload()">Qayta urinish</button></div>`);
 if(Api.fallback)toast('TMDB ishlamadi — demo ma’lumotlar ko‘rsatilmoqda')}
// ---------- CATALOG ----------
function catalog(kind){const T={movie:'Filmlar',cartoon:'Multfilmlar',tv:'Seriallar'}[kind];
 const st={type:kind==='tv'?'tv':'movie',cartoon:kind==='cartoon',genre:q.get('genre')||'',year:'',sort:q.get('sort')||'popularity',q:'',page:1},y=new Date().getFullYear();
 app().innerHTML=`<section class="wrap"><h1 class="pt">${T}</h1><div class="filters"><input type="search" id="fq" placeholder="${T} ichidan qidirish..." aria-label="Qidirish"><select id="fg" aria-label="Janr"><option value="">Barcha janrlar</option>${Object.entries(G).filter(([id])=>id!=16).map(([id,n])=>`<option value="${id}"${id==st.genre?' selected':''}>${n}</option>`).join('')}</select><select id="fy" aria-label="Yil"><option value="">Barcha yillar</option>${Array.from({length:y-1969},(_,k)=>`<option>${y-k}</option>`).join('')}</select><select id="fs" aria-label="Saralash">${[['popularity','Mashhurlik'],['rating','Reyting'],['new','Eng yangi']].map(([v,n])=>`<option value="${v}"${v===st.sort?' selected':''}>${n}</option>`).join('')}</select></div><div class="grid" id="gr"></div><div class="more"><button class="btn" id="mr" hidden>Yana yuklash</button></div></section>`;
 const gr=$('#gr'),mr=$('#mr');
 const run=async more=>{if(!more)gr.innerHTML=sk(12);mr.hidden=true;
  try{const r=await Api.list(st);if(!more)gr.innerHTML='';if(!r.items.length&&st.page===1)gr.innerHTML=empty('Hech narsa topilmadi','Filtrlarni o‘zgartirib ko‘ring.');else gr.insertAdjacentHTML('beforeend',r.items.map(card).join(''));mr.hidden=st.page>=r.pages}
  catch(e){gr.innerHTML=`<div class="err"><p>${esc(e.message)}</p><br><button class="btn red" id="rt">Qayta urinish</button></div>`;$('#rt').onclick=()=>run(false)}};
 const chg=()=>{st.page=1;run(false)};let tm;
 $('#fq').oninput=e=>{clearTimeout(tm);tm=setTimeout(()=>{st.q=e.target.value.trim();chg()},350)};
 $('#fg').onchange=e=>{st.genre=e.target.value;chg()};$('#fy').onchange=e=>{st.year=e.target.value;chg()};$('#fs').onchange=e=>{st.sort=e.target.value;chg()};
 mr.onclick=()=>{st.page++;run(true)};run(false)}
// ---------- DETAILS ----------
const stars=k=>{const v=LS.get('kf_rate',{})[k]||0;return[1,2,3,4,5].map(n=>`<button data-star="${n}" class="${n<=v?'on':''}" aria-label="${n} yulduz">★</button>`).join('')};
const cmts=k=>(LS.get('kf_cm',{})[k]||[]).map(c=>`<div class="cmt"><small>${esc(c.u)}, ${esc(c.d)}</small><p>${esc(c.t)}</p></div>`).join('')||'<p style="color:var(--mu)">Hozircha izoh yo‘q. Birinchi bo‘ling!</p>';
async function details(){const t=q.get('t')||'movie',id=q.get('id');app().innerHTML=`<div class="wrap"><div class="grid" style="padding-top:40px">${sk(4)}</div></div>`;
 try{const i=await Api.detail(t,id),k=key(i);REG[k]=i;document.title=i.title+' – Kinoflix';
  const wl=safeUrl(i.watch);
  app().innerHTML=`<section class="dh"><div class="hbg" style="${bgOf(i)}"></div><div class="wrap dgrid"><div class="poster" style="${grad(i)}">${poster(i)}</div><div><h1>${esc(i.title)}</h1><p class="orig">${esc(i.orig)}</p><div class="meta">${meta(i)}</div><p>${esc(i.overview)||'Tavsif mavjud emas.'}</p><dl><dt>Rejissyor</dt><dd>${esc(i.director)||'–'}</dd><dt>Chiqqan sana</dt><dd>${esc(i.date||i.year)}</dd><dt>Davomiyligi</dt><dd>${i.runtime?i.runtime+' daqiqa':'–'}</dd><dt>Janr</dt><dd>${i.genres.map(g=>G[g]).join(', ')||'–'}</dd></dl><div class="acts"><a class="btn red" href="watch.html?t=${i.type}&id=${encodeURIComponent(i.id)}">▶ Tomosha qilish</a><button class="btn" data-trailer="${esc(k)}">Treyler</button><button class="btn fav-b" data-fav="${esc(k)}">${isFav(i)?'♥ Saqlangan':'♡ Saqlash'}</button>${wl?`<a class="btn" href="${esc(wl)}" target="_blank" rel="noopener noreferrer">Rasmiy havola</a>`:''}</div></div></div></section>
  <section class="wrap sec"><h2>Aktyorlar</h2><div class="cast">${(i.cast||[]).map(c=>`<div class="cm"><i>${c.photo?`<img loading="lazy" src="${esc(c.photo)}" alt="${esc(c.name)}">`:esc(c.name[0])}</i>${esc(c.name)}<small>${esc(c.role||'')}</small></div>`).join('')||'<p style="color:var(--mu)">Ma’lumot yo‘q.</p>'}</div></section>
  ${i.type==='tv'?`<section class="wrap sec"><h2>Mavsumlar va qismlar</h2><div class="filters" style="margin-top:12px"><select id="ss" aria-label="Mavsum">${Array.from({length:i.seasons||1},(_,n)=>`<option value="${n+1}">${n+1}-mavsum</option>`).join('')}</select></div><div class="eps" id="eps"></div></section>`:''}
  <section class="wrap sec"><h2>Baholash va izohlar</h2><p>Reyting: <b>★ ${i.rating||'–'}</b>. Sizning bahoyingiz:</p><div class="stars" id="stars">${stars(k)}</div><textarea id="ct" maxlength="500" placeholder="Izoh yozing..." aria-label="Izoh"></textarea><button class="btn red" id="cb">Izoh qoldirish</button><div id="cl">${cmts(k)}</div></section>
  <section class="row wrap"><div class="rh"><h2>O‘xshash kinolar</h2></div><div class="strip">${(i.similar||[]).map(card).join('')||'<p style="color:var(--mu)">O‘xshash kino topilmadi.</p>'}</div></section>`;
  $('#stars').onclick=e=>{const n=+(e.target.dataset||{}).star;if(!n)return;const r=LS.get('kf_rate',{});r[k]=n;LS.set('kf_rate',r);$('#stars').innerHTML=stars(k);toast('Bahoyingiz saqlandi: '+n+'/5')};
  $('#cb').onclick=()=>{const v=$('#ct').value.trim();if(!v)return toast('Izoh bo‘sh');const c=LS.get('kf_cm',{}),u=user();(c[k]=c[k]||[]).unshift({u:u?u.name:'Mehmon',t:v,d:new Date().toLocaleDateString()});LS.set('kf_cm',c);$('#cl').innerHTML=cmts(k);$('#ct').value='';toast('Izoh qo‘shildi')};
  if(i.type==='tv'){const ss=$('#ss'),fe=async()=>{const el=$('#eps');el.innerHTML='<div class="sk" style="aspect-ratio:8/1"></div>';try{const e=await Api.season(i,ss.value);el.innerHTML=e.map(x=>`<a class="ep" href="watch.html?t=tv&id=${encodeURIComponent(i.id)}&s=${ss.value}&e=${x.n}">${x.n}. ${esc(x.title)}<small>${esc((x.overview||'').slice(0,140))}${x.runtime?' ('+x.runtime+' daq)':''}</small></a>`).join('')||'<p>Qismlar topilmadi.</p>'}catch(er){el.innerHTML=`<div class="err">${esc(er.message)}</div>`}};ss.onchange=fe;fe()}
 }catch(e){app().innerHTML=`<div class="wrap"><div class="err"><p>${esc(e.message)}</p><br><button class="btn red" onclick="location.reload()">Qayta urinish</button> <a class="btn" href="index.html">Bosh sahifa</a></div></div>`}}
// ---------- WATCH ----------
async function watch(){const t=q.get('t')||'movie',id=q.get('id'),s=+q.get('s')||1,e=+q.get('e')||1;
 try{const i=await Api.detail(t,id);REG[key(i)]=i;document.title=i.title+' – Tomosha | Kinoflix';const wl=safeUrl(i.watch),vl=safeUrl(i.video);const yt=(vl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/)||[])[1];
  let next='';if(i.type==='tv'){const eps=await Api.season(i,s).catch(()=>[]);if(eps.some(x=>x.n===e+1))next=`watch.html?t=tv&id=${encodeURIComponent(i.id)}&s=${s}&e=${e+1}`}
  app().innerHTML=`<section class="wrap"><div class="player">${yt?`<iframe src="https://www.youtube-nocookie.com/embed/${yt}" style="width:100%;height:100%;border:0" allow="encrypted-media;fullscreen" allowfullscreen title="${esc(i.title)}"></iframe>`:vl?`<video controls playsinline preload="metadata" src="${esc(vl)}"${i.poster?` poster="${esc(i.poster)}"`:''}></video>`:`<div class="ext"><h2>${esc(i.title)}</h2><p>Bu kino uchun Kinoflix serverida video yo‘q. Rasmiy va litsenziyalangan platformada tomosha qiling.</p>${wl?`<a class="btn red" href="${esc(wl)}" target="_blank" rel="noopener noreferrer">Rasmiy sahifada tomosha qilish</a>`:'<p>Rasmiy havola kiritilmagan.</p>'}</div>`}</div>
  ${vl&&!yt?'<p style="color:var(--mu);font-size:.85rem">Video: ruxsat etilgan (ochiq litsenziyali) manba. Pleyerda ovoz, to‘liq ekran va progress mavjud; subtitr faqat manba taqdim etsa chiqadi.</p>':''}
  <div class="acts" style="margin:14px 0"><a class="btn" href="${href(i)}">Batafsil</a><button class="btn" data-trailer="${esc(key(i))}">Treyler</button>${next?`<a class="btn red" href="${next}">Keyingi qism ›</a>`:''}</div>
  <h1 style="font-size:1.8rem">${esc(i.title)}${i.type==='tv'?`, ${s}-mavsum ${e}-qism`:''}</h1><div class="meta" style="margin-top:6px">${meta(i)}</div><p style="max-width:75ch">${esc(i.overview)}</p></section>
  <section class="row wrap"><div class="rh"><h2>O‘xshash kinolar</h2></div><div class="strip">${(i.similar||[]).map(card).join('')||'<p style="color:var(--mu)">Topilmadi.</p>'}</div></section>`}
 catch(er){app().innerHTML=`<div class="wrap"><div class="err"><p>${esc(er.message)}</p><br><button class="btn red" onclick="location.reload()">Qayta urinish</button></div></div>`}}
// ---------- SEARCH ----------
function searchPage(){app().innerHTML=`<section class="wrap"><h1 class="pt">Qidiruv</h1><div class="filters"><input type="search" id="qi" placeholder="Nom, aktyor yoki janr..." aria-label="Qidiruv" autofocus></div><div id="qr"></div></section>`;
 const qi=$('#qi'),qr=$('#qr');qi.value=q.get('q')||'';let tm;
 const run=async()=>{const v=qi.value.trim();history.replaceState(null,'','search.html'+(v?'?q='+encodeURIComponent(v):''));
  if(!v){qr.innerHTML=empty('Nimani qidiryapsiz?','Kino, serial, multfilm, aktyor yoki janr nomini yozing.');return}
  qr.innerHTML=`<div class="grid">${sk(6)}</div>`;
  try{const r=await Api.search(v),S=[['Filmlar',r.movies],['Multfilmlar',r.cartoons],['Seriallar',r.series],['Aktyor ishtirokidagi kinolar',r.actors]].filter(x=>x[1].length);
   qr.innerHTML=S.length?S.map(([n,a])=>`<h2 style="margin:24px 0 14px">${n}</h2><div class="grid">${a.map(card).join('')}</div>`).join(''):empty('Hech narsa topilmadi',`“${esc(v)}” bo‘yicha natija yo‘q. Imloni tekshiring yoki boshqa so‘z sinab ko‘ring.`)}
  catch(e){qr.innerHTML=`<div class="err"><p>${esc(e.message)}</p><br><button class="btn red" id="rt">Qayta urinish</button></div>`;$('#rt').onclick=run}};
 qi.oninput=()=>{clearTimeout(tm);tm=setTimeout(run,300)};run()}
// ---------- FAVORITES ----------
function favPage(){const draw=()=>{const f=favs();app().innerHTML=`<section class="wrap"><h1 class="pt">Saqlanganlar</h1><div class="grid">${f.length?f.map(card).join(''):empty('Saqlangan kino yo‘q','Kino kartasidagi ♥ tugmasini bosib, sevimlilaringizni shu yerga yig‘ing.','<br><a class="btn red" href="movies.html">Filmlarni ko‘rish</a>')}</div></section>`};
 draw();document.addEventListener('click',e=>{if(e.target.closest('[data-fav]'))setTimeout(draw,0)})}
// ---------- AUTH / PROFILE ----------
function authPage(mode){const reg=mode==='register';
 app().innerHTML=`<div class="auth"><h1>${reg?'Ro‘yxatdan o‘tish':'Tizimga kirish'}</h1><form class="f" id="af">${reg?'<label>Ism<input name="name" required maxlength="40" autocomplete="name"></label>':''}<label>Email<input type="email" name="email" required autocomplete="email"></label><label>Parol<input type="password" name="pw" required minlength="6" autocomplete="${reg?'new':'current'}-password"></label>${reg?'<label>Profil rasmi URL (ixtiyoriy)<input type="url" name="avatar" placeholder="https://..."></label>':''}<button class="btn red" style="justify-content:center">${reg?'Ro‘yxatdan o‘tish':'Kirish'}</button></form><button type="button" class="btn" id="gb" style="justify-content:center;width:100%;margin-top:10px">Mehmon sifatida kirish</button><p style="margin-top:16px;color:var(--mu)">${reg?'Akkauntingiz bormi? <a href="login.html"><u>Kirish</u></a>':'Akkaunt yo‘qmi? <a href="register.html"><u>Ro‘yxatdan o‘tish</u></a>'}</p></div>`;
 $('#gb').onclick=guestIn;
 $('#af').onsubmit=async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target)),email=f.email.trim().toLowerCase(),users=LS.get('kf_users',[]),h=await hash(f.pw);
  if(reg){if(users.some(u=>u.email===email))return toast('Bu email band');users.push({email,name:f.name.trim(),hash:h,avatar:safeUrl(f.avatar),role:users.length?'user':'admin',t:Date.now()});LS.set('kf_users',users)}
  else if(!users.some(u=>u.email===email&&u.hash===h))return toast('Email yoki parol noto‘g‘ri');
  LS.set('kf_session',email);toast(reg?'Xush kelibsiz!':'Tizimga kirdingiz');setTimeout(()=>location.href='profile.html',500)}}
function profile(){const u=user();if(!u){location.href='login.html';return}
 const f=favs();app().innerHTML=`<section class="wrap"><div class="prof"><div class="big">${u.avatar?`<img src="${esc(u.avatar)}" alt="Profil rasmi">`:esc(u.name[0].toUpperCase())}</div><div><h1>${esc(u.name)}</h1><p style="color:var(--mu)">${esc(u.email)}${isAdmin(u)?' (admin)':''}</p><div class="acts" style="margin-top:10px"><button class="btn" id="ed">Tahrirlash</button>${isAdmin(u)?'<a class="btn" href="admin.html">Admin panel</a>':''}<button class="btn red" id="lo">Chiqish</button></div></div></div><h2 style="margin:20px 0 14px">Saqlangan kinolar (${f.length})</h2><div class="grid">${f.length?f.map(card).join(''):empty('Hozircha bo‘sh','Kinolarni ♥ bilan saqlang.')}</div></section>`;
 $('#lo').onclick=leave;
 $('#ed').onclick=()=>modal(`<form class="f" id="ef" style="padding:16px"><label>Ism<input name="name" value="${esc(u.name)}" required maxlength="40"></label><label>Profil rasmi URL<input type="url" name="avatar" value="${esc(u.avatar)}"></label><button class="btn red" style="justify-content:center">Saqlash</button></form>`)||($('#ef').onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target)),us=LS.get('kf_users',[]),x=us.find(z=>z.email===u.email);x.name=d.name.trim();x.avatar=safeUrl(d.avatar);LS.set('kf_users',us);location.reload()})}
// ---------- ADMIN (demo, faqat brauzer) ----------
function admin(){const u=user();
 if(!isAdmin(u)){app().innerHTML=`<div class="wrap">${empty('Ruxsat yo‘q',u?`Siz (${esc(u.email)}) admin emassiz. Admin qilish uchun <b>js/config.js</b> dagi <b>ADMIN_EMAILS</b> ro‘yxatiga emailingizni yozing.`:'Admin panelga kirish uchun avval admin akkaunt bilan tizimga kiring.',u?'':'<br><a class="btn red" href="login.html">Kirish</a> <a class="btn" href="register.html">Ro‘yxatdan o‘tish</a>')}</div>`;return}
 const stats=()=>{const us=LS.get('kf_users',[]),gs=LS.get('kf_guests',[]),a=LS.get('kf_active',{}),n=Date.now(),on=Object.keys(a).filter(k=>n-a[k]<6e4),ou=on.filter(k=>us.some(x=>x.email===k)).length;
  return`<div class="stat"><small>Hozir saytda</small><b>${on.length}</b><small>${ou} a’zo, ${on.length-ou} mehmon</small></div><div class="stat"><small>Ro‘yxatdan o‘tganlar</small><b>${us.length}</b></div><div class="stat"><small>Mehmon sifatida kirganlar</small><b>${gs.length}</b><small>jami kirishlar</small></div><div class="stat"><small>Jami foydalanuvchilar</small><b>${us.length+gs.length}</b></div>`};
 const draw=()=>{const L=Api.all(),us=LS.get('kf_users',[]);app().innerHTML=`<section class="wrap"><h1 class="pt">Admin panel</h1><div class="stats" id="st">${stats()}</div><div class="note">Statistika faqat shu brauzer/qurilma bo‘yicha hisoblanadi; barcha qurilmalardagi umumiy sonni ko‘rish uchun server (backend) kerak. </div><div class="note">Diqqat: bu demo — ruxsat tekshiruvi brauzerda bajariladi va xavfsizlik hisoblanmaydi. Production’da server tomonidagi autentifikatsiya va rollar shart.</div><div class="acts"><button class="btn red" id="add">+ Kontent qo‘shish</button></div><div class="tw"><table><tr><th>Nomi</th><th>Tur</th><th>Yil</th><th>Reyting</th><th></th></tr>${L.map(i=>`<tr><td>${esc(i.title)}</td><td>${i.type==='tv'?'Serial':i.genres.includes(16)?'Multfilm':'Film'}</td><td>${esc(i.year)}</td><td>${i.rating}</td><td><button class="btn" data-e="${esc(i.id)}">Tahrirlash</button><button class="btn" data-d="${esc(i.id)}">O‘chirish</button></td></tr>`).join('')}</table></div><h2 style="margin:30px 0 6px">Ro‘yxatdan o‘tgan foydalanuvchilar</h2><div class="tw"><table><tr><th>Ism</th><th>Email</th><th>Rol</th><th>Sana</th></tr>${us.map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.email)}</td><td>${x.role==='admin'?'Admin':'Foydalanuvchi'}</td><td>${x.t?new Date(x.t).toLocaleDateString():'–'}</td></tr>`).join('')}</table></div></section>`;
  $('#add').onclick=()=>form(null);$$('[data-e]').forEach(b=>b.onclick=()=>form(L.find(i=>String(i.id)===b.dataset.e)));
  $$('[data-d]').forEach(b=>b.onclick=()=>{if(!confirm('O‘chirilsinmi?'))return;const id=b.dataset.d,c=LS.get('kf_custom',[]).filter(x=>x.id!==id);LS.set('kf_custom',c);LS.set('kf_hidden',[...LS.get('kf_hidden',[]),id]);toast('O‘chirildi');draw()})};
 const form=it=>{const v=it||{type:'movie',genres:[],cast:[],rating:7,runtime:100,year:new Date().getFullYear()},kind=v.type==='tv'?'tv':v.genres.includes(16)?'cartoon':'movie';
  modal(`<form class="f" id="mf" style="padding:16px;max-height:80vh;overflow:auto"><label>Nomi<input name="title" value="${esc(v.title)}" required></label><label>Tur<select name="kind">${[['movie','Film'],['cartoon','Multfilm'],['tv','Serial']].map(([a,b])=>`<option value="${a}"${a===kind?' selected':''}>${b}</option>`).join('')}</select></label><label>Yil<input name="year" type="number" min="1900" max="2100" value="${esc(v.year)}" required></label><label>Reyting (0–10)<input name="rating" type="number" step="0.1" min="0" max="10" value="${v.rating}"></label><label>Davomiyligi (daq)<input name="runtime" type="number" min="0" value="${v.runtime}"></label><label>Mavsumlar (serial)<input name="seasons" type="number" min="0" value="${v.seasons||0}"></label><div class="g">${Object.entries(G).map(([id,n])=>`<label><input type="checkbox" name="g" value="${id}"${v.genres.includes(+id)?' checked':''}>${n}</label>`).join('')}</div><label>Rejissyor<input name="director" value="${esc(v.director)}"></label><label>Aktyorlar (vergul bilan)<input name="cast" value="${esc((v.cast||[]).map(c=>c.name).join(', '))}"></label><label>Tavsif<textarea name="overview">${esc(v.overview)}</textarea></label><label>Poster URL<input type="url" name="poster" value="${esc(v.poster)}"></label><label>Banner URL<input type="url" name="backdrop" value="${esc(v.backdrop)}"></label><label>Treyler URL (YouTube)<input type="url" name="trailer" placeholder="https://www.youtube.com/watch?v=..."></label><label>Rasmiy tomosha havolasi<input type="url" name="watch" value="${esc(v.watch)}"></label><label>Video URL (mp4 yoki YouTube; faqat ruxsat etilgan kontent)<input type="url" name="video" value="${esc(v.video)}"></label><button class="btn red" style="justify-content:center">Saqlash</button></form>`);
  $('#mf').onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target),d=Object.fromEntries(fd),gs=fd.getAll('g').map(Number);
   if(d.kind==='cartoon'&&!gs.includes(16))gs.push(16);
   const m=(d.trailer.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)||[])[1]||(v.trailer||'');
   const n={...v,id:v.id||'c'+Date.now(),type:d.kind==='tv'?'tv':'movie',title:d.title.trim(),orig:v.orig||d.title.trim(),year:String(d.year),date:d.year+'-01-01',rating:+d.rating,runtime:+d.runtime,seasons:+d.seasons,epc:v.epc||8,genres:gs,director:d.director,cast:d.cast.split(',').map(s=>s.trim()).filter(Boolean).map(name=>({name})),overview:d.overview,poster:safeUrl(d.poster),backdrop:safeUrl(d.backdrop),trailer:m,watch:safeUrl(d.watch),video:safeUrl(d.video),pop:v.pop||500};
   const c=LS.get('kf_custom',[]).filter(x=>x.id!==n.id);c.push(n);LS.set('kf_custom',c);document.querySelector('.md').remove();toast('Saqlandi');draw()}};
 draw();setInterval(()=>{const e=$('#st');if(e)e.innerHTML=stats()},10000)}
// ---------- boot ----------
document.addEventListener('click',e=>{
 const f=e.target.closest('[data-fav]');if(f){e.preventDefault();const on=toggleFav(f.dataset.fav);if(f.classList.contains('fav-b'))f.textContent=on?'♥ Saqlangan':'♡ Saqlash';return}
 const t=e.target.closest('[data-trailer]');if(t){e.preventDefault();trailerById(t.dataset.trailer);return}
 const a=e.target.closest('a[href]');if(a&&!a.target&&a.origin===location.origin&&!e.metaKey&&!e.ctrlKey&&a.pathname!==location.pathname){e.preventDefault();document.body.classList.add('out');setTimeout(()=>location.href=a.href,180)}});
chrome();beat();setInterval(beat,20000);
({home,movies:()=>catalog('movie'),cartoons:()=>catalog('cartoon'),series:()=>catalog('tv'),details,watch,search:searchPage,favorites:favPage,login:()=>authPage('login'),register:()=>authPage('register'),profile,admin})[page]?.();
requestAnimationFrame(()=>document.body.classList.add('in'));
addEventListener('pageshow',e=>{if(e.persisted)document.body.classList.remove('out')});
})();
