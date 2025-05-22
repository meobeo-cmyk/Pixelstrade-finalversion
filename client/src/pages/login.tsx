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
  usernameOrEmail: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  name: z.string().min(2, "Display name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  age: z.coerce.number().min(10, "You must be at least 10 years old"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  agreeTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Login() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [, navigate] = useLocation();
  const { toast } = useToast();
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
      age: 10,
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync(data);
      navigate("/");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again",
        variant: "destructive",
      });
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    try {
      const { confirmPassword, agreeTerms, ...userData } = data;
      await registerMutation.mutateAsync(userData);
      toast({
        title: "Registration Successful",
        description: "Your account has been created. You can now log in.",
      });
      setActiveTab("login");
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Please check your input and try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <PixelBorder className="max-w-md w-full p-6 bg-card rounded-lg">
        <div className="text-center mb-8">
          <h1 className="font-pixel text-primary text-xl mb-4">PIXELStrade</h1>
          <p className="text-sm text-muted-foreground">beta 0.0.0</p>
          <div className="border-b-2 border-primary my-6 w-24 mx-auto"></div>
          <p className="text-foreground font-body">Giao dịch an toàn cho Roblox</p>
        </div>
        
        <div className="flex mb-6 border-b border-border">
          <button 
            className={`w-1/2 py-2 font-semibold ${activeTab === 'login' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('login')}
          >
            Đăng nhập
          </button>
          <button 
            className={`w-1/2 py-2 font-semibold ${activeTab === 'register' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('register')}
          >
            Đăng ký
          </button>
        </div>
        
        {activeTab === "login" ? (
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="usernameOrEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên đăng nhập hoặc Email</FormLabel>
                    <FormControl>
                      <PixelInput placeholder="Username / Email" {...field} />
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
                      <PixelInput type="password" placeholder="********" {...field} />
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
                  <PixelLoader className="mx-auto" />
                ) : (
                  "Đăng nhập"
                )}
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
                      <PixelInput placeholder="Username" {...field} />
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
                      <PixelInput placeholder="Display name" {...field} />
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
                      <PixelInput placeholder="email@example.com" {...field} />
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
                        min="10" 
                        placeholder="Phải từ 10 tuổi trở lên" 
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
                        placeholder="Tối thiểu 8 ký tự" 
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
                      Tôi đồng ý với <a href="#" className="text-primary">Điều khoản sử dụng</a>
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <PixelButton 
                type="submit" 
                className="w-full py-3" 
                disabled={isRegisterPending}
              >
                {isRegisterPending ? (
                  <PixelLoader className="mx-auto" />
                ) : (
                  "Đăng ký"
                )}
              </PixelButton>
            </form>
          </Form>
        )}
      </PixelBorder>
    </div>
  );
}
