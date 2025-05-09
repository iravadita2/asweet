
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  CreditCard, 
  Truck,
  ArrowLeft
} from "lucide-react";
import { useCartStore, useAuthStore, useCheckoutStore, PaymentMethod } from "@/lib/store";
import { products, getProductImage } from "@/lib/data";

const Cart = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { items, updateItem, removeItem, clearCart, getTotalPrice, getDiscountedTotal } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { setDeliveryInfo, setPaymentMethod, placeOrder } = useCheckoutStore();
  
  const [activeStep, setActiveStep] = useState<"cart" | "delivery" | "payment">("cart");
  
  const [deliveryForm, setDeliveryForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });
  
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("cash");
  
  const handleUpdateQuantity = (productId: string, quantity: number) => {
    updateItem(productId, quantity);
  };
  
  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
    toast({
      title: "تمت إزالة المنتج",
      description: "تم حذف المنتج من سلة التسوق"
    });
  };
  
  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!deliveryForm.name || !deliveryForm.phone || !deliveryForm.address || !deliveryForm.city) {
      toast({
        title: "معلومات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }
    
    setDeliveryInfo(deliveryForm);
    setActiveStep("payment");
  };
  
  const handlePaymentSubmit = async () => {
    if (!isAuthenticated) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يرجى تسجيل الدخول قبل إتمام عملية الشراء",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    
    setPaymentMethod(selectedPayment);
    
    try {
      const orderId = await placeOrder();
      
      toast({
        title: "تم إتمام الطلب بنجاح",
        description: `رقم الطلب: ${orderId}`
      });
      
      // Redirect to success page
      navigate("/");
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من إتمام طلبك، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    }
  };
  
  // Get product details for each cart item
  const cartItemsWithDetails = items.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      ...item,
      product
    };
  });
  
  const totalPrice = getTotalPrice();
  const discountedTotal = getDiscountedTotal();
  const hasDiscount = discountedTotal < totalPrice;
  
  const shippingCost = 150;
  const finalTotal = discountedTotal + shippingCost;
  
  if (items.length === 0 && activeStep === "cart") {
    return (
      <Container className="py-10">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold mt-4">سلة التسوق فارغة</h1>
          <p className="text-muted-foreground mt-2 mb-6">
            لم تقم بإضافة أية منتجات إلى سلة التسوق بعد
          </p>
          <Button asChild>
            <Link to="/categories">تصفح المنتجات</Link>
          </Button>
        </div>
      </Container>
    );
  }
  
  return (
    <Container className="py-10">
      <h1 className="text-3xl font-bold mb-6">سلة التسوق</h1>
      
      {/* Steps */}
      <div className="flex items-center justify-between max-w-3xl mx-auto mb-8">
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeStep === "cart" ? "bg-primary text-white" : "bg-muted text-foreground"}`}>
            1
          </div>
          <span className="text-sm mt-1">السلة</span>
        </div>
        <div className="flex-1 h-1 bg-muted mx-2"></div>
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeStep === "delivery" ? "bg-primary text-white" : "bg-muted text-foreground"}`}>
            2
          </div>
          <span className="text-sm mt-1">التوصيل</span>
        </div>
        <div className="flex-1 h-1 bg-muted mx-2"></div>
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeStep === "payment" ? "bg-primary text-white" : "bg-muted text-foreground"}`}>
            3
          </div>
          <span className="text-sm mt-1">الدفع</span>
        </div>
      </div>
      
      {/* Cart Step */}
      {activeStep === "cart" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItemsWithDetails.map((item) => (
                <Card key={`${item.productId}-${item.filling}-${item.color}`}>
                  <CardContent className="p-4">
                    <div className="flex">
                      <div className="w-24 h-24 overflow-hidden rounded-md border">
                        {item.product && (
                          <img 
                            src={getProductImage(item.product)} 
                            alt={item.product.name} 
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      
                      <div className="flex-1 mr-4">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium text-lg">
                              {item.product?.name}
                            </h3>
                            <div className="text-sm text-muted-foreground mt-1">
                              <span>الحشوة: {item.filling}</span>
                              <span className="mx-2">•</span>
                              <span>اللون: {item.color}</span>
                            </div>
                            <div className="text-sm font-medium mt-2">
                              {item.price} د.ج
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.productId)}
                          >
                            <Trash2 className="h-5 w-5 text-muted-foreground" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center mt-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleUpdateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <div className="w-12 text-center">
                            <span className="text-lg font-semibold">{item.quantity}</span>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          
                          <div className="mr-auto font-semibold">
                            {(item.price * item.quantity).toFixed(2)} د.ج
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المجموع</span>
                  <span>{totalPrice.toFixed(2)} د.ج</span>
                </div>
                
                {hasDiscount && (
                  <div className="flex justify-between text-destructive">
                    <span>الخصم</span>
                    <span>- {(totalPrice - discountedTotal).toFixed(2)} د.ج</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">التوصيل</span>
                  <span>
                    {shippingCost === 0 ? (
                      "مجاني"
                    ) : (
                      `${shippingCost.toFixed(2)} د.ج`
                    )}
                  </span>
                </div>
                
                {shippingCost > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {/*                     الشحن مجاني للطلبات التي تزيد قيمتها عن 5000 د.ج */}
                  </div>
                )}
                
                <div className="border-t pt-4 flex justify-between font-semibold">
                  <span>الإجمالي</span>
                  <span>{finalTotal.toFixed(2)} د.ج</span>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={() => setActiveStep("delivery")}
                >
                  متابعة إلى التوصيل
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      {/* Delivery Step */}
      {activeStep === "delivery" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>معلومات التوصيل</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDeliverySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">الاسم الكامل</Label>
                      <Input
                        id="name"
                        value={deliveryForm.name}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={deliveryForm.phone}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">العنوان</Label>
                    <Input
                      id="address"
                      value={deliveryForm.address}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, address: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">المدينة</Label>
                    <Input
                      id="city"
                      value={deliveryForm.city}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, city: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                    <Textarea
                      id="notes"
                      value={deliveryForm.notes}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, notes: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setActiveStep("cart")}
                    >
                      <ArrowLeft className="ml-2 h-4 w-4" />
                      العودة للسلة
                    </Button>
                    <Button type="submit">
                      متابعة إلى الدفع
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المجموع</span>
                  <span>{totalPrice.toFixed(2)} د.ج</span>
                </div>
                
                {hasDiscount && (
                  <div className="flex justify-between text-destructive">
                    <span>الخصم</span>
                    <span>- {(totalPrice - discountedTotal).toFixed(2)} د.ج</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">التوصيل</span>
                  <span>
                    {shippingCost === 0 ? (
                      "مجاني"
                    ) : (
                      `${shippingCost.toFixed(2)} د.ج`
                    )}
                  </span>
                </div>
                
                <div className="border-t pt-4 flex justify-between font-semibold">
                  <span>الإجمالي</span>
                  <span>{finalTotal.toFixed(2)} د.ج</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      {/* Payment Step */}
      {activeStep === "payment" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>طريقة الدفع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center p-4 border rounded-lg cursor-pointer bg-muted/50">
                      <input
                        type="radio"
                        id="cash"
                        name="payment"
                        value="cash"
                        checked={selectedPayment === "cash"}
                        onChange={() => setSelectedPayment("cash")}
                        className="ml-2"
                      />
                      <label htmlFor="cash" className="flex items-center cursor-pointer">
                        <div className="mr-2 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">الدفع عند الاستلام</p>
                          <p className="text-muted-foreground text-sm">ادفع نقدًا عند استلام طلبك</p>
                        </div>
                      </label>
                    </div>
                    
                    <div className="flex items-center p-4 border rounded-lg cursor-pointer">
                      <input
                        type="radio"
                        id="online"
                        name="payment"
                        value="online"
                        checked={selectedPayment === "online"}
                        onChange={() => setSelectedPayment("online")}
                        className="ml-2"
                      />
                      <label htmlFor="online" className="flex items-center cursor-pointer">
                        <div className="mr-2 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">الدفع الإلكتروني</p>
                          <p className="text-muted-foreground text-sm">ادفع الآن باستخدام بطاقة الائتمان أو مدى</p>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setActiveStep("delivery")}
                    >
                      <ArrowLeft className="ml-2 h-4 w-4" />
                      العودة للتوصيل
                    </Button>
                    <Button onClick={handlePaymentSubmit}>
                      إتمام الطلب
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المجموع</span>
                  <span>{totalPrice.toFixed(2)} د.ج</span>
                </div>
                
                {hasDiscount && (
                  <div className="flex justify-between text-destructive">
                    <span>الخصم</span>
                    <span>- {(totalPrice - discountedTotal).toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">التوصيل</span>
                  <span>
                    {shippingCost === 0 ? (
                      "مجاني"
                    ) : (
                      `${shippingCost.toFixed(2)} د.ج`
                    )}
                  </span>
                </div>
                
                <div className="border-t pt-4 flex justify-between font-semibold">
                  <span>الإجمالي</span>
                  <span>{finalTotal.toFixed(2)} د.ج</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </Container>
  );
};

export default Cart;
