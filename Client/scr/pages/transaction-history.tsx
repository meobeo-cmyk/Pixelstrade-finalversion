import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { PixelBorder } from "@/components/ui/pixel-border";
import { PixelButton } from "@/components/ui/pixel-button";

type TransactionType = 'all' | 'buy_sell' | 'boosting';
type SortOption = 'newest' | 'oldest' | 'highest_price' | 'lowest_price';

export default function TransactionHistory() {
  const [transactionType, setTransactionType] = useState<TransactionType>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data, isLoading } = useQuery({
    queryKey: ['/api/transactions/history', transactionType, sortOption, currentPage],
  });
  
  const transactions = data?.transactions || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.totalCount || 0;
  
  const getStatusClassName = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-secondary/20 text-secondary';
      case 'processing':
        return 'bg-warning/20 text-warning';
      case 'canceled':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-muted/20 text-muted-foreground';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'processing':
        return 'Đang xử lý';
      case 'canceled':
        return 'Đã hủy';
      default:
        return 'Chờ xác nhận';
    }
  };
  
  const getTypeLabel = (type: string) => {
    return type === 'buy_sell' ? 'Mua bán' : 'Cày thuê';
  };
  
  const getTypeClassName = (type: string) => {
    return type === 'buy_sell' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent';
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-pixel text-primary">Lịch Sử Giao Dịch</h2>
        <p className="text-muted-foreground">Xem lại các giao dịch đã tham gia</p>
      </div>
      
      <PixelBorder className="bg-card rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <PixelButton 
              variant={transactionType === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTransactionType('all')}
            >
              Tất cả
            </PixelButton>
            <PixelButton 
              variant={transactionType === 'buy_sell' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTransactionType('buy_sell')}
            >
              Mua bán
            </PixelButton>
            <PixelButton 
              variant={transactionType === 'boosting' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTransactionType('boosting')}
            >
              Cày thuê
            </PixelButton>
          </div>
          <div>
            <select 
              className="bg-card border border-border rounded p-1 text-foreground"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="highest_price">Giá cao nhất</option>
              <option value="lowest_price">Giá thấp nhất</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Không tìm thấy giao dịch nào.
            </div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-3 px-4">Mã</th>
                  <th className="py-3 px-4">Loại</th>
                  <th className="py-3 px-4">Đối tác</th>
                  <th className="py-3 px-4">Giá</th>
                  <th className="py-3 px-4">Ngày</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-border hover:bg-primary/5">
                    <td className="py-3 px-4 font-mono">#{transaction.id}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${getTypeClassName(transaction.type)}`}>
                        {getTypeLabel(transaction.type)}
                      </span>
                    </td>
                    <td className="py-3 px-4">{transaction.partnerName}</td>
                    <td className="py-3 px-4 text-secondary">{transaction.price} xu</td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusClassName(transaction.status)}`}>
                        {getStatusLabel(transaction.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/room/${transaction.id}`}>
                        <a className="text-primary hover:underline text-sm">Xem</a>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Hiển thị {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, totalCount)} của {totalCount} giao dịch
            </div>
            <div className="flex space-x-1">
              <button 
                className={`w-8 h-8 flex items-center justify-center rounded-md ${
                  currentPage === 1 
                    ? 'bg-muted/10 text-muted-foreground' 
                    : 'bg-primary/10 text-foreground hover:bg-primary/20'
                }`}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => Math.abs(page - currentPage) < 2 || page === 1 || page === totalPages)
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="w-8 h-8 flex items-center justify-center">...</span>
                    )}
                    <button 
                      className={`w-8 h-8 flex items-center justify-center rounded-md ${
                        page === currentPage 
                          ? 'bg-primary text-white' 
                          : 'bg-primary/10 text-foreground hover:bg-primary/20'
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
              
              <button 
                className={`w-8 h-8 flex items-center justify-center rounded-md ${
                  currentPage === totalPages 
                    ? 'bg-muted/10 text-muted-foreground' 
                    : 'bg-primary/10 text-foreground hover:bg-primary/20'
                }`}
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </PixelBorder>
    </div>
  );
}
