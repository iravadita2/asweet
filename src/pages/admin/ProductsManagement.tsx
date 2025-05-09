import { useState, useEffect } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id?: string;
  name: string;
  description: string;
  category: string;
  price: number;
  discounted_price?: number;
  image_url?: string;
  available_fillings?: string[];
  available_colors?: string[];
  rating?: number;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
}

const ProductsManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState<Product>({
    name: "",
    description: "",
    category: "",
    price: 0,
    discounted_price: 0,
    image_url: "",
    available_fillings: [],
    available_colors: [],
  });
  
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);
  
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name");
        
      if (error) throw error;
      console.log("Fetched products:", data);
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("حدث خطأ أثناء جلب المنتجات");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      console.log("Fetched categories:", data);
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("حدث خطأ أثناء جلب التصنيفات");
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      price: 0,
      discounted_price: 0,
      image_url: "",
      available_fillings: [],
      available_colors: [],
    });
    setEditingProduct(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "price" || name === "discounted_price" ? parseFloat(value) || 0 : value
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      category: value
    }));
  };
  
  const handleListInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: "available_fillings" | "available_colors") => {
    const value = e.target.value;
    const list = value.split(",").map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      [field]: list
    }));
  };
  
  const handleEditProduct = (product: Product) => {
    console.log("Editing product:", product);
    setEditingProduct(product);
    setFormData({
      ...product,
      available_fillings: product.available_fillings || [],
      available_colors: product.available_colors || []
    });
    setIsDialogOpen(true);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!formData.category) {
      toast.error("يرجى اختيار تصنيف للمنتج");
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingProduct && editingProduct.id) {
        // Update existing product
        console.log("Updating product:", formData);
        const { error } = await supabase
          .from("products")
          .update({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            price: formData.price,
            discounted_price: formData.discounted_price || null,
            image_url: formData.image_url || null,
            available_fillings: formData.available_fillings,
            available_colors: formData.available_colors
          })
          .eq("id", editingProduct.id);
          
        if (error) {
          console.error("Error updating product:", error);
          throw error;
        }
          
        toast.success("تم تحديث المنتج بنجاح");
      } else {
        // Create new product
        console.log("Creating new product:", formData);
        const { error } = await supabase
          .from("products")
          .insert({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            price: formData.price,
            discounted_price: formData.discounted_price || null,
            image_url: formData.image_url || null,
            available_fillings: formData.available_fillings,
            available_colors: formData.available_colors
          });
          
        if (error) {
          console.error("Error creating product:", error);
          throw error;
        }
          
        toast.success("تم إضافة المنتج بنجاح");
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("حدث خطأ أثناء حفظ المنتج");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      try {
        console.log("Deleting product:", id);
        const { error } = await supabase
          .from("products")
          .delete()
          .eq("id", id);
          
        if (error) {
          console.error("Error deleting product:", error);
          throw error;
        }
        
        toast.success("تم حذف المنتج بنجاح");
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("حدث خطأ أثناء حذف المنتج");
      }
    }
  };
  
  return (
    <Container className="py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إدارة المنتجات</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              إضافة منتج جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "تعديل منتج" : "إضافة منتج جديد"}</DialogTitle>
              <DialogDescription>
                أدخل تفاصيل المنتج في النموذج أدناه
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم المنتج</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">التصنيف</Label>
                  <Select 
                    value={formData.category}
                    onValueChange={handleCategoryChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر التصنيف" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">السعر العادي</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discounted_price">سعر الخصم (اختياري)</Label>
                  <Input
                    id="discounted_price"
                    name="discounted_price"
                    type="number"
                    value={formData.discounted_price || ""}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image_url">رابط الصورة</Label>
                <Input
                  id="image_url"
                  name="image_url"
                  value={formData.image_url || ""}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="available_fillings">الحشوات المتاحة (مفصولة بفواصل)</Label>
                  <Input
                    id="available_fillings"
                    value={formData.available_fillings?.join(", ") || ""}
                    onChange={(e) => handleListInputChange(e, "available_fillings")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="available_colors">الألوان المتاحة (مفصولة بفواصل)</Label>
                  <Input
                    id="available_colors"
                    value={formData.available_colors?.join(", ") || ""}
                    onChange={(e) => handleListInputChange(e, "available_colors")}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      {editingProduct ? "تحديث" : "إضافة"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2">جاري تحميل المنتجات...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المنتج</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead>السعر العادي</TableHead>
                  <TableHead>سعر الخصم</TableHead>
                  <TableHead>التقييم</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.price}</TableCell>
                      <TableCell>{product.discounted_price || "-"}</TableCell>
                      <TableCell>{product.rating?.toFixed(1) || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditProduct(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => product.id && handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      لا توجد منتجات حالياً
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProductsManagement;
