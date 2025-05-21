import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/lib/AuthProvider";
import { PixelBorder } from "@/components/ui/pixel-border";
import { PixelProgress } from "@/components/ui/pixel-progress";
import { PixelButton } from "@/components/ui/pixel-button";
import { Star, StarHalf, Check, Clock, Award } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: transactions } = useQuery({
    queryKey: ['/api/transactions/recent'],
  });
  
  const { data: stats } = useQuery({
    queryKey: ['/api/users/stats'],
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-pixel text-primary">Dashboard</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <PixelBorder className="bg-card p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Giao dịch hoàn thành</h3>
          <div className="flex items-end">
            <span className="text-3xl font-pixel text-secondary">{stats?.completedTransactions || 0}</span>
            <span className="text-green-400 ml-2 text-sm">
              <span className="inline-flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                12%
              </span>
            </span>
          </div>
        </PixelBorder>
        
        <PixelBorder className="bg-card p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Đánh giá</h3>
          <div className="flex items-center">
            <span className="text-3xl font-pixel text-accent">{stats?.ratingAverage || '0.0'}</span>
            <div className="ml-2">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
                <StarHalf className="w-4 h-4 fill-current" />
              </div>
              <span className="text-sm text-muted-foreground">từ {stats?.ratingCount || 0} giao dịch</span>
            </div>
          </div>
        </PixelBorder>
        
        <PixelBorder className="bg-card p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Giao dịch đang xử lý</h3>
          <div className="flex items-end">
            <span className="text-3xl font-pixel text-warning">{stats?.pendingTransactions || 0}</span>
            <Link href="/history">
              <a className="ml-3 text-primary text-sm">
                Xem chi tiết 
                <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </Link>
          </div>
        </PixelBorder>
      </div>
      
      <PixelBorder className="bg-card rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Hoạt động gần đây</h3>
        <div className="space-y-4">
          {transactions && transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center p-2 hover:bg-primary/10 rounded-md cursor-pointer">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.status === 'completed' 
                    ? 'bg-secondary/20' 
                    : transaction.status === 'processing' 
                      ? 'bg-warning/20' 
                      : 'bg-accent/20'
                }`}>
                  {transaction.status === 'completed' ? (
                    <Check className={`w-5 h-5 text-secondary`} />
                  ) : transaction.status === 'processing' ? (
                    <Clock className={`w-5 h-5 text-warning`} />
                  ) : (
                    <Award className={`w-5 h-5 text-accent`} />
                  )}
                </div>
                <div className="ml-3 flex-grow">
                  <p className="font-medium">{transaction.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.status === 'completed' 
                      ? `với ${transaction.partnerName}`
                      : transaction.status === 'processing'
                        ? `với ${transaction.partnerName}`
                        : `từ ${transaction.partnerName}`
                    }
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">{transaction.timeAgo}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Chưa có hoạt động nào.
            </div>
          )}
        </div>
      </PixelBorder>
      
      <PixelBorder className="bg-card rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Thống kê giao dịch</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Mua bán</p>
            <PixelProgress value={stats?.buyingSellingStat || 65} />
            <p className="text-right text-sm mt-1">{stats?.buyingSellingStat || 65}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Cày thuê</p>
            <PixelProgress value={stats?.boostingStat || 35} />
            <p className="text-right text-sm mt-1">{stats?.boostingStat || 35}%</p>
          </div>
        </div>
        
        <div className="flex justify-center mt-6">
          <PixelButton variant="secondary" size="sm" asChild>
            <Link href="/create-room">
              <a>Tạo giao dịch mới</a>
            </Link>
          </PixelButton>
        </div>
      </PixelBorder>
    </div>
  );
}
