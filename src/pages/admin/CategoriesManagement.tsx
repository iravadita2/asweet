
import { useState, useEffect } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

export default function CategoriesManagement() {
  const { toast: useToastFn } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({});
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      console.log("Fetched categories:", data);
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      useToastFn({
        title: "خطأ في جلب البيانات",
        description: "حدث خطأ أثناء محاولة جلب التصنيفات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name) {
      useToastFn({
        title: "خطأ",
        description: "يرجى إدخال اسم التصنيف",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Adding new category:", newCategory);

      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: newCategory.name,
          description: newCategory.description || null,
          image_url: newCategory.image_url || null,
        }])
        .select();

      if (error) {
        console.error("Error adding category:", error);
        throw error;
      }

      console.log("Category added successfully:", data);
      setCategories([...categories, data[0]]);
      setIsDialogOpen(false);
      setNewCategory({});
      toast.success("تم إضافة التصنيف بنجاح");
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error("حدث خطأ أثناء محاولة إضافة التصنيف");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name) {
      useToastFn({
        title: "خطأ",
        description: "يرجى إدخال اسم التصنيف",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Updating category:", editingCategory);

      const { error } = await supabase
        .from('categories')
        .update({
          name: editingCategory.name,
          description: editingCategory.description || null,
          image_url: editingCategory.image_url || null,
        })
        .eq('id', editingCategory.id);

      if (error) {
        console.error("Error updating category:", error);
        throw error;
      }

      console.log("Category updated successfully");
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id ? editingCategory : cat
      ));
      setIsDialogOpen(false);
      setEditingCategory(null);
      toast.success("تم تحديث التصنيف بنجاح");
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error("حدث خطأ أثناء محاولة تحديث التصنيف");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التصنيف؟")) return;

    try {
      console.log("Deleting category:", id);
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting category:", error);
        throw error;
      }

      console.log("Category deleted successfully");
      setCategories(categories.filter(cat => cat.id !== id));
      toast.success("تم حذف التصنيف بنجاح");
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error("حدث خطأ أثناء محاولة حذف التصنيف");
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingCategory(null);
    setNewCategory({});
    setIsDialogOpen(true);
  };

  return (
    <Container className="py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">إدارة التصنيفات</h1>
        <Button onClick={openAddDialog} className="flex items-center">
          <Plus className="ml-2 h-4 w-4" />
          إضافة تصنيف جديد
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : categories.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <div className="aspect-video relative">
                {category.image_url ? (
                  <img 
                    src={category.image_url} 
                    alt={category.name} 
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="bg-muted flex items-center justify-center w-full h-full">
                    لا توجد صورة
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                )}
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => openEditDialog(category)}
                  >
                    <Edit className="ml-2 h-4 w-4" />
                    تعديل
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="ml-2 h-4 w-4" />
                    حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border rounded-lg bg-muted/20">
          <p>لا توجد تصنيفات متاحة حاليًا</p>
          <Button variant="outline" onClick={openAddDialog} className="mt-4">
            <Plus className="ml-2 h-4 w-4" />
            إضافة تصنيف جديد
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "تعديل التصنيف" : "إضافة تصنيف جديد"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              <Input 
                id="name"
                value={editingCategory?.name || newCategory.name || ''}
                onChange={(e) => editingCategory 
                  ? setEditingCategory({...editingCategory, name: e.target.value})
                  : setNewCategory({...newCategory, name: e.target.value})
                }
                placeholder="اسم التصنيف"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea 
                id="description"
                value={editingCategory?.description || newCategory.description || ''}
                onChange={(e) => editingCategory 
                  ? setEditingCategory({...editingCategory, description: e.target.value})
                  : setNewCategory({...newCategory, description: e.target.value})
                }
                placeholder="وصف التصنيف (اختياري)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">رابط الصورة</Label>
              <Input 
                id="image_url"
                value={editingCategory?.image_url || newCategory.image_url || ''}
                onChange={(e) => editingCategory 
                  ? setEditingCategory({...editingCategory, image_url: e.target.value})
                  : setNewCategory({...newCategory, image_url: e.target.value})
                }
                placeholder="رابط صورة التصنيف (اختياري)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                editingCategory ? "تحديث" : "إضافة"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
