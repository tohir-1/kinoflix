// TMDB + demo ma'lumotlar qatlami. Natija har doim bir xil formatga keltiriladi.
(()=>{
const G={28:'Jangari',35:'Komediya',18:'Drama',878:'Fantastika',12:'Sarguzasht',27:"Qo'rqinchli",10749:'Romantika',53:'Triller',10751:'Oilaviy',16:'Animatsiya',9648:'Detektiv',36:'Tarixiy'};
const alias={10759:28,10765:878,10768:36},tvG={28:10759,12:10759,878:10765};
const live=()=>!!KF.TMDB_KEY,PER=12;
const LS=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const all=()=>{const c=LS('kf_custom',[]),h=LS('kf_hidden',[]),ids=new Set(c.map(x=>x.id));return DEMO.filter(d=>!ids.has(d.id)).concat(c).filter(i=>!h.includes(i.id))};
const norm=(r,type)=>{type=(r.media_type==='tv'||r.media_type==='movie')?r.media_type:type;
 const gs=(r.genres?r.genres.map(g=>g.id):r.genre_ids||[]).map(g=>alias[g]||g);
 return{id:r.id,type,title:r.title||r.name||'',orig:r.original_title||r.original_name||'',year:(r.release_date||r.first_air_date||'').slice(0,4),rating:+(r.vote_average||0).toFixed(1),genres:[...new Set(gs)].filter(g=>G[g]),overview:r.overview||'',poster:r.poster_path?KF.IMG+'w342'+r.poster_path:'',backdrop:r.backdrop_path?KF.IMG+'w1280'+r.backdrop_path:'',runtime:r.runtime||(r.episode_run_time||[])[0]||0,seasons:r.number_of_seasons||0,date:r.release_date||r.first_air_date||''}};
async function get(path,p={}){const u=new URL(KF.API_BASE+path);u.searchParams.set('api_key',KF.TMDB_KEY);u.searchParams.set('language',KF.LANG);
 for(const k in p)if(p[k]!==''&&p[k]!=null)u.searchParams.set(k,p[k]);
 const r=await fetch(u);if(!r.ok)throw new Error('API xatosi '+r.status);return r.json()}
function demoList({type,cartoon,genre,year,sort='popularity',q,page=1}){
 let a=all().filter(i=>cartoon?i.genres.includes(16):type==='tv'?i.type==='tv':i.type==='movie'&&!i.genres.includes(16));
 if(genre)a=a.filter(i=>i.genres.includes(+genre));if(year)a=a.filter(i=>i.year===String(year));
 if(q){const s=q.toLowerCase();a=a.filter(i=>(i.title+' '+i.orig).toLowerCase().includes(s))}
 const by={popularity:(x,y)=>y.pop-x.pop,rating:(x,y)=>y.rating-x.rating,new:(x,y)=>String(y.date).localeCompare(String(x.date))};
 a.sort(by[sort]);return{items:a.slice(0,page*PER).slice((page-1)*PER),pages:Math.max(1,Math.ceil(a.length/PER))}}
const today=new Date().toISOString().slice(0,10);
const Api={G,live,all,
async list(o){if(!live())return demoList(o);
 try{const{type,cartoon,genre,year,sort='popularity',q,page=1}=o,t=cartoon?'movie':type;let d;
  if(q)d=await get('/search/'+t,{query:q,page,[t==='tv'?'first_air_date_year':'year']:year});
  else{const sb={popularity:'popularity.desc',rating:'vote_average.desc',new:(t==='tv'?'first_air_date':'primary_release_date')+'.desc'}[sort];
   const g=t==='tv'&&genre?tvG[genre]||genre:genre;
   const p={sort_by:sb,page,with_genres:cartoon?(g?'16,'+g:'16'):g,without_genres:!cartoon&&t==='movie'?16:'','vote_count.gte':sort==='rating'?300:'',[t==='tv'?'first_air_date_year':'primary_release_year']:year};
   if(sort==='new')p[(t==='tv'?'first_air_date':'primary_release_date')+'.lte']=today;d=await get('/discover/'+t,p)}
  let items=d.results.map(r=>norm(r,t));
  if(q&&cartoon)items=items.filter(i=>i.genres.includes(16));if(q&&!cartoon&&t==='movie')items=items.filter(i=>!i.genres.includes(16));
  return{items,pages:Math.min(d.total_pages||1,500)}
 }catch(e){Api.fallback=true;console.warn('TMDB ishlamadi, demo ma\'lumotlar:',e.message);return demoList(o)}},
async upcoming(){if(!live())return demoList({type:'movie',sort:'new'}).items;return(await get('/movie/upcoming')).results.map(r=>norm(r,'movie'))},
async detail(type,id){
 const local=all().find(x=>x.type===type&&String(x.id)===String(id));
 if(local||!live()){if(!local)throw new Error('Kino topilmadi');return{...local,similar:all().filter(x=>x.type===local.type&&x.id!==local.id&&x.genres.some(g=>local.genres.includes(g))).slice(0,6)}}
 const d=await get(`/${type}/${id}`,{append_to_response:'credits,videos,similar'}),i=norm(d,type);
 i.cast=d.credits.cast.slice(0,12).map(c=>({name:c.name,role:c.character,photo:c.profile_path?KF.IMG+'w185'+c.profile_path:''}));
 i.director=(d.credits.crew.find(c=>c.job==='Director')||{}).name||(d.created_by||[]).map(c=>c.name).join(', ');
 const v=d.videos.results.find(v=>v.site==='YouTube'&&v.type==='Trailer')||d.videos.results.find(v=>v.site==='YouTube');i.trailer=v?v.key:'';
 i.similar=d.similar.results.slice(0,6).map(r=>norm(r,type));i.watch=`https://www.themoviedb.org/${type}/${id}/watch`;i.video='';i.epc=0;return i},
async season(i,n){if(!live()||String(i.id)[0]==='d'||String(i.id)[0]==='c')return Array.from({length:i.epc||8},(_,k)=>({n:k+1,title:(k+1)+'-qism',overview:i.overview}));
 const d=await get(`/tv/${i.id}/season/${n}`);return d.episodes.map(e=>({n:e.episode_number,title:e.name,overview:e.overview,runtime:e.runtime}))},
async search(q){const s=q.toLowerCase(),out={movies:[],cartoons:[],series:[],actors:[]};
 const put=a=>a.forEach(i=>{(i.type==='tv'?out.series:i.genres.includes(16)?out.cartoons:out.movies).push(i)});
 if(!live()||Api.fallback){const m=all().filter(i=>(i.title+i.orig).toLowerCase().includes(s)||i.genres.some(g=>G[g].toLowerCase().includes(s)));put(m);
  out.actors=all().filter(i=>i.cast.some(c=>c.name.toLowerCase().includes(s))&&!m.includes(i));return out}
 const[a,b,c]=await Promise.all([get('/search/movie',{query:q}),get('/search/tv',{query:q}),get('/search/person',{query:q})]);
 put(a.results.map(r=>norm(r,'movie')));put(b.results.map(r=>norm(r,'tv')));
 out.actors=c.results.slice(0,3).flatMap(p=>(p.known_for||[]).map(r=>norm(r,r.media_type||'movie')));return out}};
window.Api=Api})();
