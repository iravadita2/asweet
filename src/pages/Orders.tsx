import { useState, useEffect } from "react";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import { deleteOrder } from "@/lib/api";

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  filling: string | null;
  color: string | null;
  price: number;
}

interface Order {
  id: string;
  user_id: string;
  total: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

const Orders = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchOrders = async () => {
    try {
      console.log("Fetching orders for user ID:", user?.id);
      
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;
      
      console.log("Orders fetched:", ordersData);
      
      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // Fetch order items for each order
      const ordersWithItems = await Promise.all(
        ordersData.map(async (order) => {
          const { data: itemsData, error: itemsError } = await supabase
            .from("order_items")
            .select("*")
            .eq("order_id", order.id);

          if (itemsError) throw itemsError;
          
          console.log(`Items for order ${order.id}:`, itemsData);

          return {
            ...order,
            items: itemsData || [],
          };
        })
      );

      setOrders(ordersWithItems);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("حدث خطأ أثناء جلب الطلبات");
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderDetails = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">قيد الانتظار</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">قيد التجهيز</Badge>;
      case 'shipped':
        return <Badge className="bg-purple-500">تم الشحن</Badge>;
      case 'delivered':
        return <Badge variant="default">تم التسليم</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">ملغي</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleDeleteOrder = async () => {
    if (!deletingOrder) return;

    try {
      const success = await deleteOrder(deletingOrder);
      
      if (success) {
        setOrders(orders.filter(order => order.id !== deletingOrder));
        toast.success("تم حذف الطلب بنجاح");
      } else {
        throw new Error("Failed to delete order");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("حدث خطأ أثناء حذف الطلب");
    } finally {
      setDeletingOrder(null);
      setConfirmDialogOpen(false);
    }
  };

  const openDeleteConfirmation = (orderId: string) => {
    setDeletingOrder(orderId);
    setConfirmDialogOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <Container className="py-10">
        <Card>
          <CardContent className="pt-6 text-center">
            <p>يجب تسجيل الدخول لعرض طلباتك</p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <h1 className="text-3xl font-bold mb-6">طلباتي</h1>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDeleteOrder}>
              نعم، احذف الطلب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-muted cursor-pointer" onClick={() => toggleOrderDetails(order.id)}>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    <span>طلب #{order.id.substring(0, 8)}</span>
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(order.status)}
                    <span className="text-sm text-muted-foreground">
                      {formatDate(order.created_at)}
                    </span>
                    <span className="font-bold">
                      {order.total.toFixed(2)} ﷼
                    </span>
                  </div>
                </div>
              </CardHeader>

              {expandedOrder === order.id && (
                <CardContent className="pt-4">
                  <div className="flex justify-end mb-4">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteConfirmation(order.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      حذف الطلب
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المنتج</TableHead>
                        <TableHead>الحشوة</TableHead>
                        <TableHead>اللون</TableHead>
                        <TableHead>الكمية</TableHead>
                        <TableHead>السعر</TableHead>
                        <TableHead>المجموع</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.product_name}
                          </TableCell>
                          <TableCell>{item.filling || "-"}</TableCell>
                          <TableCell>{item.color || "-"}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.price.toFixed(2)} ﷼</TableCell>
                          <TableCell className="font-bold">
                            {(item.price * item.quantity).toFixed(2)} ﷼
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl font-medium">لا توجد طلبات سابقة</p>
            <p className="text-muted-foreground mt-1">لم تقم بإنشاء ��ي طلبات حتى الآن</p>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Orders;
