
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Phone,
  Mail,
  MapPin,
  Clock
} from "lucide-react";

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    alert('تم إرسال رسالتك بنجاح، سنتواصل معك قريبًا');
  };
  
  return (
    <Container className="py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">اتصل بنا</h1>
          <p className="text-muted-foreground mt-2">نحن هنا للإجابة على استفساراتك</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-background p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-medium mb-4">أرسل لنا رسالة</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم</Label>
                  <Input id="name" placeholder="الاسم الكامل" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input id="email" type="email" placeholder="example@example.com" required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">الموضوع</Label>
                <Input id="subject" placeholder="موضوع الرسالة" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">الرسالة</Label>
                <Textarea id="message" placeholder="اكتب رسالتك هنا..." className="min-h-[150px]" required />
              </div>
              
              <Button type="submit" className="w-full">إرسال الرسالة</Button>
            </form>
          </div>
          
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-background p-6 rounded-lg border shadow-sm">
              <h2 className="text-xl font-medium mb-4">معلومات الاتصال</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-secondary ml-3 mt-1" />
                  <div>
                    <p className="font-medium">اتصل بنا</p>
                    <p className="text-muted-foreground">0666466709</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-secondary ml-3 mt-1" />
                  <div>
                    <p className="font-medium">راسلنا عبر البريد الإلكتروني</p>
                    <p className="text-muted-foreground">A.S@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-secondary ml-3 mt-1" />
                  <div>
                    <p className="font-medium">العنوان</p>
                    <p className="text-muted-foreground">مسيلة</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-secondary ml-3 mt-1" />
                  <div>
                    <p className="font-medium">ساعات العمل</p>
                    <p className="text-muted-foreground">من السبت إلى الخميس: 9:00 ص - 9:00 م</p>
                    <p className="text-muted-foreground">الجمعة: 2:00 م - 9:00 م</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-background p-6 rounded-lg border shadow-sm">
              <h2 className="text-xl font-medium mb-4">الأسئلة الشائعة</h2>
              <ul className="space-y-3">
                <li>
                  <p className="font-medium">كم تستغرق عملية التوصيل؟</p>
                  <p className="text-muted-foreground text-sm">التوصيل داخل الولاية يستغرق 1-2 يوم</p>
                </li>
                <li>
                  <p className="font-medium">هل يمكنني تخصيص طلبي؟</p>
                  <p className="text-muted-foreground text-sm">نعم، يمكنك اختيار الحشوات والألوان حسب رغبتك.</p>
                </li>
                <li>
                  <p className="font-medium">هل يمكنني إلغاء طلبي؟</p>
                  <p className="text-muted-foreground text-sm">يمكن إلغاء الطلب خلال ساعتين من تقديمه، بعد ذلك يتم البدء في التحضير.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Contact;
