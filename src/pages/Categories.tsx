
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Container } from "@/components/ui/container";
import { ProductGrid } from "@/components/ProductGrid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/api";
import { fetchCategories, CategoryDatabase } from "@/lib/supabase";
import { Product, ProductCategory } from "@/lib/store";
import { Skeleton } from "@/components/ui/skeleton";

const Categories = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get("category") as ProductCategory | null;
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryDatabase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load categories
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);
        
        // Load products based on selected category
        const productsData = await getProducts(currentCategory || undefined);
        setProducts(productsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentCategory]);

  const handleCategoryClick = (category: string | null) => {
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  return (
    <Container className="py-10">
      <h1 className="text-3xl font-bold mb-6">تصفح المنتجات</h1>
      
      {/* Category Filters */}
      <div className="mb-8 overflow-x-auto pb-4">
        <div className="flex gap-2 min-w-max">
          <Button 
            variant={!currentCategory ? "default" : "outline"}
            className="whitespace-nowrap"
            onClick={() => handleCategoryClick(null)}
          >
            جميع المنتجات
          </Button>
          
          {loading && !categories.length ? (
            // Loading skeletons for categories
            Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))
          ) : (
            categories.map((category) => (
              <Button
                key={category.id}
                variant={currentCategory === category.name ? "default" : "outline"}
                className="whitespace-nowrap"
                onClick={() => handleCategoryClick(category.name)}
              >
                {category.name}
              </Button>
            ))
          )}
        </div>
      </div>

      {/* Products Count */}
      <div className="mb-6">
        <p className="text-muted-foreground">
          عدد المنتجات: {loading ? "..." : products.length}
          {currentCategory && (
            <Badge variant="outline" className="mr-2">
              {currentCategory}
            </Badge>
          )}
        </p>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array(8).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">لم يتم العثور على منتجات</h2>
          <p className="text-muted-foreground">جرب تصفية أخرى أو تصفح جميع المنتجات</p>
        </div>
      )}
    </Container>
  );
};

export default Categories;
