
import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/lib/store";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Container } from "./ui/container";
import { supabase } from "@/integrations/supabase/client";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyAdminStatus = async () => {
      try {
        setIsChecking(true);
        
        // First check if user is authenticated
        if (!isAuthenticated || !user) {
          setIsAdmin(false);
          setIsChecking(false);
          return;
        }
        
        // Check the admin status directly from the database
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          console.error("Error verifying admin status:", error);
          throw error;
        }
        
        // Log the result of admin check
        console.log("Admin check result:", data);
        const userIsAdmin = data?.role === 'admin';
        setIsAdmin(userIsAdmin);
      } catch (error) {
        console.error("Error verifying admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsChecking(false);
      }
    };

    verifyAdminStatus();
  }, [isAuthenticated, user]);

  // Display console logs for debugging
  console.log({
    isAuthenticated,
    userId: user?.id,
    isAdmin,
    isChecking
  });

  if (isChecking) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">جاري التحقق من الصلاحيات...</p>
        </div>
      </Container>
    );
  }

  if (!isAuthenticated) {
    toast.error("يجب تسجيل الدخول للوصول إلى لوحة التحكم");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    toast.error("ليس لديك صلاحيات للوصول إلى لوحة التحكم");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
