import { img } from "@/lib/data/images";
import type { CategorySlug } from "@/lib/types";

export interface NavCategory {
  slug: CategorySlug;
  navKey: string;
  productCategories: CategorySlug[];
  image: string;
  descriptionEn: string;
  descriptionAr: string;
  subsEn: string[];
  subsAr: string[];
}

export const NAV_CATEGORIES: NavCategory[] = [
  {
    slug: "books",
    navKey: "nav.books",
    productCategories: ["books"],
    image: img.catBooks,
    descriptionEn: "Arabic and English titles, from novels to business and children’s books.",
    descriptionAr: "عناوين عربية وإنجليزية، من الروايات إلى كتب الأعمال وقصص الأطفال.",
    subsEn: ["Arabic novels", "Business", "Children", "Fiction"],
    subsAr: ["روايات عربية", "أعمال", "أطفال", "خيال"],
  },
  {
    slug: "electronics",
    navKey: "nav.electronics",
    productCategories: ["headphones", "smartwatches", "mobiles"],
    image: img.heroElectronics,
    descriptionEn: "Headphones, wearables and the latest phones from brands you trust.",
    descriptionAr: "سماعات وأجهزة قابلة للارتداء وأحدث الجوالات من علامات موثوقة.",
    subsEn: ["Headphones", "Smartwatches", "Mobiles"],
    subsAr: ["سماعات", "ساعات ذكية", "جوالات"],
  },
  {
    slug: "computers-tablets",
    navKey: "nav.computers",
    productCategories: ["laptops", "tablets"],
    image: img.catLaptops,
    descriptionEn: "MacBooks, Windows laptops, iPad and Android tablets.",
    descriptionAr: "أجهزة ماك بوك ولابتوب ويندوز وآيباد وأجهزة لوحية أندرويد.",
    subsEn: ["MacBook", "Windows", "iPad", "Android"],
    subsAr: ["ماك بوك", "ويندوز", "آيباد", "أندرويد"],
  },
  {
    slug: "mobiles",
    navKey: "nav.mobiles",
    productCategories: ["mobiles"],
    image: img.catMobiles,
    descriptionEn: "iPhone, Galaxy, Pixel and more — unlocked, with local warranty.",
    descriptionAr: "آيفون وجالاكسي وبكسل والمزيد — مفتوحة مع ضمان محلي.",
    subsEn: ["iPhone", "Android"],
    subsAr: ["آيفون", "أندرويد"],
  },
  {
    slug: "accessories",
    navKey: "nav.accessories",
    productCategories: ["accessories"],
    image: img.catAccessories,
    descriptionEn: "Chargers, hubs, sleeves and pencils that finish the setup.",
    descriptionAr: "شواحن ومحولات وأغطية وأقلام تُكمل جهازك.",
    subsEn: ["Power", "Hubs", "Cases", "Stylus"],
    subsAr: ["طاقة", "محولات", "أغطية", "قلم"],
  },
  {
    slug: "gaming",
    navKey: "nav.gaming",
    productCategories: ["gaming"],
    image: img.catGaming,
    descriptionEn: "Consoles, first-party games and official controllers.",
    descriptionAr: "أجهزة ألعاب وإصدارات رسمية وأذرع أصلية.",
    subsEn: ["Consoles", "Games", "Controllers"],
    subsAr: ["أجهزة", "ألعاب", "أذرع"],
  },
  {
    slug: "office",
    navKey: "nav.office",
    productCategories: ["office"],
    image: img.catOffice,
    descriptionEn: "Keyboards, mice, printers and pens for a quieter desk.",
    descriptionAr: "لوحات مفاتيح وفأرات وطابعات وأقلام لمكتب أهدأ.",
    subsEn: ["Keyboards", "Mice", "Printers", "Pens"],
    subsAr: ["لوحات مفاتيح", "فأرة", "طابعات", "أقلام"],
  },
  {
    slug: "school",
    navKey: "nav.school",
    productCategories: ["school"],
    image: img.catSchool,
    descriptionEn: "Bags, calculators and stationery for the school year.",
    descriptionAr: "حقائب وآلات حاسبة وقرطاسية للعام الدراسي.",
    subsEn: ["Bags", "Calculators", "Notebooks", "Stationery"],
    subsAr: ["حقائب", "آلات حاسبة", "دفاتر", "قرطاسية"],
  },
  {
    slug: "smart-devices",
    navKey: "nav.smart",
    productCategories: ["smartwatches", "tablets"],
    image: img.catWatches,
    descriptionEn: "Watches and tablets that stay with you from desk to door.",
    descriptionAr: "ساعات وأجهزة لوحية ترافقك من المكتب إلى الباب.",
    subsEn: ["Apple Watch", "Wear OS", "iPad"],
    subsAr: ["أبل واتش", "وير أو إس", "آيباد"],
  },
  {
    slug: "deals",
    navKey: "nav.deals",
    productCategories: [],
    image: img.heroElectronics,
    descriptionEn: "Limited-time prices across books, electronics and school.",
    descriptionAr: "أسعار محدودة على الكتب والإلكترونيات والمستلزمات المدرسية.",
    subsEn: ["Flash", "Clearance"],
    subsAr: ["عروض خاطفة", "تصفية"],
  },
];

export const HOME_CATEGORIES: { slug: CategorySlug; image: string; labelKey: string }[] = [
  { slug: "books", image: img.catBooks, labelKey: "nav.books" },
  { slug: "computers-tablets", image: img.catLaptops, labelKey: "nav.computers" },
  { slug: "mobiles", image: img.catMobiles, labelKey: "nav.mobiles" },
  { slug: "electronics", image: img.catHeadphones, labelKey: "nav.electronics" },
  { slug: "smart-devices", image: img.catWatches, labelKey: "nav.smart" },
  { slug: "gaming", image: img.catGaming, labelKey: "nav.gaming" },
  { slug: "office", image: img.catOffice, labelKey: "nav.office" },
  { slug: "school", image: img.catSchool, labelKey: "nav.school" },
  { slug: "accessories", image: img.catAccessories, labelKey: "nav.accessories" },
  { slug: "deals", image: img.heroElectronics, labelKey: "nav.deals" },
];

export type PillIcon =
  | "luggage"
  | "smartphone"
  | "laptop"
  | "tv"
  | "pencil"
  | "puzzle"
  | "folder"
  | "palette"
  | "book"
  | "library"
  | "headphones"
  | "gamepad";

export const ICON_PILLS: { id: string; labelKey: string; slug: CategorySlug; query?: string; icon: PillIcon; tint: string }[] = [
  { id: "bags", labelKey: "pills.bags", slug: "school", query: "حقيبة", icon: "luggage", tint: "bg-muted" },
  { id: "electronics", labelKey: "pills.electronics", slug: "mobiles", icon: "smartphone", tint: "bg-secondary" },
  { id: "computers", labelKey: "pills.computers", slug: "computers-tablets", icon: "laptop", tint: "bg-muted" },
  { id: "smart", labelKey: "pills.smart", slug: "smart-devices", icon: "tv", tint: "bg-muted" },
  { id: "school", labelKey: "pills.school", slug: "school", icon: "pencil", tint: "bg-secondary" },
  { id: "toys", labelKey: "pills.toys", slug: "books", query: "أطفال", icon: "puzzle", tint: "bg-secondary" },
  { id: "office", labelKey: "pills.office", slug: "office", icon: "folder", tint: "bg-secondary" },
  { id: "arts", labelKey: "pills.arts", slug: "office", query: "قلم", icon: "palette", tint: "bg-muted" },
  { id: "arBooks", labelKey: "pills.arBooks", slug: "books", query: "روايات", icon: "book", tint: "bg-muted" },
  { id: "enBooks", labelKey: "pills.enBooks", slug: "books", query: "English", icon: "library", tint: "bg-muted" },
  { id: "audio", labelKey: "pills.audio", slug: "electronics", icon: "headphones", tint: "bg-secondary" },
  { id: "gaming", labelKey: "pills.gaming", slug: "gaming", icon: "gamepad", tint: "bg-muted" },
];

export function getNavCategory(slug: string) {
  return NAV_CATEGORIES.find((c) => c.slug === slug);
}
