import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Container className="py-16">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-6xl font-bold mb-4 text-secondary">404</h1>
        <p className="text-xl mb-6">عذراً، الصفحة التي تبحث عنها غير موجودة</p>
        <Button asChild>
          <Link to="/">العودة إلى الصفحة الرئيسية</Link>
        </Button>
      </div>
    </Container>
  );
};

export default NotFound;
