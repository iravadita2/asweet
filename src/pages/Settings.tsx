
import { useState } from "react";
import { Container } from "@/components/ui/container";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Settings = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  if (!isAuthenticated || !user) {
    return (
      <Container className="py-10">
        <div className="text-center">
          <p className="mb-4">يرجى تسجيل الدخول للوصول إلى إعدادات الحساب</p>
          <Button onClick={() => navigate("/login")}>تسجيل الدخول</Button>
        </div>
      </Container>
    );
  }
  
  const handleChangePassword = async () => {
    setError(null);
    
    // Validate passwords
    if (!currentPassword) {
      setError("يرجى إدخال كلمة المرور الحالية");
      toast.error("يرجى إدخال كلمة المرور الحالية");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل");
      toast.error("يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("كلمات المرور الجديدة غير متطابقة");
      toast.error("كلمات المرور الجديدة غير متطابقة");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // First verify current password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });
      
      if (signInError) {
        throw new Error("كلمة المرور الحالية غير صحيحة");
      }
      
      // Then update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (updateError) {
        throw updateError;
      }
      
      toast.success("تم تغيير كلمة المرور بنجاح");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
    } catch (err: any) {
      console.error("Error changing password:", err);
      setError(err.message || "حدث خطأ أثناء تغيير كلمة المرور");
      toast.error(err.message || "حدث خطأ أثناء تغيير كلمة المرور");
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Container className="py-10">
      <h1 className="text-3xl font-bold mb-6">إعدادات الحساب</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LockKeyhole className="mr-2 h-5 w-5" />
              تغيير كلمة المرور
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleChangePassword}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "تغيير كلمة المرور"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Container>
  );
};

export default Settings;
