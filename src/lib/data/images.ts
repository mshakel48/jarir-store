export const img = {
  heroSchool: "/images/heroes/school.jpg",
  heroLaptops: "/images/heroes/laptops.jpg",
  heroElectronics: "/images/heroes/electronics.jpg",
  heroBooks: "/images/heroes/books.jpg",
  heroGaming: "/images/heroes/gaming.jpg",
  heroTablets: "/images/heroes/tablets.jpg",
  catBooks: "/images/categories/books.jpg",
  catLaptops: "/images/categories/laptops.jpg",
  catTablets: "/images/categories/tablets.jpg",
  catMobiles: "/images/categories/mobiles.jpg",
  catHeadphones: "/images/categories/headphones.jpg",
  catWatches: "/images/categories/smartwatches.jpg",
  catGaming: "/images/categories/gaming.jpg",
  catOffice: "/images/categories/office.jpg",
  catSchool: "/images/categories/school.jpg",
  catAccessories: "/images/categories/accessories.jpg",
};

export function productImage(id: string) {
  return `/images/products/${id}.jpg`;
}

export const categoryShot: Record<string, string> = {
  books: img.catBooks,
  laptops: img.catLaptops,
  tablets: img.catTablets,
  mobiles: img.catMobiles,
  headphones: img.catHeadphones,
  smartwatches: img.catWatches,
  gaming: img.catGaming,
  office: img.catOffice,
  school: img.catSchool,
  accessories: img.catAccessories,
};
