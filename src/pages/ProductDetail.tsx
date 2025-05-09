import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Star, Minus, Plus, ShoppingCart, ArrowLeft, Loader2, Trash2 } from "lucide-react";

import { useCartStore, useAuthStore, Product, ProductColor, ProductFilling } from "@/lib/store";
import { getProductById, addReview, deleteReview } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCartStore();
  const { isAuthenticated, user, isAdmin } = useAuthStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedFilling, setSelectedFilling] = useState<ProductFilling | undefined>();
  const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>();
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  
  const handleDeleteComment = async (commentId: string) => {
    try {
      if (!product) return;
      
      console.log("Attempting to delete comment:", commentId);
      console.log("Current user:", user);
      console.log("Is admin:", isUserAdmin);
      
      const success = await deleteReview(commentId, product.id);
      
      if (success) {
        setProduct(prev => {
          if (!prev) return null;
          
          const updatedReviews = prev.reviews.filter(review => review.id !== commentId);
          let newRating = 0;
          
          if (updatedReviews.length > 0) {
            const totalRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0);
            newRating = parseFloat((totalRating / updatedReviews.length).toFixed(1));
          }
          
          return {
            ...prev,
            rating: newRating,
            reviews: updatedReviews
          };
        });
        
        toast.success("تم حذف التعليق بنجاح");
      } else {
        throw new Error("Failed to delete comment");
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error("حدث خطأ أثناء حذف التعليق");
    }
  };
  
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const productData = await getProductById(id);
        
        if (productData) {
          setProduct(productData);
          
          if (productData.availableFillings?.length > 0) {
            setSelectedFilling(productData.availableFillings[0]);
          }
          
          if (productData.availableColors?.length > 0) {
            setSelectedColor(productData.availableColors[0]);
          }
        }
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [id]);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isAuthenticated || !user) {
        setIsUserAdmin(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          console.error("Error checking admin status:", error);
          setIsUserAdmin(false);
          return;
        }
        
        setIsUserAdmin(data?.role === 'admin');
        console.log("Admin status in ProductDetail:", { userId: user.id, isAdmin: data?.role === 'admin' });
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsUserAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, [user, isAuthenticated]);
  
  const handleIncreaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else {
      setQuantity(value);
    }
  };
  
  const handleAddToCart = () => {
    if (!product) return;
    
    addItem(product, quantity, selectedFilling, selectedColor);
    
    toast.success("تمت الإضافة إلى السلة");
  };
  
  const calculateTotalPrice = () => {
    if (!product) return 0;
    
    const basePrice = product.discountedPrice || product.price;
    return basePrice * quantity;
  };

  // Format date as dd/mm/yyyy
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Rating stars component for reviews display
  const RatingStars = ({ rating }: { rating: number }) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };
  
  // Interactive rating stars component for adding reviews
  const RatingSelector = ({ value, onChange }: { value: number, onChange: (rating: number) => void }) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => {
          const starValue = i + 1;
          return (
            <Star
              key={i}
              className={`h-6 w-6 cursor-pointer ${
                starValue <= value ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
              }`}
              onClick={() => onChange(starValue)}
            />
          );
        })}
      </div>
    );
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user || !product) {
      toast.error("يجب تسجيل الدخول لإضافة تقييم");
      return;
    }
    
    if (!reviewText.trim()) {
      toast.error("يرجى كتابة تقييمك");
      return;
    }
    
    setSubmittingReview(true);
    
    try {
      const newReview = await addReview(
        product.id,
        user.id,
        user.name || user.email,
        reviewRating,
        reviewText
      );
      
      if (newReview) {
        setProduct(prevProduct => {
          if (!prevProduct) return null;
          
          const totalRating = (prevProduct.rating * prevProduct.reviews.length) + reviewRating;
          const newRating = totalRating / (prevProduct.reviews.length + 1);
          
          return {
            ...prevProduct,
            rating: parseFloat(newRating.toFixed(1)),
            reviews: [...prevProduct.reviews, newReview]
          };
        });
        
        setReviewText("");
        toast.success("تم إضافة تقييمك بنجاح");
      } else {
        throw new Error("Failed to add review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("حدث خطأ أثناء إضافة التقييم");
    } finally {
      setSubmittingReview(false);
    }
  };
  
  if (loading) {
    return (
      <Container className="py-10">
        <div className="flex gap-8 flex-col md:flex-row">
          <Skeleton className="h-96 w-full md:w-1/2 rounded-lg" />
          <div className="w-full md:w-1/2 space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-12 w-full" />
            </div>
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </Container>
    );
  }
  
  if (!product) {
    return (
      <Container className="py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">المنتج غير موجود</h1>
          <Button asChild>
            <Link to="/categories">
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة للمنتجات
            </Link>
          </Button>
        </div>
      </Container>
    );
  }
  
  return (
    <Container className="py-10">
      <Button variant="outline" asChild className="mb-6">
        <Link to="/categories">
          <ArrowLeft className="ml-2 h-4 w-4" />
          العودة للمنتجات
        </Link>
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square overflow-hidden rounded-lg border">
            <img 
              src={product?.image} 
              alt={product?.name}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product?.name}</h1>
            <div className="flex items-center mt-2">
              <div className="flex items-center">
                <Star className="h-5 w-5 fill-current text-yellow-500 ml-1" />
                <span>{product?.rating}</span>
              </div>
              <span className="mx-2 text-muted-foreground">•</span>
              <Badge variant="outline">{product?.category}</Badge>
            </div>
          </div>
          
          <div className="text-lg">
            {product?.discountedPrice ? (
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl text-destructive">
                  {product.discountedPrice} د.ج
                </span>
                <span className="text-muted-foreground line-through">
                  {product.price} د.ج
                </span>
                <Badge variant="destructive" className="mr-2">
                  خصم {Math.round(((product.price - product.discountedPrice) / product.price) * 100)}%
                </Badge>
              </div>
            ) : (
              <span className="font-bold text-xl">
                {product?.price} د.ج
              </span>
            )}
          </div>
          
          <p className="text-muted-foreground">{product?.description}</p>
          
          <div>
            {product?.availableFillings && product.availableFillings.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">اختر الحشوة</label>
                <Select 
                  value={selectedFilling} 
                  onValueChange={(value) => setSelectedFilling(value as ProductFilling)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر الحشوة" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.availableFillings.map((filling) => (
                      <SelectItem key={filling} value={filling}>
                        {filling}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {product?.availableColors && product.availableColors.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">اختر اللون</label>
                <Select 
                  value={selectedColor} 
                  onValueChange={(value) => setSelectedColor(value as ProductColor)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر اللون" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.availableColors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div>
            <div className="flex items-center mb-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleDecreaseQuantity}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <Input 
                type="number" 
                value={quantity} 
                onChange={handleQuantityChange}
                className="w-16 text-center mx-2"
                min="1"
              />
              
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleIncreaseQuantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">الإجمالي:</span>
              <span className="text-xl font-bold">{calculateTotalPrice()} د.ج</span>
            </div>
            
            <Button onClick={handleAddToCart} size="lg" className="w-full">
              <ShoppingCart className="ml-2 h-5 w-5" />
              إضافة إلى السلة
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-12">
        <Tabs defaultValue="reviews">
          <TabsList>
            <TabsTrigger value="reviews">التقييمات ({product?.reviews.length || 0})</TabsTrigger>
            <TabsTrigger value="details">تفاصيل المنتج</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reviews" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium mb-4">تقييمات العملاء</h3>
                
                {product?.reviews && product.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {product.reviews.map((review) => (
                      <Card key={review.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base">{review.userName}</CardTitle>
                            <RatingStars rating={review.rating} />
                          </div>
                          <CardDescription>{formatDate(review.date)}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p>{review.comment}</p>
                        </CardContent>
                        {(isUserAdmin || (user && user.id === review.userId)) && (
                          <CardFooter>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive" 
                              onClick={() => handleDeleteComment(review.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              حذف
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">لا توجد تقييمات بعد. كن أول من يقيم هذا المنتج.</p>
                )}
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>أضف تقييمك</CardTitle>
                    <CardDescription>شاركنا رأيك في المنتج</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isAuthenticated ? (
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium">التقييم:</label>
                          <RatingSelector 
                            value={reviewRating} 
                            onChange={setReviewRating} 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-medium">تعليقك</label>
                          <Input
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="اكتب تقييمك هنا..."
                            required
                          />
                        </div>
                        
                        <Button type="submit" className="w-full" disabled={submittingReview}>
                          {submittingReview ? (
                            <>
                              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                              جاري الإرسال...
                            </>
                          ) : (
                            "إرسال التقييم"
                          )}
                        </Button>
                      </form>
                    ) : (
                      <div className="text-center py-4">
                        <p className="mb-4 text-muted-foreground">
                          يرجى تسجيل الدخول لإضافة تقييم
                        </p>
                        <Button asChild>
                          <Link to="/login">تسجيل الدخول</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="pt-4">
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">تفاصيل المنتج</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">الفئة</p>
                  <p>{product?.category}</p>
                </div>
                
                {product?.availableFillings && product.availableFillings.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">الحشوات المتاحة</p>
                    <div className="flex flex-wrap gap-2">
                      {product.availableFillings.map((filling) => (
                        <Badge key={filling} variant="outline">{filling}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {product?.availableColors && product.availableColors.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">الألوان المتاحة</p>
                    <div className="flex flex-wrap gap-2">
                      {product.availableColors.map((color) => (
                        <Badge key={color} variant="outline">{color}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">الوصف</p>
                <p>{product?.description}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
};

export default ProductDetail;
