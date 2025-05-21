import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PixelBorder } from "@/components/ui/pixel-border";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelInput } from "@/components/ui/pixel-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const codeSchema = z.object({
  code: z.string().length(6, "Code must be exactly 6 characters"),
});

type CodeFormValues = z.infer<typeof codeSchema>;

export default function JoinRoom() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: recentTransactions } = useQuery({
    queryKey: ['/api/transactions/public'],
  });
  
  const form = useForm<CodeFormValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: {
      code: "",
    },
  });

  const handleCodeInput = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    
    if (value && index < 5) {
      // Move to next input
      const nextInput = document.getElementById(`code-${index + 1}`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && index > 0 && (e.target as HTMLInputElement).value === '') {
      // Move to previous input on backspace when current is empty
      const prevInput = document.getElementById(`code-${index - 1}`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  const onSubmit = async (values: CodeFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest("POST", "/api/transactions/join", { code: values.code });
      const data = await response.json();
      
      toast({
        title: "Tham gia thành công!",
        description: "Bạn đã tham gia vào giao dịch.",
      });
      
      navigate(`/room/${data.id}`);
    } catch (error) {
      toast({
        title: "Lỗi khi tham gia",
        description: error instanceof Error ? error.message : "Mã CODE không hợp lệ hoặc đã hết hạn",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-pixel text-primary">Tham Gia Giao Dịch</h2>
        <p className="text-muted-foreground">Nhập mã CODE để tham gia vào giao dịch</p>
      </div>
      
      <PixelBorder className="bg-card rounded-lg p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="text-center">
              <FormLabel className="block text-lg font-medium mb-4">Nhập mã CODE giao dịch</FormLabel>
              
              <div className="flex justify-center space-x-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <PixelInput
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    maxLength={1}
                    className="w-12 h-12 text-center text-2xl font-pixel"
                    onChange={(e) => {
                      const newValue = form.getValues("code").split("");
                      newValue[index] = e.target.value.toUpperCase();
                      form.setValue("code", newValue.join(""));
                      handleCodeInput(e, index);
                    }}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                  />
                ))}
              </div>
              
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <input type="hidden" {...field} />
                    </FormControl>
                    <FormMessage className="text-center mt-2" />
                  </FormItem>
                )}
              />
              
              <p className="text-sm text-muted-foreground mt-2">Mã giao dịch bao gồm 6 ký tự</p>
            </div>
            
            <div className="text-center pt-4">
              <PixelButton 
                type="submit"
                disabled={isSubmitting || form.getValues("code").length !== 6}
              >
                {isSubmitting ? "Đang xử lý..." : "Tham Gia"}
              </PixelButton>
            </div>
          </form>
        </Form>
      </PixelBorder>
      
      {recentTransactions && recentTransactions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Giao dịch gần đây</h3>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="bg-card rounded-lg p-4 hover:bg-card/80 cursor-pointer"
                onClick={() => form.setValue("code", transaction.code)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{transaction.title}</h4>
                    <p className="text-sm text-muted-foreground">với {transaction.sellerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-secondary font-medium">{transaction.price} xu</p>
                    <p className="text-sm text-muted-foreground">CODE: {transaction.code}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
