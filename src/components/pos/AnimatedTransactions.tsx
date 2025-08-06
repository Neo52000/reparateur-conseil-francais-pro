import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  CreditCard, 
  Euro,
  TrendingUp,
  Zap
} from 'lucide-react';

interface Transaction {
  id: string;
  transaction_number: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  transaction_date: string;
  customer_name?: string;
  items: any[];
}

interface AnimatedTransactionsProps {
  transactions: Transaction[];
  newTransaction?: Transaction;
  sessionStats: {
    totalAmount: number;
    transactionCount: number;
    sessionNumber: string;
  };
}

const AnimatedTransactions: React.FC<AnimatedTransactionsProps> = ({
  transactions,
  newTransaction,
  sessionStats
}) => {
  const [animatingTransaction, setAnimatingTransaction] = useState<string | null>(null);
  const [statsAnimation, setStatsAnimation] = useState(false);

  useEffect(() => {
    if (newTransaction) {
      setAnimatingTransaction(newTransaction.id);
      setStatsAnimation(true);
      
      // Use effect cleanup with timer for animation duration
      const animationTimer = setTimeout(() => {
        setAnimatingTransaction(null);
        setStatsAnimation(false);
      }, 2000);
      
      return () => clearTimeout(animationTimer);
    }
  }, [newTransaction]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentIcon = (method: string) => {
    return method === 'cash' ? (
      <Euro className="w-4 h-4 text-emerald-600" />
    ) : (
      <CreditCard className="w-4 h-4 text-blue-600" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Statistiques animées */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={`transition-all duration-500 ${
          statsAnimation ? 'scale-105 shadow-lg border-emerald-200' : ''
        }`}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className={`w-6 h-6 text-emerald-600 ${
                statsAnimation ? 'animate-bounce' : ''
              }`} />
            </div>
            <div className="text-2xl font-bold text-emerald-600">
              {sessionStats.totalAmount.toFixed(2)}€
            </div>
            <div className="text-sm text-slate-600">Chiffre d'affaires</div>
          </CardContent>
        </Card>

        <Card className={`transition-all duration-500 ${
          statsAnimation ? 'scale-105 shadow-lg border-blue-200' : ''
        }`}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className={`w-6 h-6 text-blue-600 ${
                statsAnimation ? 'animate-pulse' : ''
              }`} />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {sessionStats.transactionCount}
            </div>
            <div className="text-sm text-slate-600">Transactions</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-lg font-bold text-purple-600">
              {sessionStats.sessionNumber}
            </div>
            <div className="text-sm text-slate-600">Session active</div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des transactions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            Dernières transactions
          </h3>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>Aucune transaction pour cette session</p>
              </div>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-all duration-500 ${
                    animatingTransaction === transaction.id
                      ? 'animate-slide-in-right bg-emerald-50 border-emerald-200 shadow-md scale-[1.02]'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      transaction.payment_method === 'cash' 
                        ? 'bg-emerald-100' 
                        : 'bg-blue-100'
                    }`}>
                      {getPaymentIcon(transaction.payment_method)}
                    </div>
                    
                    <div>
                      <div className="font-medium text-slate-900">
                        {transaction.transaction_number}
                      </div>
                      <div className="text-sm text-slate-500">
                        {transaction.customer_name || 'Client anonyme'} • 
                        {formatTime(transaction.transaction_date)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-lg text-slate-900">
                      {transaction.total_amount.toFixed(2)}€
                    </div>
                    <Badge variant="default" className="bg-emerald-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Validée
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimatedTransactions;