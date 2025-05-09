
import { Link } from "react-router-dom";
import { Container } from "@/components/ui/container";
import { Separator } from "@/components/ui/separator";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-secondary text-secondary-foreground py-12">
      <Container className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-12 text-center
">
          <div>
            <h3 className="text-xl font-bold mb-4">حلويات A.S</h3>
            <p className="text-secondary-foreground/80 mb-4">
            لأن الذوق الرفيع يستحق الأفضل، نوفر لكم أطيب الحلويات الجزائرية بإتقان وجودة عالية.
            </p>
            <div className="flex space-x-4 space-x-reverse ">
              <Link to="#" className="text-secondary-foreground/90 hover:text-secondary-foreground">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">فيسبوك</span>
              </Link>
              <Link to="#" className="text-secondary-foreground/90 hover:text-secondary-foreground">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">انستغرام</span>
              </Link>
              <Link to="#" className="text-secondary-foreground/90 hover:text-secondary-foreground">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">تويتر</span>
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-secondary-foreground/80 hover:text-secondary-foreground">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-secondary-foreground/80 hover:text-secondary-foreground">
                  من نحن
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-secondary-foreground/80 hover:text-secondary-foreground">
                  التصنيفات
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-secondary-foreground/80 hover:text-secondary-foreground">
                  اتصل بنا
                </Link>
              </li>
            </ul>
          </div>
          
          
          
          <div>
            <h3 className="text-lg font-medium mb-4">تواصل معنا</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Phone className="h-4 w-4 ml-2" />
                <span className="text-secondary-foreground/80">0666348609</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 ml-2" />
                <span className="text-secondary-foreground/80">A.S@gmail.com</span>
              </li>
              <li className="flex items-start">
                <MapPin className="h-4 w-4 ml-2 mt-1" />
                <span className="text-secondary-foreground/80">
                  المسيلة
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Container>
      
      <Separator className="bg-secondary-foreground/20" />
      
      <Container className="mt-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-secondary-foreground/70 text-sm">
            &copy; {currentYear} حلويات A.S. جميع الحقوق محفوظة.
          </p>
          <div className="flex space-x-6 space-x-reverse mt-4 md:mt-0">
            <Link to="/privacy" className="text-secondary-foreground/70 text-sm hover:text-secondary-foreground">
              سياسة الخصوصية
            </Link>
            <Link to="/terms" className="text-secondary-foreground/70 text-sm hover:text-secondary-foreground">
              الشروط والأحكام
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
