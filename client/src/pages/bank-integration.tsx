import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, RefreshCw, Unlink, CreditCard, DollarSign, TrendingUp, TrendingDown } from "lucide-react";

// Plaid Link integration
declare global {
  interface Window {
    Plaid: {
      create: (config: PlaidConfig) => PlaidHandler;
    };
  }
}

interface PlaidConfig {
  token: string;
  onSuccess: (public_token: string, metadata: any) => void;
  onLoad?: () => void;
  onExit?: (err: any, metadata: any) => void;
  onEvent?: (eventName: string, metadata: any) => void;
  env: string;
}

interface PlaidHandler {
  open: () => void;
  exit: (options?: { force: boolean }) => void;
  destroy: () => void;
}

interface BankAccount {
  id: string;
  name: string;
  officialName: string;
  type: string;
  subtype: string;
  balance: number;
  currency: string;
  plaidAccountId: string;
  isActive: boolean;
}

interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  date: string;
  name: string;
  merchantName?: string;
  category: string[];
  subcategory?: string;
  pending: boolean;
}

interface AccountBalance {
  accountId: string;
  accountName: string;
  current: number;
  available?: number;
  currency: string;
}

export default function BankIntegration() {
  const [userId] = useState(() => `user-${Math.random().toString(36).substr(2, 9)}`);
  const [plaidHandler, setPlaidHandler] = useState<PlaidHandler | null>(null);
  const [linkToken, setLinkToken] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load Plaid Link script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";
    script.async = true;
    script.onload = () => {
      console.log("Plaid Link script loaded");
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Fetch bank accounts
  const { data: accounts = [], isLoading: accountsLoading, refetch: refetchAccounts } = useQuery({
    queryKey: ["/api/bank/accounts", userId],
    queryFn: () => apiRequest("GET", `/api/bank/accounts/${userId}`),
  });

  // Fetch account balances
  const { data: balances = [], isLoading: balancesLoading, refetch: refetchBalances } = useQuery({
    queryKey: ["/api/bank/balances", userId],
    queryFn: () => apiRequest("GET", `/api/bank/balances/${userId}`),
    enabled: accounts.length > 0,
  });

  // Fetch recent transactions
  const { data: transactions = [], isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery({
    queryKey: ["/api/bank/transactions", userId],
    queryFn: () => apiRequest("GET", `/api/bank/transactions/${userId}?limit=20`),
    enabled: accounts.length > 0,
  });

  // Create link token mutation
  const createLinkTokenMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/bank/create-link-token", { userId }),
    onSuccess: (data: { linkToken: string }) => {
      setLinkToken(data.linkToken);
      initializePlaidLink(data.linkToken);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create bank connection link",
        variant: "destructive",
      });
    },
  });

  // Exchange token mutation
  const exchangeTokenMutation = useMutation({
    mutationFn: (publicToken: string) => 
      apiRequest("POST", "/api/bank/exchange-token", { userId, publicToken }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bank account connected successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bank/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bank/balances"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to connect bank account",
        variant: "destructive",
      });
    },
  });

  // Sync transactions mutation
  const syncTransactionsMutation = useMutation({
    mutationFn: (accountId?: string) => 
      apiRequest("POST", "/api/bank/sync-transactions", { userId, accountId }),
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Synced ${data.count} transactions`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bank/transactions"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to sync transactions",
        variant: "destructive",
      });
    },
  });

  // Disconnect account mutation
  const disconnectMutation = useMutation({
    mutationFn: (accountId: string) => 
      apiRequest("POST", "/api/bank/disconnect", { userId, accountId }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bank account disconnected",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bank/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bank/balances"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bank/transactions"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to disconnect bank account",
        variant: "destructive",
      });
    },
  });

  const initializePlaidLink = (token: string) => {
    if (window.Plaid && token) {
      const handler = window.Plaid.create({
        token,
        onSuccess: (public_token: string, metadata: any) => {
          console.log("Plaid Link success:", { public_token, metadata });
          exchangeTokenMutation.mutate(public_token);
        },
        onLoad: () => {
          console.log("Plaid Link loaded");
        },
        onExit: (err: any, metadata: any) => {
          if (err) {
            console.error("Plaid Link exit error:", err);
            toast({
              title: "Connection Cancelled",
              description: "Bank account connection was cancelled",
              variant: "destructive",
            });
          }
        },
        onEvent: (eventName: string, metadata: any) => {
          console.log("Plaid Link event:", eventName, metadata);
        },
        env: "sandbox", // Use sandbox for testing
      });
      
      setPlaidHandler(handler);
    }
  };

  const handleConnectBank = () => {
    if (plaidHandler) {
      plaidHandler.open();
    } else {
      createLinkTokenMutation.mutate();
    }
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getCategoryIcon = (category: string[]) => {
    const mainCategory = category[0]?.toLowerCase() || "";
    if (mainCategory.includes("food") || mainCategory.includes("restaurant")) return "🍽️";
    if (mainCategory.includes("gas") || mainCategory.includes("transportation")) return "⛽";
    if (mainCategory.includes("shop") || mainCategory.includes("retail")) return "🛍️";
    if (mainCategory.includes("entertainment")) return "🎬";
    if (mainCategory.includes("bill") || mainCategory.includes("utilities")) return "💡";
    return "💳";
  };

  const totalBalance = balances.reduce((sum: number, balance: AccountBalance) => sum + balance.current, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bank Integration</h1>
          <p className="text-muted-foreground">Connect your bank accounts to track real financial data</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              refetchAccounts();
              refetchBalances();
              refetchTransactions();
            }}
            variant="outline"
            size="sm"
            disabled={accountsLoading || balancesLoading || transactionsLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleConnectBank}
            disabled={createLinkTokenMutation.isPending || exchangeTokenMutation.isPending}
          >
            {createLinkTokenMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Connect Bank Account
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {balancesLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                formatCurrency(totalBalance)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.length}</div>
            <p className="text-xs text-muted-foregreen">
              {accounts.filter((acc: BankAccount) => acc.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Bank Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>Your linked bank accounts and current balances</CardDescription>
        </CardHeader>
        <CardContent>
          {accountsLoading || balancesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading accounts...
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No bank accounts connected yet</p>
              <p className="text-sm">Click "Connect Bank Account" to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account: BankAccount) => {
                const balance = balances.find((b: AccountBalance) => b.accountId === account.id);
                return (
                  <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <CreditCard className="w-8 h-8 text-blue-500" />
                      <div>
                        <h3 className="font-medium">{account.name || account.officialName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {account.type} • {account.subtype}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {balance && (
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(balance.current)}</p>
                          {balance.available && balance.available !== balance.current && (
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(balance.available)} available
                            </p>
                          )}
                        </div>
                      )}
                      <Button
                        onClick={() => disconnectMutation.mutate(account.id)}
                        variant="outline"
                        size="sm"
                        disabled={disconnectMutation.isPending}
                      >
                        <Unlink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              <div className="pt-4">
                <Button
                  onClick={() => syncTransactionsMutation.mutate()}
                  disabled={syncTransactionsMutation.isPending}
                  className="w-full"
                >
                  {syncTransactionsMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Sync All Transactions
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest transactions from your connected accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No transactions found</p>
              <p className="text-sm">Connect bank accounts and sync transactions to see your activity</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 10).map((transaction: Transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getCategoryIcon(transaction.category)}</span>
                    <div>
                      <p className="font-medium">{transaction.name}</p>
                      {transaction.merchantName && (
                        <p className="text-sm text-muted-foreground">{transaction.merchantName}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {transaction.category.join(" • ")} • {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {transaction.pending && (
                      <Badge variant="secondary" className="text-xs">Pending</Badge>
                    )}
                    <span className={`font-medium ${transaction.amount < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount < 0 ? (
                        <TrendingDown className="w-4 h-4 inline mr-1" />
                      ) : (
                        <TrendingUp className="w-4 h-4 inline mr-1" />
                      )}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </span>
                  </div>
                </div>
              ))}
              {transactions.length > 10 && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm">
                    View All Transactions ({transactions.length})
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}