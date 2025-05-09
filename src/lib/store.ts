import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Type Definitions
export type ProductCategory = "بقلاوة" | "كنافة" | "قطايف" | "بسبوسة" | "معمول" | "حلاوة" | "كيك";
export type ProductFilling = "فستق" | "لوز" | "جوز" | "قشطة" | "جبنة" | "شوكولاتة" | "تمر" | "مانجو";
export type ProductColor = "ذهبي" | "طبيعي" | "أحمر" | "أبيض" | "أخضر" | "أصفر";
export type PaymentMethod = "cash" | "online";

export interface CartItem {
  id: string;
  productId: string;
  productName: string; // Added field
  quantity: number;
  filling?: ProductFilling;
  color?: ProductColor;
  price: number;
  userId: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  role?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  discountedPrice?: number;
  image: string;
  availableFillings: ProductFilling[];
  availableColors: ProductColor[];
  rating: number;
  reviews: Review[];
}

export interface DeliveryInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
}

// Authentication Store
interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  checkAdminStatus: (userId: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isAdmin: false,
  user: null,
  isLoading: true,
  
  checkAdminStatus: async (userId: string) => {
    try {
      console.log("Checking admin status for user:", userId);
      
      // Check admin role in the database
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
      
      const isAdmin = data?.role === 'admin';
      console.log("Admin status result:", { isAdmin, data });
      
      // Update the store state
      set({ isAdmin });
      
      return isAdmin;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  },
  
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    if (data.user) {
      // Fetch user profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      // Fetch user roles
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      const isAdmin = roleData?.role === 'admin';
      
      console.log("Login successful - User data:", {
        profileData,
        roleData,
        isAdmin
      });
      
      set({
        isAuthenticated: true,
        isAdmin,
        user: {
          id: data.user.id,
          email: data.user.email || '',
          name: profileData?.name,
          phone: profileData?.phone,
          address: profileData?.address,
          role: roleData?.role,
        },
      });
    }
  },
  
  register: async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    
    if (error) throw error;
    
    // Auto-login after registration
    if (data.user) {
      set({
        isAuthenticated: true,
        isAdmin: false,
        user: {
          id: data.user.id,
          email: data.user.email || '',
          name,
        },
      });
    }
  },
  
  logout: async () => {
    try {
      // First reset the state before calling the API to avoid session not found errors
      set({
        isAuthenticated: false,
        isAdmin: false,
        user: null,
      });
      
      // Then attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Supabase signout error:", error);
        // Already reset the state above, so we don't throw here
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Already reset the state above
    }
  },
  
  checkAuth: async () => {
    set({ isLoading: true });
    
    try {
      console.log("Checking auth status...");
      const { data } = await supabase.auth.getSession();
      
      if (data.session?.user) {
        console.log("Session found:", data.session.user);
        
        // Fetch user profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        console.log("Profile data:", profileData);

        // Fetch user roles
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.session.user.id)
          .single();

        console.log("Role data:", roleData);

        const isAdmin = roleData?.role === 'admin';
        console.log("Is admin:", isAdmin);
        
        set({
          isAuthenticated: true,
          isAdmin,
          user: {
            id: data.session.user.id,
            email: data.session.user.email || '',
            name: profileData?.name,
            phone: profileData?.phone,
            address: profileData?.address,
            role: roleData?.role,
          },
        });
      } else {
        console.log("No session found");
        set({
          isAuthenticated: false,
          isAdmin: false,
          user: null,
        });
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      set({
        isAuthenticated: false,
        isAdmin: false,
        user: null,
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));

// Cart Store
interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity: number, filling?: ProductFilling, color?: ProductColor) => void;
  updateItem: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotalPrice: () => number;
  getDiscountedTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  
  addItem: (product, quantity, filling, color) => {
    set((state) => {
      // Check if the product already exists in the cart
      const existingItemIndex = state.items.findIndex(
        (item) => 
          item.productId === product.id &&
          item.filling === filling &&
          item.color === color
      );
      
      if (existingItemIndex !== -1) {
        // Update the existing item
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += quantity;
        
        return { items: updatedItems };
      }
      
      // Add new item
      const userId = useAuthStore.getState().user?.id || 'anonymous';
      
      const newItem: CartItem = {
        id: crypto.randomUUID(),
        productId: product.id,
        productName: product.name,
        quantity,
        filling,
        color,
        price: product.discountedPrice || product.price,
        userId,
        createdAt: new Date().toISOString(),
      };
      
      return { items: [...state.items, newItem] };
    });
  },
  
  updateItem: (productId, quantity) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      ),
    }));
  },
  
  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.productId !== productId),
    }));
  },
  
  clearCart: () => {
    set({ items: [] });
  },
  
  getItemCount: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },
  
  getTotalPrice: () => {
    return get().items.reduce((total, item) => 
      total + (item.price * item.quantity), 0);
  },
  
  getDiscountedTotal: () => {
    // In this case, the price is already the discounted price (if available)
    return get().getTotalPrice();
  },
}));

// Checkout Store
interface CheckoutState {
  deliveryInfo: DeliveryInfo | null;
  paymentMethod: PaymentMethod | null;
  setDeliveryInfo: (info: DeliveryInfo) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  placeOrder: () => Promise<string>;
}

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  deliveryInfo: null,
  paymentMethod: null,
  
  setDeliveryInfo: (info) => {
    set({ deliveryInfo: info });
  },
  
  setPaymentMethod: (method) => {
    set({ paymentMethod: method });
  },
  
  placeOrder: async () => {
    const { deliveryInfo, paymentMethod } = get();
    const { items, clearCart } = useCartStore.getState();
    const { user } = useAuthStore.getState();
    
    if (!deliveryInfo || !paymentMethod) {
      throw new Error("Missing required information to place order");
    }
    
    try {
      console.log("Placing order with items:", items);
      console.log("User:", user);
      console.log("Delivery info:", deliveryInfo);
      console.log("Payment method:", paymentMethod);
      
      // Calculate the total amount
      const totalAmount = items.reduce((total, item) => 
        total + (item.price * item.quantity), 0);
      
      // Add shipping if total is less than 500
      const finalTotal = totalAmount < 500 ? totalAmount + 30 : totalAmount;
      
      console.log("Final total:", finalTotal);
      
      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || 'anonymous',
          total: finalTotal,
          status: 'pending',
          payment_method: paymentMethod,
          delivery_name: deliveryInfo.name,
          delivery_phone: deliveryInfo.phone,
          delivery_address: deliveryInfo.address,
          delivery_city: deliveryInfo.city,
          delivery_notes: deliveryInfo.notes || null
        })
        .select()
        .single();
      
      if (orderError) {
        console.error("Error creating order:", orderError);
        throw orderError;
      }
      
      console.log("Order created:", order);
      
      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        filling: item.filling || null,
        color: item.color || null,
        price: item.price,
      }));
      
      console.log("Creating order items:", orderItems);
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) {
        console.error("Error creating order items:", itemsError);
        throw itemsError;
      }
      
      console.log("Order items created successfully");
      
      // If payment method is online, redirect to payment gateway (future implementation)
      if (paymentMethod === 'online') {
        // For now, just set the order status as pending
        console.log("Online payment selected - this would redirect to payment gateway");
        toast.info("سيتم توجيهك إلى بوابة الدفع...");
        // In a real implementation, this would redirect to Stripe or other payment gateway
      }
      
      // Clear the cart after successful order
      clearCart();
      
      // Return the order ID
      return order.id;
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("حدث خطأ أثناء إتمام الطلب");
      throw error;
    }
  },
}));
