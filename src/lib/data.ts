
import { Product, ProductCategory } from "./store";

export const products: Product[] = [
  {
    id: "product-1",
    name: "بقلاوة فستق",
    description: "بقلاوة تقليدية محشوة بالفستق الحلبي الفاخر",
    category: "بقلاوة",
    price: 120,
    image: "/products/baklava-pistachio.jpg",
    availableFillings: ["فستق", "لوز"],
    availableColors: ["ذهبي", "طبيعي"],
    rating: 4.8,
    reviews: [
      {
        id: "review-1",
        userId: "user-2",
        userName: "محمد أحمد",
        rating: 5,
        comment: "من أفضل ما تذوقت من البقلاوة، غنية بالفستق ولذيذة",
        date: "2023-12-10"
      }
    ]
  },
  {
    id: "product-2",
    name: "كنافة بالقشطة",
    description: "كنافة ناعمة محشوة بالقشطة الطازجة مع قطر الزهر",
    category: "كنافة",
    price: 95,
    image: "/products/kunafa-cream.jpg",
    availableFillings: ["قشطة", "جبنة"],
    availableColors: ["ذهبي", "أحمر"],
    rating: 4.6,
    reviews: [
      {
        id: "review-2",
        userId: "user-3",
        userName: "فاطمة محمود",
        rating: 5,
        comment: "كنافة رائعة، القشطة طازجة والطعم مميز",
        date: "2023-11-25"
      }
    ]
  },
  {
    id: "product-3",
    name: "قطايف بالمكسرات",
    description: "قطايف مقلية محشوة بمزيج من المكسرات المميزة",
    category: "قطايف",
    price: 80,
    image: "/products/qatayef.jpg",
    availableFillings: ["فستق", "لوز", "جوز"],
    availableColors: ["طبيعي"],
    rating: 4.7,
    reviews: []
  },
  {
    id: "product-4",
    name: "بسبوسة بالقشطة",
    description: "بسبوسة طرية بنكهة الزعفران محشوة بالقشطة الفاخرة",
    category: "بسبوسة",
    price: 70,
    discountedPrice: 65,
    image: "/products/basbousa.jpg",
    availableFillings: ["قشطة"],
    availableColors: ["ذهبي"],
    rating: 4.9,
    reviews: []
  },
  {
    id: "product-5",
    name: "معمول تمر",
    description: "معمول محشو بالتمر الفاخر والمطيب بماء الزهر",
    category: "معمول",
    price: 110,
    image: "/products/maamoul-dates.jpg",
    availableFillings: ["تمر", "فستق"],
    availableColors: ["أبيض", "طبيعي"],
    rating: 4.5,
    reviews: []
  },
  {
    id: "product-6",
    name: "حلاوة بالفستق",
    description: "حلاوة طحينية مع الفستق الحلبي الفاخر",
    category: "حلاوة",
    price: 85,
    image: "/products/halawa-pistachio.jpg",
    availableFillings: ["فستق", "شوكولاتة"],
    availableColors: ["أبيض", "أخضر"],
    rating: 4.4,
    reviews: []
  },
  {
    id: "product-7",
    name: "بقلاوة بالشوكولاتة",
    description: "بقلاوة مبتكرة محشوة بالشوكولاتة الغنية",
    category: "بقلاوة",
    price: 130,
    image: "/products/baklava-chocolate.jpg",
    availableFillings: ["شوكولاتة"],
    availableColors: ["ذهبي", "أبيض"],
    rating: 4.3,
    reviews: []
  },
  {
    id: "product-8",
    name: "كنافة بالمانجو",
    description: "كنافة ناعمة مع طبقة من المانجو الطازجة",
    category: "كنافة",
    price: 105,
    discountedPrice: 95,
    image: "/products/kunafa-mango.jpg",
    availableFillings: ["مانجو"],
    availableColors: ["ذهبي", "أصفر"],
    rating: 4.2,
    reviews: []
  },
  {
    id: "product-9",
    name: "معمول فستق",
    description: "معمول مميز محشو بالفستق الحلبي الفاخر",
    category: "معمول",
    price: 140,
    image: "/products/maamoul-pistachio.jpg",
    availableFillings: ["فستق"],
    availableColors: ["أبيض", "طبيعي"],
    rating: 4.9,
    reviews: []
  }
];

export const categories: ProductCategory[] = ["بقلاوة", "كنافة", "قطايف", "بسبوسة", "معمول", "حلاوة"];

// Placeholder images for products (we'll replace with actual images later)
export const placeholderImages = {
  "بقلاوة": "https://images.unsplash.com/photo-1519676867240-f03562e64548?q=80&w=400",
  "كنافة": "https://images.unsplash.com/photo-1579372786545-d24232daf58c?q=80&w=400",
  "قطايف": "https://images.unsplash.com/photo-1525203135335-74d272fc8d9c?q=80&w=400",
  "بسبوسة": "https://images.unsplash.com/photo-1516195851888-6f1a981a862e?q=80&w=400",
  "معمول": "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?q=80&w=400",
  "حلاوة": "https://images.unsplash.com/photo-1514517604298-cf80e0fb7f1e?q=80&w=400"
};

export function getProductImage(product: Product): string {
  return placeholderImages[product.category] || "https://images.unsplash.com/photo-1606914501449-5a96b6ce24ca?q=80&w=400";
}
