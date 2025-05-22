import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/AuthProvider";
import { apiRequest } from "@/lib/queryClient";
import { PixelBorder } from "@/components/ui/pixel-border";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelInput } from "@/components/ui/pixel-input";
import { 
  Flag,
  X,
  CheckCircle,
  Clock,
  Ban,
  Info,
  Send
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function RoomView({ id }: { id: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [accountDetails, setAccountDetails] = useState("");
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const { data: transaction, isLoading } = useQuery({
    queryKey: [`/api/transactions/${id}`],
  });
  
  const { data: messages } = useQuery({
    queryKey: [`/api/transactions/${id}/messages`],
    enabled: !!transaction,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", `/api/transactions/${id}/messages`, { content });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/transactions/${id}/messages`] });
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  });

  // Send account details mutation
  const sendAccountMutation = useMutation({
    mutationFn: async (details: string) => {
      return apiRequest("POST", `/api/transactions/${id}/account`, { details });
    },
    onSuccess: () => {
      setShowAccountDialog(false);
      queryClient.invalidateQueries({ queryKey: [`/api/transactions/${id}`] });
      toast({
        title: "Account details sent",
        description: "The buyer has been notified and can now review the account",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to send account details",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  });

  // Confirm account received mutation
  const confirmAccountMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/transactions/${id}/confirm`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/transactions/${id}`] });
      toast({
        title: "Transaction completed",
        description: "Thank you for using PIXELStrade!"
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to confirm",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  });

  // Cancel transaction mutation
  const cancelTransactionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/transactions/${id}/cancel`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/transactions/${id}`] });
      toast({
        title: "Transaction cancelled",
        description: "The transaction has been cancelled and any funds have been returned"
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to cancel",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  });

  // Report transaction mutation
  const reportTransactionMutation = useMutation({
    mutationFn: async (reason: string) => {
      return apiRequest("POST", `/api/transactions/${id}/report`, { reason });
    },
    onSuccess: () => {
      toast({
        title: "Report submitted",
        description: "Our team will review your report as soon as possible"
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to submit report",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  });

  // Scroll to bottom of chat when new messages come in
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };

  const handleSendAccount = () => {
    if (accountDetails.trim()) {
      sendAccountMutation.mutate(accountDetails);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!transaction) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-pixel text-primary mb-4">Giao dịch không tồn tại</h2>
        <p className="text-muted-foreground">Không thể tìm thấy giao dịch này hoặc bạn không có quyền truy cập.</p>
      </div>
    );
  }

  const isSeller = user?.id === transaction.sellerId;
  const isBuyer = user?.id === transaction.buyerId;
  const showSendAccountButton = isSeller && transaction.status === "processing" && !transaction.accountDetails;
  const showConfirmButton = isBuyer && transaction.status === "processing" && transaction.accountDetails;

  const getStepStatus = (step: string) => {
    const completedSteps = transaction.steps || [];
    return completedSteps.includes(step);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-pixel text-primary">Giao Dịch #{transaction.id}</h2>
          <p className="text-muted-foreground">Mã CODE: {transaction.code}</p>
        </div>
        <div className="flex space-x-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <PixelButton variant="destructive" size="sm">
                <Flag className="w-4 h-4 mr-1" /> Báo cáo
              </PixelButton>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Báo cáo giao dịch</AlertDialogTitle>
                <AlertDialogDescription>
                  Hãy cung cấp lý do báo cáo giao dịch này. Chúng tôi sẽ xem xét và có biện pháp xử lý phù hợp.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Textarea placeholder="Lý do báo cáo..." className="mt-2 bg-background" />
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={() => reportTransactionMutation.mutate("Reported by user")}>
                  Gửi báo cáo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <PixelButton variant="outline" size="sm">
                <X className="w-4 h-4 mr-1" /> Huỷ
              </PixelButton>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Huỷ giao dịch</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn huỷ giao dịch này? Hành động này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Quay lại</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => cancelTransactionMutation.mutate()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Huỷ giao dịch
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PixelBorder className="bg-card rounded-lg p-5 mb-6">
            <h3 className="text-lg font-semibold mb-4">Chi tiết giao dịch</h3>
            <div className="space-y-4">
              <div className="flex flex-wrap">
                <div className="w-full md:w-1/2 mb-4">
                  <p className="text-sm text-muted-foreground">Loại giao dịch</p>
                  <p className="font-medium">
                    {transaction.type === "buy_sell" ? "Mua bán account" : "Cày thuê"}
                  </p>
                </div>
                <div className="w-full md:w-1/2 mb-4">
                  <p className="text-sm text-muted-foreground">Trạng thái</p>
                  <p className={`font-medium ${
                    transaction.status === "completed" 
                      ? "text-secondary" 
                      : transaction.status === "processing" 
                        ? "text-warning" 
                        : transaction.status === "canceled" 
                          ? "text-destructive" 
                          : "text-muted-foreground"
                  }`}>
                    {transaction.status === "completed" 
                      ? "Hoàn thành" 
                      : transaction.status === "processing" 
                        ? "Đang xử lý" 
                        : transaction.status === "canceled" 
                          ? "Đã hủy" 
                          : "Chờ xác nhận"}
                  </p>
                </div>
                <div className="w-full md:w-1/2 mb-4">
                  <p className="text-sm text-muted-foreground">Người bán</p>
                  <p className="font-medium">{transaction.sellerName}</p>
                </div>
                <div className="w-full md:w-1/2 mb-4">
                  <p className="text-sm text-muted-foreground">Người mua</p>
                  <p className="font-medium">
                    {transaction.buyerName || "Chưa có người mua"}
                  </p>
                </div>
                <div className="w-full md:w-1/2 mb-4">
                  <p className="text-sm text-muted-foreground">Giá</p>
                  <p className="text-secondary font-medium">{transaction.price} xu</p>
                </div>
                <div className="w-full md:w-1/2 mb-4">
                  <p className="text-sm text-muted-foreground">Thời gian tạo</p>
                  <p className="font-medium">{new Date(transaction.createdAt).toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Mô tả</p>
                <div className="p-3 bg-background border border-border rounded-md">
                  <p>{transaction.description}</p>
                </div>
              </div>
              
              {transaction.accountDetails && isBuyer && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Thông tin tài khoản</p>
                  <div className="p-3 bg-background border border-border rounded-md">
                    <p>{transaction.accountDetails}</p>
                  </div>
                </div>
              )}
            </div>
          </PixelBorder>
          
          <PixelBorder className="bg-card rounded-lg p-5">
            <h3 className="text-lg font-semibold mb-4">Tiến trình giao dịch</h3>
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute top-0 left-0 h-full border-l-2 border-primary ml-3"></div>
                
                <div className="flex mb-6 relative">
                  <div className={`w-7 h-7 ${getStepStatus("created") ? "bg-primary" : "bg-muted"} rounded-full flex items-center justify-center z-10`}>
                    {getStepStatus("created") ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <X className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="font-medium">Tạo giao dịch</p>
                    <p className="text-sm text-muted-foreground">
                      {getStepStatus("created") 
                        ? new Date(transaction.createdAt).toLocaleString() 
                        : "Chưa hoàn thành"}
                    </p>
                  </div>
                </div>
                
                <div className="flex mb-6 relative">
                  <div className={`w-7 h-7 ${getStepStatus("payment_sent") ? "bg-primary" : transaction.status !== "created" ? "bg-warning" : "bg-muted"} rounded-full flex items-center justify-center z-10`}>
                    {getStepStatus("payment_sent") ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : transaction.status !== "created" ? (
                      <Clock className="w-4 h-4 text-white" />
                    ) : (
                      <X className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="font-medium">Người mua đã gửi tiền</p>
                    <p className="text-sm text-muted-foreground">
                      {getStepStatus("payment_sent") 
                        ? transaction.paymentSentAt 
                        : transaction.status !== "created" 
                          ? "Đang xử lý..." 
                          : "Chưa hoàn thành"}
                    </p>
                  </div>
                </div>
                
                <div className="flex mb-6 relative">
                  <div className={`w-7 h-7 ${getStepStatus("account_sent") ? "bg-primary" : transaction.status === "processing" && getStepStatus("payment_sent") ? "bg-warning" : "bg-muted"} rounded-full flex items-center justify-center z-10`}>
                    {getStepStatus("account_sent") ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : transaction.status === "processing" && getStepStatus("payment_sent") ? (
                      <Clock className="w-4 h-4 text-white" />
                    ) : (
                      <X className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="font-medium">Người bán gửi thông tin account</p>
                    <p className="text-sm text-muted-foreground">
                      {getStepStatus("account_sent") 
                        ? transaction.accountSentAt
                        : transaction.status === "processing" && getStepStatus("payment_sent")
                          ? "Đang xử lý..." 
                          : "Chưa hoàn thành"}
                    </p>
                  </div>
                </div>
                
                <div className="flex mb-6 relative">
                  <div className={`w-7 h-7 ${getStepStatus("confirmed") ? "bg-primary" : transaction.status === "processing" && getStepStatus("account_sent") ? "bg-warning" : "bg-muted"} rounded-full flex items-center justify-center z-10`}>
                    {getStepStatus("confirmed") ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : transaction.status === "processing" && getStepStatus("account_sent") ? (
                      <Clock className="w-4 h-4 text-white" />
                    ) : (
                      <X className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="font-medium">Người mua xác nhận nhận account</p>
                    <p className="text-sm text-muted-foreground">
                      {getStepStatus("confirmed") 
                        ? transaction.confirmedAt
                        : transaction.status === "processing" && getStepStatus("account_sent")
                          ? "Đang chờ xác nhận..."
                          : "Chưa hoàn thành"}
                    </p>
                  </div>
                </div>
                
                <div className="flex relative">
                  <div className={`w-7 h-7 ${getStepStatus("completed") ? "bg-primary" : "bg-muted"} rounded-full flex items-center justify-center z-10`}>
                    {getStepStatus("completed") ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <X className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="font-medium">Giao dịch hoàn thành</p>
                    <p className="text-sm text-muted-foreground">
                      {getStepStatus("completed") 
                        ? transaction.completedAt
                        : "Chưa hoàn thành"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </PixelBorder>
        </div>
        
        <div>
          <PixelBorder className="bg-card rounded-lg p-5 mb-6">
            <h3 className="text-lg font-semibold mb-4">Hành động</h3>
            <div className="space-y-3">
              {showSendAccountButton && (
                <PixelButton
                  className="w-full"
                  onClick={() => setShowAccountDialog(true)}
                >
                  <Info className="w-4 h-4 mr-2" /> Gửi thông tin account
                </PixelButton>
              )}
              
              {showConfirmButton && (
                <PixelButton
                  className="w-full"
                  variant="secondary"
                  onClick={() => confirmAccountMutation.mutate()}
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Xác nhận nhận account
                </PixelButton>
              )}
              
              {transaction.status !== "completed" && transaction.status !== "canceled" && (
                <div className="pt-3 border-t border-border mt-3">
                  <PixelButton
                    className="w-full"
                    variant="destructive"
                    onClick={() => cancelTransactionMutation.mutate()}
                  >
                    <Ban className="w-4 h-4 mr-2" /> Huỷ giao dịch
                  </PixelButton>
                </div>
              )}
            </div>
          </PixelBorder>
          
          <PixelBorder className="bg-card rounded-lg p-5">
            <h3 className="text-lg font-semibold mb-4">Chat giao dịch</h3>
            <div 
              ref={chatContainerRef}
              className="h-64 overflow-y-auto mb-4 border border-border rounded-md p-3 space-y-3"
            >
              {messages && messages.length > 0 ? (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex items-start ${msg.senderId === user?.id ? 'justify-end' : ''}`}>
                    {msg.senderId !== user?.id && (
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
                        {msg.senderName.charAt(0)}
                      </div>
                    )}
                    
                    <div className={`mx-2 p-2 rounded-md max-w-[80%] ${
                      msg.senderId === user?.id ? 'bg-primary/20' : 'bg-muted'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    
                    {msg.senderId === user?.id && (
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white">
                        {user.name.charAt(0)}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Chưa có tin nhắn nào. Bắt đầu cuộc trò chuyện!
                </div>
              )}
            </div>
            
            <form onSubmit={handleSendMessage} className="flex">
              <PixelInput
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-grow rounded-r-none"
                placeholder="Nhập tin nhắn..."
                disabled={transaction.status === "completed" || transaction.status === "canceled"}
              />
              <PixelButton 
                type="submit" 
                className="rounded-l-none"
                disabled={!message.trim() || transaction.status === "completed" || transaction.status === "canceled"}
              >
                <Send className="w-4 h-4" />
              </PixelButton>
            </form>
          </PixelBorder>
        </div>
      </div>
      
      {/* Account details dialog */}
      <Dialog open={showAccountDialog} onOpenChange={setShowAccountDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gửi thông tin tài khoản</DialogTitle>
            <DialogDescription>
              Nhập thông tin đăng nhập và chi tiết khác về tài khoản. Thông tin này sẽ chỉ được chia sẻ với người mua.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea
              value={accountDetails}
              onChange={(e) => setAccountDetails(e.target.value)}
              placeholder="Nhập tên đăng nhập, mật khẩu và các thông tin cần thiết khác..."
              className="min-h-[150px] bg-background"
            />
            
            <div className="bg-warning/10 text-warning p-3 rounded-md text-sm">
              <strong>Lưu ý:</strong> Hãy đảm bảo tài khoản có Gmail bảo vệ trước khi giao cho người mua. Nếu tài khoản không có Gmail và xảy ra sự cố, chúng tôi miễn trách nhiệm.
            </div>
          </div>
          
          <DialogFooter>
            <PixelButton variant="outline" onClick={() => setShowAccountDialog(false)}>
              Hủy
            </PixelButton>
            <PixelButton onClick={handleSendAccount} disabled={!accountDetails.trim()}>
              Gửi thông tin
            </PixelButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
