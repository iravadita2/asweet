
import { useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Search, 
  Menu,
  ShoppingCart,
} from "lucide-react";
import { useCartStore, useAuthStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { UserMenu } from "./UserMenu";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items, getItemCount } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const itemCount = getItemCount();
  
  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <Container>
        <div className="flex justify-between items-center h-16">
          {/* Logo on the left */}
          <Link to="/" className="text-xl font-bold text-primary flex items-center">
            <img src="/logo.png" alt="Logo" className="h-13 w-14 mr-2" />
          </Link>
          
          <div className="hidden md:flex flex-1 items-center justify-center">
            {/* Navigation centered */}
            <nav className="flex items-center gap-6">
              <Link to="/" className="text-sm font-medium hover:text-secondary transition-colors">
                الرئيسية
              </Link>
              <Link to="/categories" className="text-sm font-medium hover:text-secondary transition-colors">
                المنتجات
              </Link>
              <Link to="/about" className="text-sm font-medium hover:text-secondary transition-colors">
                من نحن
              </Link>
              <Link to="/contact" className="text-sm font-medium hover:text-secondary transition-colors">
                اتصل بنا
              </Link>
            </nav>
          </div>
          
          {/* Action buttons on the right */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/search">
                <Search className="h-5 w-5" />
                <span className="sr-only">بحث</span>
              </Link>
            </Button>
            
            <Button variant="ghost" asChild className="relative">
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {itemCount}
                  </Badge>
                )}
                <span className="sr-only">سلة التسوق</span>
              </Link>
            </Button>
            
            <UserMenu />
          </div>
          
          {/* Mobile menu */}
          <div className="md:hidden flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/search">
                <Search className="h-5 w-5" />
                <span className="sr-only">بحث</span>
              </Link>
            </Button>
            
            <Button variant="ghost" asChild className="relative">
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {itemCount}
                  </Badge>
                )}
                <span className="sr-only">سلة التسوق</span>
              </Link>
            </Button>
            
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">القائمة</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 max-w-xs">
                <nav className="flex flex-col gap-4 mt-6">
                  <Link 
                    to="/" 
                    className="text-sm font-medium hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    الرئيسية
                  </Link>
                  <Link 
                    to="/categories" 
                    className="text-sm font-medium hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    المنتجات
                  </Link>
                  <Link 
                    to="/about" 
                    className="text-sm font-medium hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    من نحن
                  </Link>
                  <Link 
                    to="/contact" 
                    className="text-sm font-medium hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    اتصل بنا
                  </Link>
                  
                  <div className="border-t my-2"></div>
                  
                  {isAuthenticated ? (
                    <>
                      <Link 
                        to="/profile" 
                        className="text-sm font-medium hover:text-primary transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        حسابي
                      </Link>
                      <Link 
                        to="/orders" 
                        className="text-sm font-medium hover:text-primary transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        طلباتي
                      </Link>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="justify-start p-0 h-auto text-sm font-medium text-destructive"
                        onClick={() => {
                          const { logout } = useAuthStore.getState();
                          logout();
                          setIsMenuOpen(false);
                        }}
                      >
                        تسجيل الخروج
                      </Button>
                    </>
                  ) : (
                    <Link 
                      to="/login" 
                      className="text-sm font-medium hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      تسجيل الدخول
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </Container>
    </header>
  );
}
