
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <div className="bg-secondary/10 min-h-[calc(100vh-64px)] flex items-center">
      <Container>
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <div className="flex-1 text-center lg:text-right">
          <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold leading-tight mb-4 text-neutral-600">
             <span>من عبق الماضي...</span>
            <span>نُقدّم لكم طعما لا يُنسى</span>
          </h3>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto lg:mr-0">
              اكتشف مجموعتنا الفاخرة من الحلويات الجزائرية التقليدية المصنوعة من أجود المكونات
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end">
              <Button size="lg" asChild>
                <Link to="/categories">تسوق الآن</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/about">تعرف علينا</Link>
              </Button>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative">
              <img
                src="/page.jpg"
                alt="تشكيلة من الحلويات العربية الفاخرة"
                className="rounded-lg shadow-lg w-full max-h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}