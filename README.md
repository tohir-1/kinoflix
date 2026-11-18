# Kinoflix

Netflix uslubidagi kino platformasi (HTML + CSS + JS, build kerak emas). Anime bo'limi yo'q.

## Ishga tushirish
Brauzerda `index.html` ni ochish mumkin, lekin to'liq ishlashi uchun lokal server tavsiya etiladi:

    python3 -m http.server 8000   # so'ng http://localhost:8000

## Rejimlar
- **Demo (standart):** `js/config.js` da `TMDB_KEY` bo'sh. 21 ta demo kino/multfilm/serial. Demo posterlar o'rniga gradient ishlatiladi.
- **TMDB:** https://www.themoviedb.org/settings/api dan kalit oling va `TMDB_KEY` ga yozing. API ishlamasa sayt xabar beradi, qayta urinish tugmasi chiqadi va demo ma'lumotlarga o'tadi.
  Production'da kalitni frontendga qo'ymang: o'z backend proxy'ngizni yarating va `API_BASE` ni o'zgartiring.

## Qonuniylik
Kinoflix video fayllarni tarqatmaydi. Tomosha sahifasi faqat ruxsat etilgan namunaviy videoni (Big Buck Bunny, CC BY) o'ynatadi; qolganlari uchun rasmiy tomosha havolasiga yo'naltiradi (TMDB / JustWatch). Treylerlar YouTube orqali. TMDB attribution footerda bor.

## Demo cheklovlari (production uchun backend kerak)
- Ro'yxatdan o'tish, izoh, reyting va admin panel brauzer LocalStorage'ida ishlaydi. Parol hash qilinadi, lekin bu haqiqiy xavfsizlik emas.
- Birinchi ro'yxatdan o'tgan foydalanuvchi demo'da admin bo'ladi. Admin ruxsati server tomonida tekshirilishi shart.
- Admin o'zgarishlari faqat o'sha brauzerda ko'rinadi (demo rejimda). TMDB rejimida admin qo'shgan kontent ro'yxatlarda chiqmaydi, qidiruv va batafsil sahifada demo bilan birga ishlaydi.

## Struktura
`*.html` sahifalar (har biri `js/main.js` ichidagi mos funksiyani ishga tushiradi), `css/style.css` (barcha uslublar, responsive va reduced-motion bilan), `js/api.js` (TMDB + demo), `js/data.js`, `js/config.js`.
