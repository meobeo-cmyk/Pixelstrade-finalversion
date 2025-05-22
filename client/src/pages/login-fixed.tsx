import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLogin, useRegister } from "@/lib/AuthProvider";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PixelInput } from "@/components/ui/pixel-input";
import { PixelButton } from "@/components/ui/pixel-button";
import { FixedCheckbox } from "@/components/ui/fixed-checkbox";
import { PixelBorder } from "@/components/ui/pixel-border";
import { PixelLoader } from "@/components/ui/pixel-loader";

const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, "Tên đăng nhập hoặc email là bắt buộc"),
  password: z.string().min(1, "Mật khẩu là bắt buộc"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const registerSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập cần ít nhất 3 ký tự").max(20, "Tên đăng nhập tối đa 20 ký tự"),
  name: z.string().min(2, "Tên hiển thị cần ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  age: z.coerce.number().min(10, "Bạn phải ít nhất 10 tuổi"),
  password: z.string().min(8, "Mật khẩu cần ít nhất 8 ký tự"),
  confirmPassword: z.string(),
  agreeTerms: z.boolean().refine(value => value === true, {
    message: "Bạn phải đồng ý với điều khoản sử dụng",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Login() {
  const [isLoginView, setIsLoginView] = useState(true);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  
  const isLoginPending = loginMutation.isPending;
  const isRegisterPending = registerMutation.isPending;
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
      rememberMe: false,
    },
  });
  
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      name: "",
      email: "",
      age: 18,
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
  });
  
  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync(data);
    } catch (error) {
      console.error("Login error:", error);
    }
  };
  
  const onRegisterSubmit = async (data: RegisterFormValues) => {
    try {
      await registerMutation.mutateAsync(data);
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <PixelBorder className="w-full max-w-md p-6 bg-card">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">
            {isLoginView ? "Đăng Nhập" : "Đăng Ký"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isLoginView 
              ? "Đăng nhập vào tài khoản của bạn để tiếp tục" 
              : "Tạo tài khoản mới để bắt đầu"
            }
          </p>
        </div>
        
        {isLoginView ? (
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="usernameOrEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên đăng nhập hoặc Email</FormLabel>
                    <FormControl>
                      <PixelInput
                        placeholder="Nhập tên đăng nhập hoặc email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <PixelInput
                        type="password"
                        placeholder="Nhập mật khẩu"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={loginForm.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <FixedCheckbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    </FormControl>
                    <FormLabel className="text-muted-foreground">Ghi nhớ đăng nhập</FormLabel>
                  </FormItem>
                )}
              />
              
              <PixelButton 
                type="submit" 
                className="w-full py-3" 
                disabled={isLoginPending}
              >
                {isLoginPending ? (
                  <div className="flex items-center justify-center">
                    <PixelLoader className="mr-2" />
                    <span>Đang xử lý...</span>
                  </div>
                ) : "Đăng Nhập"}
              </PixelButton>
            </form>
          </Form>
        ) : (
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <FormField
                control={registerForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên đăng nhập</FormLabel>
                    <FormControl>
                      <PixelInput
                        placeholder="Nhập tên đăng nhập"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên hiển thị</FormLabel>
                    <FormControl>
                      <PixelInput
                        placeholder="Nhập tên hiển thị"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <PixelInput
                        type="email"
                        placeholder="Nhập email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tuổi</FormLabel>
                    <FormControl>
                      <PixelInput
                        type="number"
                        min={10}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <PixelInput
                        type="password"
                        placeholder="Nhập mật khẩu (ít nhất 8 ký tự)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Xác nhận mật khẩu</FormLabel>
                    <FormControl>
                      <PixelInput
                        type="password"
                        placeholder="Nhập lại mật khẩu"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="agreeTerms"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <FixedCheckbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    </FormControl>
                    <FormLabel className="text-muted-foreground">
                      Tôi đồng ý với điều khoản sử dụng
                    </FormLabel>
                  </FormItem>
                )}
              />
              
              <PixelButton 
                type="submit" 
                className="w-full py-3" 
                disabled={isRegisterPending}
              >
                {isRegisterPending ? (
                  <div className="flex items-center justify-center">
                    <PixelLoader className="mr-2" />
                    <span>Đang xử lý...</span>
                  </div>
                ) : "Đăng Ký"}
              </PixelButton>
            </form>
          </Form>
        )}
        
        <div className="mt-4 text-center">
          <button
            type="button"
            className="text-sm text-primary hover:underline focus:outline-none"
            onClick={() => setIsLoginView(!isLoginView)}
          >
            {isLoginView 
              ? "Chưa có tài khoản? Đăng ký ngay" 
              : "Đã có tài khoản? Đăng nhập"
            }
          </button>
        </div>
      </PixelBorder>
    </div>
  );
}