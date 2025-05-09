
import { Container } from "@/components/ui/container";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Star,
  Quote,
  Trash2
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Review } from "@/lib/store";
import { mapDatabaseReviewToReview } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { deleteReview } from "@/lib/api";

interface ReviewsProps {
  productId?: string;
  limit?: number;
  onDelete?: () => void;
}

export function Reviews({ productId, limit = 3, onDelete }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  
  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
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
        console.log("Admin status check:", { userId: user.id, isAdmin: data?.role === 'admin' });
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsUserAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, [user]);
  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (productId) {
          query = query.eq('product_id', productId);
        }
        
        if (limit) {
          query = query.limit(limit);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setReviews(data.map(mapDatabaseReviewToReview));
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [productId, limit]);

  const handleDeleteReview = async (reviewId: string, productId: string) => {
    try {
      const success = await deleteReview(reviewId, productId);
      
      if (success) {
        toast.success("تم حذف التقييم بنجاح");
        setReviews(reviews.filter(review => review.id !== reviewId));
        if (onDelete) onDelete();
      } else {
        toast.error("فشل في حذف التقييم");
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error("حدث خطأ أثناء محاولة حذف التقييم");
    }
  };

  // Format date as dd/mm/yyyy
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Rating stars component
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

  return (
    <section className="py-12">
      <Container>
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-2">آراء العملاء</Badge>
          <h2 className="text-3xl font-bold">ماذا يقول عملاؤنا</h2>
          <p className="text-muted-foreground mt-2">تجارب حقيقية من عملائنا الكرام</p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-background border rounded-lg p-6 shadow-sm animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-200 rounded-full mr-3"></div>
                    <div>
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      <div className="h-3 w-16 bg-gray-200 rounded mt-2"></div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 w-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="h-3 w-full bg-gray-200 rounded"></div>
                  <div className="h-3 w-5/6 bg-gray-200 rounded mt-2"></div>
                  <div className="h-3 w-4/6 bg-gray-200 rounded mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-background border rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 border mr-3">
                      <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{review.userName}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(review.date)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">عميل موثق</Badge>
                    {(isUserAdmin || (user && user.id === review.userId)) && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-red-500"
                        onClick={() => handleDeleteReview(review.id, productId || '')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <RatingStars rating={review.rating} />
                
                <div className="mt-4 relative">
                  <Quote className="absolute top-0 right-0 h-6 w-6 text-secondary/20 -translate-y-2 translate-x-2" />
                  <p className="text-muted-foreground pt-4 pr-4">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">لا توجد تقييمات حتى الآن</p>
          </div>
        )}
      </Container>
    </section>
  );
}
