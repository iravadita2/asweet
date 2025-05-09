
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Container } from "@/components/ui/container";
import { ProductGrid } from "@/components/ProductGrid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon } from "lucide-react";
import { searchProductsByQuery } from "@/lib/api";
import { Product } from "@/lib/store";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(query);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const searchProducts = async () => {
      if (!query) {
        setProducts([]);
        return;
      }
      
      setLoading(true);
      try {
        const results = await searchProductsByQuery(query);
        setProducts(results);
      } catch (error) {
        console.error("Error searching products:", error);
      } finally {
        setLoading(false);
      }
    };
    
    searchProducts();
  }, [query]);
    
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput });
    } else {
      setSearchParams({});
    }
  };

  return (
    <Container className="py-10">
      <h1 className="text-3xl font-bold mb-6">البحث</h1>
      
      <div className="max-w-2xl mx-auto mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="search"
            placeholder="ابحث عن منتج..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <SearchIcon className="ml-2 h-4 w-4" />
            بحث
          </Button>
        </form>
      </div>
      
      {query && (
        <div className="mb-6">
          <p className="text-muted-foreground">
            نتائج البحث عن "{query}": {loading ? "..." : products.length} منتج
          </p>
        </div>
      )}
      
      {query ? (
        loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">لم يتم العثور على منتجات</h2>
            <p className="text-muted-foreground">جرب كلمات بحث أخرى</p>
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">ابحث عن منتجاتك المفضلة</h2>
          <p className="text-muted-foreground">أدخل كلمة البحث في مربع البحث أعلاه</p>
        </div>
      )}
    </Container>
  );
};

export default Search;
