import type { Product, Review } from "@/lib/types";

const AUTHORS = [
  { en: "Noura Al-Saud", ar: "نورة آل سعود" },
  { en: "Fahad Al-Qahtani", ar: "فهد القحطاني" },
  { en: "Lina Hassan", ar: "لينا حسن" },
  { en: "Omar Al-Ghamdi", ar: "عمر الغامدي" },
  { en: "Sara Al-Otaibi", ar: "سارة العتيبي" },
  { en: "Yousef Khan", ar: "يوسف خان" },
];

const COMMENTS = [
  {
    titleEn: "Exactly as listed",
    titleAr: "مطابق للوصف",
    en: "Arrived sealed, boxed, and matching the SKU on the invoice from Jarir Store.",
    ar: "وصل مختوماً وبكرتونه، ومطابق لرمز المنتج في فاتورة متجر جرير.",
  },
  {
    titleEn: "Fast Riyadh delivery",
    titleAr: "توصيل سريع في الرياض",
    en: "Ordered after maghrib, had it the next afternoon. Packaging was careful.",
    ar: "طلبت بعد المغرب ووصل بعد ظهر اليوم التالي. التغليف مرتب.",
  },
  {
    titleEn: "Worth the extra",
    titleAr: "يستحق الزيادة",
    en: "Compared prices across town — this was the honest one, with a real warranty.",
    ar: "قارنت الأسعار في المدينة — هذا السعر الصريح مع ضمان حقيقي.",
  },
  {
    titleEn: "Gift-ready",
    titleAr: "جاهز للإهداء",
    en: "Asked for gift wrap at checkout. The team did it without fuss.",
    ar: "طلبت تغليف إهداء مع الطلب. الفريق أنجزه بهدوء.",
  },
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function reviewsFor(product: Product, count = 6): Review[] {
  const n = Math.min(count, Math.max(3, Math.min(8, product.reviewCount)));
  const out: Review[] = [];
  for (let i = 0; i < n; i++) {
    const h = hash(product.id + i);
    const author = AUTHORS[h % AUTHORS.length]!;
    const comment = COMMENTS[(h >> 3) % COMMENTS.length]!;
    const rating = Math.min(5, Math.max(3, Math.round(product.rating) - (h % 5 === 0 ? 1 : 0)));
    const day = 2 + (h % 26);
    out.push({
      id: `${product.id}-r${i}`,
      author: author.en,
      arabicAuthor: author.ar,
      rating,
      title: comment.titleEn,
      arabicTitle: comment.titleAr,
      comment: comment.en,
      arabicComment: comment.ar,
      date: `2026-08-${String(day).padStart(2, "0")}`,
      verified: h % 4 !== 0,
    });
  }
  return out;
}
