import { createClient } from '@supabase/supabase-js'
import { Product, ProductCategory, ProductFilling, ProductColor } from "./store";

// Use the Supabase client from the integrations folder which has proper configuration
import { supabase as configuredSupabase } from '@/integrations/supabase/client';

// Define default mock values for Supabase URL and key when they're not available
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if we have valid Supabase credentials
const hasValidSupabaseConfig = SUPABASE_URL && SUPABASE_ANON_KEY;

// Initialize Supabase client only if we have valid credentials
// We'll use the configured client from integrations folder which has the correct env variables
export const supabase = configuredSupabase;

// Database types and interfaces (keep these as they are useful for type checking)
export interface ProductDatabase {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  discounted_price?: number;
  image_url: string;
  created_at: string;
  available_fillings?: string[];
  available_colors?: string[];
  rating?: number;
}

export interface CategoryDatabase {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

export interface ReviewDatabase {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ProfileDatabase {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  created_at: string;
  role?: string;
}

export interface CartItemDatabase {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  filling?: string;
  color?: string;
  price: number;
  created_at: string;
}

// Mock data for when Supabase connection is not available
const mockCategories: CategoryDatabase[] = [
  { id: "1", name: "كيك", description: "كعكات طازجة ولذيذة", image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=400", created_at: new Date().toISOString() },
  { id: "2", name: "بقلاوة", description: "بقلاوة تقليدية", image_url: "https://images.unsplash.com/photo-1583743089695-4b816a340f82?q=80&w=400", created_at: new Date().toISOString() },
  { id: "3", name: "كنافة", description: "كنافة طازجة", image_url: "https://images.unsplash.com/photo-1593936661963-f95306f3db8d?q=80&w=400", created_at: new Date().toISOString() },
  { id: "4", name: "معمول", description: "معمول محشو بالتمر", image_url: "https://images.unsplash.com/photo-1593936661963-f95306f3db8d?q=80&w=400", created_at: new Date().toISOString() },
  { id: "5", name: "قطايف", description: "قطايف محشوة", image_url: "https://images.unsplash.com/photo-1583743089695-4b816a340f82?q=80&w=400", created_at: new Date().toISOString() },
  { id: "6", name: "حلويات مشكلة", description: "تشكيلة متنوعة", image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=400", created_at: new Date().toISOString() }
];

const mockProducts = [
  {
    id: "1",
    name: "كيك الشوكولاتة",
    description: "كيك بطبقات الشوكولاتة اللذيذة",
    category: "كيك",
    price: 65,
    discounted_price: 55,
    image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=400",
    created_at: new Date().toISOString(),
    available_fillings: ["شوكولاتة", "كريمة"],
    available_colors: [],
    rating: 4.8,
    reviews: []
  },
  {
    id: "2",
    name: "بقلاوة بالفستق",
    description: "بقلاوة �������قليدية محشوة بالفستق الحلبي",
    category: "بقلاوة",
    price: 45,
    image_url: "https://images.unsplash.com/photo-1583743089695-4b816a340f82?q=80&w=400",
    created_at: new Date().toISOString(),
    available_fillings: ["فستق"],
    available_colors: [],
    rating: 4.7,
    reviews: []
  },
  {
    id: "3",
    name: "كنافة بالجبنة",
    description: "كنافة طازجة محشوة بالجبنة الطرية",
    category: "كنافة",
    price: 40,
    discounted_price: 35,
    image_url: "https://images.unsplash.com/photo-1593936661963-f95306f3db8d?q=80&w=400",
    created_at: new Date().toISOString(),
    available_fillings: ["جبنة", "قشطة"],
    available_colors: [],
    rating: 4.9,
    reviews: []
  },
  {
    id: "4",
    name: "معمول بالتمر",
    description: "معمول تقليدي محشو بعجينة التمر الفاخرة",
    category: "معمول",
    price: 50,
    image_url: "https://images.unsplash.com/photo-1593936661963-f95306f3db8d?q=80&w=400",
    created_at: new Date().toISOString(),
    available_fillings: ["تمر", "جوز"],
    available_colors: [],
    rating: 4.6,
    reviews: []
  }
];

// Database helper functions that use real or mock data based on Supabase connection
export async function fetchCategories() {
  try {    
    const { data, error } = await supabase
      .from('categories')
      .select('*');
    
    if (error) {
      console.error('Error fetching categories:', error);
      return mockCategories; // Fallback to mock data on error
    }
    
    return data || mockCategories;
  } catch (err) {
    console.error('Error connecting to Supabase:', err);
    return mockCategories; // Fallback to mock data on error
  }
}

export async function fetchProducts(category?: string) {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        reviews (*)
      `);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching products:', error);
      return category 
        ? mockProducts.filter(p => p.category === category)
        : mockProducts;
    }
    
    return data || mockProducts;
  } catch (err) {
    console.error('Error connecting to Supabase:', err);
    return category 
      ? mockProducts.filter(p => p.category === category)
      : mockProducts;
  }
}

export async function fetchProductById(id: string) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        reviews (*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching product:', error);
      const mockProduct = mockProducts.find(p => p.id === id);
      if (!mockProduct) throw new Error('Product not found');
      return mockProduct;
    }
    
    // Ensure product rating is updated before returning
    if (data && data.reviews && data.reviews.length > 0) {
      const totalRating = data.reviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = totalRating / data.reviews.length;
      data.rating = parseFloat(avgRating.toFixed(1));
      
      // Update the product rating in the database if it doesn't match the calculated rating
      if (data.rating !== parseFloat(avgRating.toFixed(1))) {
        await updateProductRating(id);
      }
    }
    
    return data;
  } catch (err) {
    console.error('Error connecting to Supabase:', err);
    const mockProduct = mockProducts.find(p => p.id === id);
    if (!mockProduct) throw new Error('Product not found');
    return mockProduct;
  }
}

export async function searchProducts(query: string) {
  try {
    let queryBuilder = supabase
      .from('products')
      .select('*, reviews (*)');
    
    queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`);
    
    const { data, error } = await queryBuilder;
    
    if (error) {
      console.error('Error searching products:', error);
      return mockProducts.filter(p => 
        p.name.includes(query) || 
        p.description.includes(query) || 
        p.category.includes(query)
      );
    }
    
    return data || [];
  } catch (err) {
    console.error('Error connecting to Supabase:', err);
    return mockProducts.filter(p => 
      p.name.includes(query) || 
      p.description.includes(query) || 
      p.category.includes(query)
    );
  }
}

export async function createReview(review: Omit<ReviewDatabase, 'id' | 'created_at'>) {
  try {
    console.log("Creating review:", review);
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        ...review,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating review:', error);
      throw error;
    }
    
    console.log("Review created successfully:", data);
    return data;
  } catch (err) {
    console.error('Error connecting to Supabase:', err);
    throw err;
  }
}

// Authentication functions
export async function signUp(email: string, password: string, name: string) {
  try {
    console.log("Signing up with:", { email, name });
    
    // First create the auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        }
      }
    });
    
    if (error) {
      console.error('Error signing up:', error);
      throw error;
    }
    
    // Create user profile in profiles table
    if (data?.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        name: name,
      });
      
      if (profileError) {
        console.error('Error creating profile:', profileError);
        throw profileError;
      }
    }
    
    return data;
  } catch (err) {
    console.error('Error signing up:', err);
    throw err;
  }
}

export async function signIn(email: string, password: string) {
  try {
    console.log("Signing in with:", email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Error signing in:', error);
      throw error;
    }
    
    console.log("Sign in successful:", data);
    return data;
  } catch (err) {
    console.error('Error signing in:', err);
    throw err;
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  } catch (err) {
    console.error('Error signing out:', err);
    throw err;
  }
}

export async function getCurrentUser() {
  try {
    console.log("Getting current user...");
    
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    
    if (!data?.user) {
      console.log("No user found");
      return null;
    }
    
    console.log("User found:", data.user);
    
    // Get user profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError) {
      console.error('Error getting profile:', profileError);
    }
    
    // Fix for the role property not existing issue by adding explicit type checking
    // and providing a default role value
    return {
      id: data.user.id,
      email: data.user.email,
      name: profile?.name || data.user.user_metadata?.name || 'User',
      phone: profile?.phone,
      address: profile?.address,
      createdAt: profile?.created_at || data.user.created_at || new Date().toISOString(),
      role: (profile as any)?.role || 'user'  // Cast to any and provide default value
    };
  } catch (err) {
    console.error('Error getting current user:', err);
    return null;
  }
}

// Add role check function
export async function hasRole(role: 'admin' | 'user'): Promise<boolean> {
  try {
    console.log("Checking role:", role);
    
    const { data, error } = await supabase
      .rpc('has_role', { role_to_check: role });
    
    if (error) {
      console.error('Error checking role:', error);
      return false;
    }
    
    console.log("Role check result:", data);
    return data || false;
  } catch (err) {
    console.error('Error checking role:', err);
    return false;
  }
}

// Add function to calculate and update product rating
export async function updateProductRating(productId: string) {
  try {
    console.log("Updating rating for product:", productId);
    // First get all reviews for the product
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId);
    
    if (reviewsError) {
      console.error('Error fetching reviews for rating calculation:', reviewsError);
      return;
    }
    
    // Calculate average rating
    if (reviews && reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      console.log(`Calculated rating for product ${productId}: ${averageRating.toFixed(1)} from ${reviews.length} reviews`);
      
      // Update the product with the new average rating
      const { error: updateError } = await supabase
        .from('products')
        .update({ rating: parseFloat(averageRating.toFixed(1)) })
        .eq('id', productId);
      
      if (updateError) {
        console.error('Error updating product rating:', updateError);
      } else {
        console.log(`Successfully updated rating for product ${productId} to ${averageRating.toFixed(1)}`);
      }
    }
  } catch (err) {
    console.error('Error calculating product rating:', err);
  }
}
