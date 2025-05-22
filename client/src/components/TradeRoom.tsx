import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TradeRoom as TradeRoomType, TradeStatus, Message } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelBorder } from "@/components/ui/pixel-border";
import { PixelLoader } from "@/components/ui/pixel-loader";
import { Avatar } from "@/components/ui/avatar";
import UserAvatar from "@/components/UserAvatar";
import { formatDate, formatCurrency, statusLabels, colorVariants } from "@/lib/utils";
import { Flag, X, CheckCircle, Ban, Send, CircleHelp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TradeProgressTimeline } from "@/components/TradeProgressTimeline";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TradeRoomProps {
  tradeRoomId: number | string;
}

export function TradeRoom({ tradeRoomId }: TradeRoomProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  
  // Fetch trade room data
  const { data: tradeRoom, isLoading: isLoadingRoom } = useQuery({
    queryKey: [`/api/trade-rooms/${tradeRoomId}`],
    enabled: !!tradeRoomId,
  });
  
  // Fetch other user data (either seller or buyer depending on current user)
  const otherUserId = tradeRoom && user ? (tradeRoom.sellerId === user.id ? tradeRoom.buyerId : tradeRoom.sellerId) : null;
  const { data: otherUser } = useQuery({
    queryKey: [`/api/users/${otherUserId}`],
    enabled: !!otherUserId,
  });
  
  // Fetch messages
  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: [`/api/trade-rooms/${tradeRoomId}/messages`],
    enabled: !!tradeRoomId,
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });
  
  // Send payment mutation
  const sendPaymentMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/trade-rooms/${tradeRoomId}/send-payment`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/trade-rooms/${tradeRoomId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Payment Sent",
        description: "Your payment has been sent to escrow",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Sending Payment",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Send account info mutation
  const sendAccountMutation = useMutation({
    mutationFn: (accountInfo: string) => 
      apiRequest("POST", `/api/trade-rooms/${tradeRoomId}/send-account`, { accountInfo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/trade-rooms/${tradeRoomId}`] });
      toast({
        title: "Account Info Sent",
        description: "Your account information has been sent to the buyer",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Sending Account Info",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Confirm reception mutation
  const confirmReceptionMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/trade-rooms/${tradeRoomId}/confirm`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/trade-rooms/${tradeRoomId}`] });
      toast({
        title: "Transaction Completed",
        description: "You have confirmed reception of the account/service",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Confirming Reception",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Cancel trade mutation
  const cancelTradeMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/trade-rooms/${tradeRoomId}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/trade-rooms/${tradeRoomId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Transaction Canceled",
        description: "The transaction has been canceled",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Canceling Transaction",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => 
      apiRequest("POST", `/api/trade-rooms/${tradeRoomId}/messages`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/trade-rooms/${tradeRoomId}/messages`] });
      setMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Error Sending Message",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Handle account info submission
  const [accountInfo, setAccountInfo] = useState("");
  const [showAccountInfoModal, setShowAccountInfoModal] = useState(false);
  
  const handleSendAccountInfo = () => {
    if (accountInfo.trim()) {
      sendAccountMutation.mutate(accountInfo);
      setShowAccountInfoModal(false);
    } else {
      toast({
        title: "Error",
        description: "Please enter account information",
        variant: "destructive",
      });
    }
  };
  
  if (isLoadingRoom) {
    return (
      <div className="flex justify-center items-center h-64">
        <PixelLoader size="lg" />
      </div>
    );
  }
  
  if (!tradeRoom) {
    return (
      <div className="text-center p-8">
        <h3 className="text-xl font-pixel text-danger mb-4">Trade Room Not Found</h3>
        <p className="text-gray-400">The requested trade room doesn't exist or you don't have access to it.</p>
      </div>
    );
  }
  
  const isSeller = user?.id === tradeRoom.sellerId;
  const isBuyer = user?.id === tradeRoom.buyerId;
  
  // Determine available actions based on user role and trade status
  const canSendPayment = isBuyer && tradeRoom.status === 'created';
  const canSendAccountInfo = isSeller && tradeRoom.status === 'payment_sent';
  const canConfirm = isBuyer && tradeRoom.status === 'item_sent';
  const canCancel = tradeRoom.status !== 'completed' && tradeRoom.status !== 'canceled';
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-pixel text-primary">Giao Dịch #{tradeRoom.id}</h2>
          <p className="text-gray-400">Mã CODE: {tradeRoom.code}</p>
        </div>
        <div className="flex space-x-2">
          <PixelButton variant="danger" size="sm" className="flex items-center">
            <Flag className="mr-1 h-4 w-4" /> Báo cáo
          </PixelButton>
          {canCancel && (
            <PixelButton 
              variant="danger" 
              size="sm" 
              className="flex items-center"
              onClick={() => cancelTradeMutation.mutate()}
              disabled={cancelTradeMutation.isPending}
            >
              <X className="mr-1 h-4 w-4" /> Huỷ
            </PixelButton>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PixelBorder className="bg-dark rounded-lg p-5 mb-6">
            <h3 className="text-lg font-semibold mb-4">Chi tiết giao dịch</h3>
            <div className="space-y-4">
              <div className="flex flex-wrap">
                <div className="w-full md:w-1/2 mb-4">
                  <p className="text-sm text-gray-400">Loại giao dịch</p>
                  <p className="font-medium">
                    <span className={`px-2 py-1 rounded text-xs ${colorVariants[tradeRoom.type]}`}>
                      {statusLabels[tradeRoom.type]}
                    </span>
                  </p>
                </div>
                <div className="w-full md:w-1/2 mb-4">
                  <p className="text-sm text-gray-400">Trạng thái</p>
                  <p className="font-medium">
                    <span className={`px-2 py-1 rounded text-xs ${colorVariants[tradeRoom.status]}`}>
                      {statusLabels[tradeRoom.status]}
                    </span>
                  </p>
                </div>
                <div className="w-full md:w-1/2 mb-4">
                  <p className="text-sm text-gray-400">Người bán</p>
                  <p className="font-medium">{isSeller ? user?.displayName : otherUser?.displayName || "Loading..."}</p>
                </div>
                <div className="w-full md:w-1/2 mb-4">
                  <p className="text-sm text-gray-400">Người mua</p>
                  <p className="font-medium">
                    {!tradeRoom.buyerId 
                      ? "Chưa có người mua" 
                      : (isBuyer ? user?.displayName : otherUser?.displayName || "Loading...")}
                  </p>
                </div>
                <div className="w-full md:w-1/2 mb-4">
                  <p className="text-sm text-gray-400">Giá</p>
                  <p className="text-secondary font-medium">{formatCurrency(tradeRoom.price)}</p>
                </div>
                <div className="w-full md:w-1/2 mb-4">
                  <p className="text-sm text-gray-400">Thời gian tạo</p>
                  <p className="font-medium">{formatDate(tradeRoom.createdAt)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-2">Mô tả</p>
                <div className="p-3 bg-dark border border-gray-700 rounded-md">
                  <p>{tradeRoom.description}</p>
                </div>
              </div>
              
              {tradeRoom.accountInfo && isBuyer && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Thông tin tài khoản</p>
                  <div className="p-3 bg-dark border border-gray-700 rounded-md">
                    <p>{tradeRoom.accountInfo}</p>
                  </div>
                </div>
              )}
            </div>
          </PixelBorder>
          
          <PixelBorder className="bg-dark rounded-lg p-5">
            <h3 className="text-lg font-semibold mb-4">Tiến trình giao dịch</h3>
            <TradeProgressTimeline tradeRoom={tradeRoom as TradeRoomType} />
          </PixelBorder>
        </div>
        
        <div>
          <PixelBorder className="bg-dark rounded-lg p-5 mb-6">
            <h3 className="text-lg font-semibold mb-4">Hành động</h3>
            <div className="space-y-3">
              {canSendPayment && (
                <PixelButton 
                  className="w-full py-2 px-4 rounded font-medium flex items-center justify-center"
                  onClick={() => sendPaymentMutation.mutate()}
                  disabled={sendPaymentMutation.isPending}
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> Gửi tiền
                </PixelButton>
              )}
              
              {canSendAccountInfo && (
                <PixelButton 
                  className="w-full py-2 px-4 rounded font-medium flex items-center justify-center"
                  onClick={() => setShowAccountInfoModal(true)}
                >
                  <CircleHelp className="mr-2 h-4 w-4" /> Gửi thông tin account
                </PixelButton>
              )}
              
              {canConfirm && (
                <PixelButton 
                  className="w-full py-2 px-4 rounded font-medium flex items-center justify-center"
                  onClick={() => confirmReceptionMutation.mutate()}
                  disabled={confirmReceptionMutation.isPending}
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> Xác nhận nhận account
                </PixelButton>
              )}
              
              {canCancel && (
                <div className="pt-3 border-t border-gray-700 mt-3">
                  <PixelButton 
                    variant="danger" 
                    className="w-full py-2 px-4 rounded font-medium flex items-center justify-center"
                    onClick={() => cancelTradeMutation.mutate()}
                    disabled={cancelTradeMutation.isPending}
                  >
                    <Ban className="mr-2 h-4 w-4" /> Huỷ giao dịch
                  </PixelButton>
                </div>
              )}
            </div>
          </PixelBorder>
          
          <PixelBorder className="bg-dark rounded-lg p-5">
            <h3 className="text-lg font-semibold mb-4">Chat giao dịch</h3>
            <div className="h-64 overflow-y-auto mb-4 border border-gray-700 rounded-md p-3 space-y-3">
              {isLoadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <PixelLoader />
                </div>
              ) : messages && messages.length > 0 ? (
                messages.map((msg: Message) => (
                  <div key={msg.id} className={`flex items-start ${msg.senderId === user?.id ? 'justify-end' : ''}`}>
                    {msg.senderId !== user?.id && (
                      <UserAvatar 
                        username={isSeller ? (otherUser?.username || 'user') : user?.username || 'user'} 
                        className="w-8 h-8 mr-2" 
                      />
                    )}
                    <div className={`p-2 rounded-md max-w-[80%] ${msg.senderId === user?.id ? 'bg-primary/20' : 'bg-gray-800'}`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs text-gray-400">{formatDate(msg.createdAt)}</p>
                    </div>
                    {msg.senderId === user?.id && (
                      <UserAvatar 
                        username={user.username} 
                        className="w-8 h-8 ml-2" 
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-gray-400">No messages yet</p>
                </div>
              )}
            </div>
            
            <div className="flex">
              <Input 
                className="flex-grow px-3 py-2 bg-dark border-2 border-gray-700 rounded-l focus:border-primary focus:outline-none text-light"
                placeholder="Nhập tin nhắn..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <PixelButton 
                className="px-4 py-2 rounded-r"
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending || !message.trim()}
              >
                <Send className="h-4 w-4" />
              </PixelButton>
            </div>
          </PixelBorder>
        </div>
      </div>
      
      {/* Account Info Modal */}
      {showAccountInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <PixelBorder className="bg-dark rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Gửi thông tin tài khoản</h3>
            <p className="text-sm text-gray-400 mb-4">
              Cảnh báo: Hãy gắn Gmail bảo vệ acc trước khi giao cho người mua. Nếu acc không có Gmail và xảy ra sự cố, chúng tôi miễn trách nhiệm vì đã cảnh báo trước.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Thông tin tài khoản</label>
              <textarea 
                className="w-full px-3 py-2 bg-dark border-2 border-gray-700 rounded focus:border-primary focus:outline-none text-light resize-none h-32"
                placeholder="Tên đăng nhập, mật khẩu, và các thông tin khác..."
                value={accountInfo}
                onChange={(e) => setAccountInfo(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <PixelButton 
                variant="secondary"
                onClick={() => setShowAccountInfoModal(false)}
              >
                Huỷ
              </PixelButton>
              <PixelButton 
                onClick={handleSendAccountInfo}
                disabled={!accountInfo.trim() || sendAccountMutation.isPending}
              >
                {sendAccountMutation.isPending ? "Đang gửi..." : "Gửi thông tin"}
              </PixelButton>
            </div>
          </PixelBorder>
        </div>
      )}
    </div>
  );
}

export default TradeRoom;
