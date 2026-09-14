import { getNavCategory } from "@/lib/data/categories";
import { PRODUCTS } from "@/lib/data/products";
import type { CategorySlug, Product } from "@/lib/types";

export type SortKey = "relevance" | "popularity" | "newest" | "price-asc" | "price-desc" | "rating";

export interface CatalogQuery {
  q?: string;
  category?: string;
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  onSale?: boolean;
  sort?: SortKey;
}

export function productsForCategory(slug: string): Product[] {
  if (slug === "deals") return PRODUCTS.filter((p) => p.discount > 0);
  const nav = getNavCategory(slug);
  if (!nav) return PRODUCTS.filter((p) => p.category === slug);
  if (nav.productCategories.length === 0) return PRODUCTS.filter((p) => p.discount > 0);
  return PRODUCTS.filter((p) => nav.productCategories.includes(p.category));
}

export function searchProducts(query: CatalogQuery): Product[] {
  let list = PRODUCTS.slice();
  if (query.category) list = productsForCategory(query.category);
  const q = query.q?.trim().toLowerCase();
  if (q) {
    list = list
      .map((p) => ({ p, score: scoreProduct(p, q) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.p);
  }
  if (query.brand?.length) {
    const set = new Set(query.brand.map((b) => b.toLowerCase()));
    list = list.filter((p) => set.has(p.brand.toLowerCase()));
  }
  if (query.minPrice != null) list = list.filter((p) => p.price >= query.minPrice!);
  if (query.maxPrice != null) list = list.filter((p) => p.price <= query.maxPrice!);
  if (query.minRating) list = list.filter((p) => p.rating >= query.minRating!);
  if (query.inStock) list = list.filter((p) => p.stock > 0);
  if (query.onSale) list = list.filter((p) => p.discount > 0);
  return sortProducts(list, query.sort ?? (q ? "relevance" : "popularity"));
}

function scoreProduct(p: Product, q: string) {
  const hay = `${p.name} ${p.arabicName} ${p.brand} ${p.arabicBrand} ${p.sku} ${p.category} ${p.description} ${p.arabicDescription}`.toLowerCase();
  if (hay.includes(q)) {
    if (p.name.toLowerCase() === q || p.arabicName === q) return 100;
    if (p.name.toLowerCase().startsWith(q) || p.arabicName.startsWith(q)) return 80;
    if (p.brand.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) return 60;
    return 40;
  }
  const parts = q.split(/\s+/);
  return parts.every((part) => hay.includes(part)) ? 20 : 0;
}

export function sortProducts(list: Product[], sort: SortKey) {
  const copy = list.slice();
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    case "newest":
      return copy.sort((a, b) => Number(!!b.newArrival) - Number(!!a.newArrival));
    case "popularity":
      return copy.sort((a, b) => b.reviewCount - a.reviewCount);
    default:
      return copy;
  }
}

export function uniqueBrands(list: Product[]) {
  return [...new Set(list.map((p) => p.brand))].sort();
}

export function uniqueBrandPairs() {
  const map = new Map<string, string>();
  for (const p of PRODUCTS) map.set(p.brand, p.arabicBrand);
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

export function relatedProducts(product: Product, limit = 8) {
  return PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category).slice(0, limit);
}

export function boughtTogether(product: Product) {
  const same = relatedProducts(product, 4);
  const extras = PRODUCTS.filter((p) => p.id !== product.id && p.category !== product.category && (p.bestSeller || p.featured));
  return [...same.slice(0, 2), ...extras.slice(0, 1)].slice(0, 2);
}

export function flashDeals() {
  return PRODUCTS.filter((p) => p.discount >= 10)
    .sort((a, b) => Number(!!b.dealEndsAt) - Number(!!a.dealEndsAt) || b.discount - a.discount)
    .slice(0, 10);
}

export function featuredProducts() {
  return PRODUCTS.filter((p) => p.featured);
}

export function bestSellers() {
  return PRODUCTS.filter((p) => p.bestSeller);
}

export function newArrivals() {
  return PRODUCTS.filter((p) => p.newArrival);
}

export function categoryOf(p: Product): CategorySlug {
  return p.category;
}
