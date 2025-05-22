import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PixelBorder } from "@/components/ui/pixel-border";
import { PixelButton } from "@/components/ui/pixel-button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PixelInput } from "@/components/ui/pixel-input";
import { Radio } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  type: z.enum(["buy_sell", "boosting"]),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(100, "Price must be at least 100 coins"),
  expirationTime: z.enum(["24h", "48h", "72h", "1week"]),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateRoom() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "buy_sell",
      title: "",
      description: "",
      price: 1000,
      expirationTime: "24h",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest("POST", "/api/transactions", values);
      const data = await response.json();
      
      toast({
        title: "Giao dịch đã được tạo!",
        description: `Mã CODE của bạn là: ${data.code}`,
      });
      
      navigate(`/room/${data.id}`);
    } catch (error) {
      toast({
        title: "Lỗi khi tạo giao dịch",
        description: error instanceof Error ? error.message : "Vui lòng thử lại sau",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-pixel text-primary">Tạo Giao Dịch</h2>
        <p className="text-muted-foreground">Tạo giao dịch mới cho người dùng khác tham gia</p>
      </div>
      
      <PixelBorder className="bg-card rounded-lg p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Chọn loại giao dịch</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              className={`border-2 ${form.watch("type") === "buy_sell" ? "border-primary" : "border-border"} rounded-lg p-4 cursor-pointer hover:bg-primary/10`}
              onClick={() => form.setValue("type", "buy_sell")}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="font-medium">Mua bán</h4>
                  <p className="text-sm text-muted-foreground">Mua bán account, tài nguyên, v.v.</p>
                </div>
              </div>
            </div>
            
            <div 
              className={`border-2 ${form.watch("type") === "boosting" ? "border-primary" : "border-border"} rounded-lg p-4 cursor-pointer hover:bg-primary/10`}
              onClick={() => form.setValue("type", "boosting")}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="font-medium">Cày thuê</h4>
                  <p className="text-sm text-muted-foreground">Thuê người chơi giúp nâng cấp.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <input type="hidden" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề giao dịch</FormLabel>
                  <FormControl>
                    <PixelInput 
                      placeholder="VD: Bán account Roblox level 100+" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả chi tiết</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Mô tả chi tiết về tài khoản hoặc dịch vụ của bạn..." 
                      className="resize-none h-32 bg-card border-2 border-border rounded focus:border-primary focus:outline-none text-foreground"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá (xu)</FormLabel>
                  <FormControl>
                    <PixelInput 
                      type="number" 
                      placeholder="Nhập số xu" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="expirationTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thời gian hết hạn giao dịch</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-card border-2 border-border">
                        <SelectValue placeholder="Chọn thời gian" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="24h">24 giờ</SelectItem>
                      <SelectItem value="48h">48 giờ</SelectItem>
                      <SelectItem value="72h">72 giờ</SelectItem>
                      <SelectItem value="1week">1 tuần</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="pt-4 border-t border-border">
              <PixelButton 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang xử lý..." : "Tạo Giao Dịch"}
              </PixelButton>
            </div>
          </form>
        </Form>
      </PixelBorder>
    </div>
  );
}
