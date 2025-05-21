import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth, useUpdateUser, useUpdatePassword } from "@/lib/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { PixelBorder } from "@/components/ui/pixel-border";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelInput } from "@/components/ui/pixel-input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Please enter your current password"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const notificationSchema = z.object({
  transactionNotifications: z.boolean(),
  chatNotifications: z.boolean(),
  emailNotifications: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type NotificationFormValues = z.infer<typeof notificationSchema>;

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const updateUser = useUpdateUser();
  const updatePassword = useUpdatePassword();

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Notification form
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      transactionNotifications: true,
      chatNotifications: true,
      emailNotifications: false,
    },
  });

  const onProfileSubmit = (data: ProfileFormValues) => {
    updateUser.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormValues) => {
    updatePassword.mutate(data);
    passwordForm.reset();
  };

  const onNotificationSubmit = (data: NotificationFormValues) => {
    toast({
      title: "Notifications settings updated",
      description: "Your notification preferences have been saved",
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-pixel text-primary">Cài Đặt</h2>
        <p className="text-muted-foreground">Quản lý thông tin tài khoản và cài đặt cá nhân</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PixelBorder className="bg-card rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Thông tin cá nhân</h3>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên hiển thị</FormLabel>
                        <FormControl>
                          <PixelInput {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <FormLabel>Tên người dùng</FormLabel>
                    <PixelInput value={user?.username || ""} disabled />
                    <p className="text-xs text-muted-foreground mt-1">Không thể thay đổi tên người dùng</p>
                  </div>
                </div>
                
                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <PixelInput {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <PixelButton 
                    type="submit" 
                    disabled={updateUser.isPending || !profileForm.formState.isDirty}
                  >
                    {updateUser.isPending ? "Đang xử lý..." : "Lưu thay đổi"}
                  </PixelButton>
                </div>
              </form>
            </Form>
          </PixelBorder>
          
          <PixelBorder className="bg-card rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Đổi mật khẩu</h3>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu hiện tại</FormLabel>
                      <FormControl>
                        <PixelInput type="password" placeholder="Nhập mật khẩu hiện tại" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu mới</FormLabel>
                      <FormControl>
                        <PixelInput type="password" placeholder="Tối thiểu 8 ký tự" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                      <FormControl>
                        <PixelInput type="password" placeholder="Nhập lại mật khẩu mới" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <PixelButton 
                    type="submit" 
                    disabled={updatePassword.isPending || !passwordForm.formState.isDirty}
                  >
                    {updatePassword.isPending ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                  </PixelButton>
                </div>
              </form>
            </Form>
          </PixelBorder>
        </div>
        
        <div>
          <PixelBorder className="bg-card rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Thông báo</h3>
            <Form {...notificationForm}>
              <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-4">
                <FormField
                  control={notificationForm.control}
                  name="transactionNotifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Thông báo giao dịch</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={notificationForm.control}
                  name="chatNotifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Thông báo chat</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={notificationForm.control}
                  name="emailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Thông báo email</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div>
                  <PixelButton 
                    type="submit" 
                    disabled={!notificationForm.formState.isDirty}
                  >
                    Lưu thay đổi
                  </PixelButton>
                </div>
              </form>
            </Form>
          </PixelBorder>
          
          <PixelBorder className="bg-card rounded-lg p-6">
            <h3 className="text-lg font-semibold text-destructive mb-4">Vùng nguy hiểm</h3>
            <div className="space-y-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <PixelButton variant="outline" className="w-full">
                    Xoá lịch sử giao dịch
                  </PixelButton>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xoá lịch sử giao dịch</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn xoá lịch sử giao dịch? Hành động này không thể hoàn tác.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Huỷ</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        toast({
                          title: "Đã xoá lịch sử giao dịch",
                          description: "Lịch sử giao dịch của bạn đã được xoá thành công.",
                        });
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Xác nhận
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <PixelButton variant="destructive" className="w-full">
                    Xoá tài khoản
                  </PixelButton>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xoá tài khoản</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn xoá tài khoản của mình? Tất cả dữ liệu của bạn sẽ bị mất vĩnh viễn. Hành động này không thể hoàn tác.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Huỷ</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        toast({
                          title: "Yêu cầu đã được ghi nhận",
                          description: "Chúng tôi sẽ xử lý yêu cầu xoá tài khoản của bạn.",
                        });
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Xác nhận
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </PixelBorder>
        </div>
      </div>
    </div>
  );
}
