
import { Hero } from "@/components/Hero";
import { CategoryShowcase } from "@/components/CategoryShowcase";
import { ProductGrid } from "@/components/ProductGrid";
import { Reviews } from "@/components/Reviews";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Product, ProductFilling, ProductColor } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log("Loading featured products...");
        // Fetch products and reviews in a single query
        const { data: productsData, error } = await supabase
          .from('products')
          .select(`
            *,
            reviews (*)
          `)
          .order('rating', { ascending: false })
          .limit(4);

        if (error) {
          console.error("Error fetching featured products:", error);
          throw error;
        }

        console.log("Raw products data:", productsData);

        // Map database products to frontend Product type
        const products: Product[] = productsData.map(dbProduct => {
          const reviews = dbProduct.reviews ? dbProduct.reviews.map((review: any) => ({
            id: review.id,
            userId: review.user_id,
            userName: review.user_name,
            rating: review.rating,
            comment: review.comment,
            date: new Date(review.created_at).toISOString().split('T')[0]
          })) : [];

          // Calculate average rating if there are reviews
          let calculatedRating = 0;
          if (reviews && reviews.length > 0) {
            const totalRating = reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
            calculatedRating = parseFloat((totalRating / reviews.length).toFixed(1));
          }
          
          // Use calculated rating if it's greater than 0, otherwise use the stored rating or default to 0
          const finalRating = calculatedRating > 0 ? calculatedRating : (dbProduct.rating || 0);

          // Properly cast string arrays to the expected enum types
          const availableFillings = dbProduct.available_fillings 
            ? dbProduct.available_fillings as ProductFilling[] 
            : [];
            
          const availableColors = dbProduct.available_colors 
            ? dbProduct.available_colors as ProductColor[] 
            : [];

          // Convert to frontend Product format with proper typing
          return {
            id: dbProduct.id,
            name: dbProduct.name,
            description: dbProduct.description || "",
            category: dbProduct.category as any,
            price: dbProduct.price,
            discountedPrice: dbProduct.discounted_price,
            image: dbProduct.image_url || "",
            availableFillings,
            availableColors,
            rating: finalRating,
            reviews: reviews
          };
        });

        console.log("Processed products:", products);
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <div>
      <Hero />
      
      <CategoryShowcase />
      
      {/* Featured Products */}
      <section className="py-12 bg-primary/20">
        <Container>
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-2">حصري</Badge>
            <h2 className="text-3xl font-bold">منتجات مميزة</h2>
            <p className="text-muted-foreground mt-2">اكتشف أفضل منتجاتنا المختارة يدوياً</p>
          </div>
          
          <ProductGrid products={featuredProducts} />
        </Container>
      </section>
      
      {/* Reviews Section */}
      <Reviews />
      
      {/* Features */}
      <section className="py-12 bg-muted">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-secondary">
                  <path d="M5 12s2.545-5 7-5c4.454 0 7 5 7 5s-2.546 5-7 5c-4.455 0-7-5-7-5Z" />
                  <path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
                  <path d="M21 17v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2" />
                  <path d="M21 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">مكونات عالية الجودة</h3>
              <p className="text-muted-foreground">نستخدم فقط أجود أنواع المكونات لنضمن مذاقاً فريداً</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-secondary">
                  <path d="m7.9 20 6.2-16" />
                  <path d="M4 20 20 4" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">خيارات مخصصة</h3>
              <p className="text-muted-foreground">اختر الحشوات والألوان لتخصيص طلبك</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-secondary">
                  <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">توصيل سريع</h3>
              <p className="text-muted-foreground">نضمن وصول طلبك طازجاً وفي الوقت المحدد</p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Index;
