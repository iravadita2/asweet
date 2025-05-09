
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container } from "@/components/ui/container";
import { ArrowLeft } from "lucide-react";
import { fetchCategories, CategoryDatabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

export function CategoryShowcase() {
  const [categories, setCategories] = useState<CategoryDatabase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <section className="py-12">
      <Container>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">تصفح حسب التصنيف</h2>
          <Link 
            to="/categories" 
            className="text-sm text-secondary flex items-center hover:underline"
          >
            عرض الكل
            <ArrowLeft className="mr-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {loading ? (
            // Loading skeletons
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden">
                <Skeleton className="h-full w-full" />
              </div>
            ))
          ) : (
            categories.map((category) => (
              <Link 
                key={category.id}
                to={`/categories?category=${category.name}`} 
                className="group"
              >
                <div className="aspect-square rounded-lg overflow-hidden relative">
                  <img 
                    src={category.image_url || `https://images.unsplash.com/photo-1519676867240-f03562e64548?q=80&w=400`} 
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <h3 className="text-white text-lg font-medium p-3 w-full text-center">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </Container>
    </section>
  );
}
