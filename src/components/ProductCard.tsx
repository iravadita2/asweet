
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/store";
import { getProductImage } from "@/lib/data";
import { ShoppingCart, Star } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { id, name, price, discountedPrice, rating, category } = product;
  
  const hasDiscount = discountedPrice !== undefined;
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <Link to={`/product/${id}`}>
        <div className="aspect-square overflow-hidden relative">
          <img 
            src={product?.image} 
            alt={name}
            className="object-cover w-full h-full transition-transform hover:scale-105"
          />
        
          <Badge className="absolute top-2 right-2 bg-secondary text-white" variant="outline">
            {category}
          </Badge>
        </div>
      </Link>
      
      <CardContent className="p-4">
        <Link to={`/product/${id}`}>
          <h3 className="text-lg font-medium line-clamp-1">{name}</h3>
        </Link>
        
        <div className="flex items-center mt-1">
          <Star className="h-4 w-4 fill-current text-yellow-500 ml-1" />
          <span className="text-sm">{rating?.toFixed(1) || "0.0"}</span>
        </div>
        
        <div className="mt-2">
          {hasDiscount ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium text-destructive">
                {price} د.ج
              </span>
             
            </div>
          ) : (
            <span className="text-lg font-medium">
              {price} د.ج
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" asChild>
          <Link to={`/product/${id}`}>
            <ShoppingCart className="ml-2 h-4 w-4" />
            عرض المنتج
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
