
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserCircle2, LogOut, Settings, User, ShoppingBag, ShieldAlert, TagIcon, ClipboardList } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function UserMenu() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const navigate = useNavigate();

  // Check admin status separately on component mount
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
        console.log("Admin status in UserMenu:", { userId: user.id, isAdmin: data?.role === 'admin' });
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsUserAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, [user, isAuthenticated]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("تم تسجيل الخروج بنجاح");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <Button variant="ghost" asChild>
        <Link to="/login">
          <UserCircle2 className="h-5 w-5 ml-2" />
          تسجيل الدخول
        </Link>
      </Button>
    );
  }

  console.log("Current user:", user);
  console.log("Is admin in UserMenu:", isUserAdmin);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center">
          <UserCircle2 className="h-5 w-5 ml-2" />
          {user.name || "المستخدم"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>حسابي</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="w-full cursor-pointer">
            <User className="ml-2 h-4 w-4" />
            الملف الشخصي
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/orders" className="w-full cursor-pointer">
            <ShoppingBag className="ml-2 h-4 w-4" />
            طلباتي
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="w-full cursor-pointer">
            <Settings className="ml-2 h-4 w-4" />
            إعدادات الحساب
          </Link>
        </DropdownMenuItem>
        
        {isUserAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-secondary">لوحة التحكم</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to="/admin/products" className="w-full cursor-pointer">
                <TagIcon className="ml-2 h-4 w-4" />
                إدارة المنتجات
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/categories" className="w-full cursor-pointer">
                <ShieldAlert className="ml-2 h-4 w-4" />
                إدارة الفئات
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/orders" className="w-full cursor-pointer">
                <ClipboardList className="ml-2 h-4 w-4" />
                إدارة الطلبات
              </Link>
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
          <LogOut className="ml-2 h-4 w-4" />
          تسجيل الخروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
