import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoginInput, RegisterInput, loginSchema, registerSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelCheckbox } from "@/components/ui/pixel-checkbox";
import { useAuth } from "@/hooks/use-auth";

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, isLoading } = useAuth();

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      displayName: "",
      email: "",
      age: 10,
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const onLoginSubmit = (data: LoginInput) => {
    login(data);
  };

  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
    const { confirmPassword, terms, ...registrationData } = data;
    register(registrationData as RegisterInput);
  };

  return (
    <div className="max-w-md w-full p-6 bg-dark rounded-lg pixel-border">
      <div className="text-center mb-8">
        <h1 className="font-pixel text-primary text-xl mb-4">PIXELStrade</h1>
        <p className="text-sm text-gray-400">beta 0.0.0</p>
        <div className="border-b-2 border-primary my-6 w-24 mx-auto"></div>
        <p className="text-light font-body">Giao dịch an toàn cho Roblox</p>
      </div>
      
      <div className="flex mb-6 border-b border-gray-700">
        <button 
          className={`w-1/2 py-2 font-semibold ${isLogin ? "text-primary border-b-2 border-primary" : "text-gray-400 hover:text-gray-300"}`}
          onClick={() => setIsLogin(true)}
        >
          Đăng nhập
        </button>
        <button 
          className={`w-1/2 py-2 font-semibold ${!isLogin ? "text-primary border-b-2 border-primary" : "text-gray-400 hover:text-gray-300"}`}
          onClick={() => setIsLogin(false)}
        >
          Đăng ký
        </button>
      </div>
      
      {isLogin ? (
        <Form {...loginForm}>
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
            <FormField
              control={loginForm.control}
              name="usernameOrEmail"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="block text-light text-sm font-medium">Tên đăng nhập hoặc Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="w-full px-3 py-2 bg-dark border-2 border-gray-700 rounded focus:border-primary focus:outline-none text-light"
                      placeholder="Username / Email"
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
                <FormItem className="space-y-2">
                  <FormLabel className="block text-light text-sm font-medium">Mật khẩu</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      className="w-full px-3 py-2 bg-dark border-2 border-gray-700 rounded focus:border-primary focus:outline-none text-light"
                      placeholder="********"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-center">
              <PixelCheckbox id="remember" className="mr-2" />
              <label htmlFor="remember" className="text-gray-400 text-sm">Ghi nhớ đăng nhập</label>
            </div>
            
            <PixelButton 
              type="submit" 
              className="w-full py-3 font-medium" 
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
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
                <FormItem className="space-y-2">
                  <FormLabel className="block text-light text-sm font-medium">Tên đăng nhập</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="w-full px-3 py-2 bg-dark border-2 border-gray-700 rounded focus:border-primary focus:outline-none text-light"
                      placeholder="Username"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={registerForm.control}
              name="displayName"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="block text-light text-sm font-medium">Tên hiển thị</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="w-full px-3 py-2 bg-dark border-2 border-gray-700 rounded focus:border-primary focus:outline-none text-light"
                      placeholder="Display name"
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
                <FormItem className="space-y-2">
                  <FormLabel className="block text-light text-sm font-medium">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      className="w-full px-3 py-2 bg-dark border-2 border-gray-700 rounded focus:border-primary focus:outline-none text-light"
                      placeholder="email@example.com"
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
                <FormItem className="space-y-2">
                  <FormLabel className="block text-light text-sm font-medium">Tuổi</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={10}
                      className="w-full px-3 py-2 bg-dark border-2 border-gray-700 rounded focus:border-primary focus:outline-none text-light"
                      placeholder="Phải từ 10 tuổi trở lên"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
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
                <FormItem className="space-y-2">
                  <FormLabel className="block text-light text-sm font-medium">Mật khẩu</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      className="w-full px-3 py-2 bg-dark border-2 border-gray-700 rounded focus:border-primary focus:outline-none text-light"
                      placeholder="Tối thiểu 8 ký tự"
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
                <FormItem className="space-y-2">
                  <FormLabel className="block text-light text-sm font-medium">Xác nhận mật khẩu</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      className="w-full px-3 py-2 bg-dark border-2 border-gray-700 rounded focus:border-primary focus:outline-none text-light"
                      placeholder="Nhập lại mật khẩu"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={registerForm.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <PixelCheckbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange} 
                      className="mr-2" 
                    />
                  </FormControl>
                  <FormLabel className="text-gray-400 text-sm">
                    Tôi đồng ý với <a href="#" className="text-primary">Điều khoản sử dụng</a>
                  </FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <PixelButton 
              type="submit" 
              className="w-full py-3 font-medium" 
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Đăng ký"}
            </PixelButton>
          </form>
        </Form>
      )}
    </div>
  );
}

export default AuthForm;
