import { Container } from "@/components/ui/container";

const About = () => {
  return (
    <Container className="py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">من نحن</h1>
        <div className="space-y-4">
          <p>
            نحن طالبتان جزائريتان شغوفتان بعالم الحلويات التقليدية، اجتمعنا تحت شعار A.S لنحيي نكهات التراث بروح عصرية.
          </p>
          <p>
            من خلال هذا الموقع، نسعى إلى تقديم حلويات جزائرية أصيلة، مصنوعة بكل حب، وبأعلى معايير الجودة.
          </p>
          <p>
            هدفنا هو أن نشارككم حلاوة الذوق الجزائري أينما كنتم، ونربط بين الماضي الأصيل والحاضر الذكي.
          </p>
          <p>
            نحرص في A.S على:
          </p>
          <ul className="list-disc list-inside space-y-2 pr-4">
            <li>استخدام أجود أنواع المكونات الطبيعية 100%</li>
            <li>اتباع معايير النظافة والجودة العالمية</li>
            <li>الابتكار في التقديم مع الحفاظ على الأصالة في الطعم</li>
            <li>تقديم خيارات متنوعة تناسب جميع الأذواق</li>
          </ul>
          <p>
            نسعى دائمًا لتقديم تجربة تسوق سلسة وممتعة لعملائنا الكرام، مع خدمة توصيل سريعة تضمن وصول منتجاتنا طازجة إلى بابك.
          </p>
          <p className="font-bold">
            A.S... طعم الأصالة بلمسة عصرية
          </p>
        </div>
      </div>
    </Container>
  );
};

export default About;