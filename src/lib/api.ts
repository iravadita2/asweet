import { 
  fetchProducts, 
  fetchProductById, 
  searchProducts,
  ProductDatabase,
  ReviewDatabase,
  createReview,
  updateProductRating,
  supabase
} from "./supabase";
import { Product, ProductCategory, ProductFilling, ProductColor, Review } from "./store";

// Convert database product to frontend product
export function mapDatabaseProductToProduct(dbProduct: ProductDatabase): Product {
  // Safe check for reviews - it might not exist in some database queries
  const reviews = Array.isArray((dbProduct as any).reviews) 
    ? (dbProduct as any).reviews.map(mapDatabaseReviewToReview) 
    : [];

  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description,
    category: dbProduct.category as ProductCategory,
    price: dbProduct.price,
    discountedPrice: dbProduct.discounted_price,
    image: dbProduct.image_url,
    availableFillings: dbProduct.available_fillings as ProductFilling[] || [],
    availableColors: dbProduct.available_colors as ProductColor[] || [],
    rating: dbProduct.rating || 0,
    reviews: reviews,
  };
}

// Convert database review to frontend review
export function mapDatabaseReviewToReview(dbReview: ReviewDatabase): Review {
  return {
    id: dbReview.id,
    userId: dbReview.user_id,
    userName: dbReview.user_name,
    rating: dbReview.rating,
    comment: dbReview.comment,
    date: new Date(dbReview.created_at).toISOString().split('T')[0]
  };
}

// API functions to be used in components
export async function getProducts(category?: string): Promise<Product[]> {
  const dbProducts = await fetchProducts(category);
  return dbProducts.map(mapDatabaseProductToProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const dbProduct = await fetchProductById(id);
    
    if (!dbProduct) {
      return null;
    }
    
    return mapDatabaseProductToProduct(dbProduct);
  } catch (error) {
    console.error('Error getting product by ID:', error);
    return null;
  }
}

export async function searchProductsByQuery(query: string): Promise<Product[]> {
  const dbProducts = await searchProducts(query);
  return dbProducts.map(mapDatabaseProductToProduct);
}

// Add review to product
export async function addReview(productId: string, userId: string, userName: string, rating: number, comment: string): Promise<Review | null> {
  try {
    const review = await createReview({
      product_id: productId,
      user_id: userId,
      user_name: userName,
      rating,
      comment
    });
    
    // Update product rating
    await updateProductRating(productId);
    
    return mapDatabaseReviewToReview(review);
  } catch (error) {
    console.error('Error adding review:', error);
    return null;
  }
}

// Delete order by ID
export async function deleteOrder(orderId: string): Promise<boolean> {
  try {
    // First delete related order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId);
    
    if (itemsError) throw itemsError;
    
    // Then delete the order
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting order:', error);
    return false;
  }
}

// Delete review by ID
export const deleteReview = async (reviewId: string, productId: string): Promise<boolean> => {
  try {
    console.log(`Attempting to delete review: ${reviewId} for product: ${productId}`);
    
    // Get the current session to verify we're authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    console.log("Current session:", sessionData);
    
    // Delete the review
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);
    
    if (error) {
      console.error("Error deleting review:", error);
      return false;
    }

    // Update product rating after review deletion
    if (productId) {
      // Get remaining reviews for this product
      const { data: remainingReviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId);
      
      // Calculate new average rating
      let newRating = 0;
      if (remainingReviews && remainingReviews.length > 0) {
        const total = remainingReviews.reduce((sum, review) => sum + review.rating, 0);
        newRating = parseFloat((total / remainingReviews.length).toFixed(1));
      }
      
      // Update product rating
      const { error: updateError } = await supabase
        .from('products')
        .update({ rating: newRating })
        .eq('id', productId);
      
      if (updateError) {
        console.error("Error updating product rating:", updateError);
      }
    }
    
    console.log("Review deleted successfully");
    return true;
  } catch (error) {
    console.error("Error in deleteReview function:", error);
    return false;
  }
};
