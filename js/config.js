// TMDB kalitini shu yerga qo'ying (https://www.themoviedb.org/settings/api).
// Kalitni saytning o'zida ham kiritish mumkin (bosh sahifadagi tugma, brauzerda saqlanadi).
// Bo'sh qoldirilsa sayt demo ma'lumotlar bilan ishlaydi.
// PRODUCTION: kalitni frontendda saqlamang, API_BASE ni o'z backend proxy manzilingizga o'zgartiring.
// Admin bo'ladigan emaillar (demo). Shu emailda ro'yxatdan o'tsangiz yoki kirsangiz, KINOFLIX logotipi admin panelni ochadi.
window.KF={ADMIN_EMAILS:['sizning@emailingiz.com'],TMDB_KEY:(()=>{try{return localStorage.getItem('kf_tmdb_key')||''}catch{return''}})(),API_BASE:'https://api.themoviedb.org/3',IMG:'https://image.tmdb.org/t/p/',LANG:'en-US',
SAMPLE_VIDEO:'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'};
