import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { dashboardService } from "@/services/dashboardService";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Wallet, DollarSign, AlertCircle, TrendingUp, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const [showOverdueDialog, setShowOverdueDialog] = useState(false);

  const { data: summary, isLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: dashboardService.getSummary,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: todayCollection } = useQuery({
    queryKey: ["today-collection"],
    queryFn: dashboardService.getTodayCollection,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: overdueLoans } = useQuery({
    queryKey: ["overdue-loans"],
    queryFn: dashboardService.getOverdueLoans,
    enabled: showOverdueDialog,
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  const chartData = [
    { name: "Issued", value: summary?.total_issued || 0 },
    { name: "Collected", value: summary?.collected || 0 },
    { name: "Pending", value: summary?.pending || 0 },
  ];

  const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))"];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Overview of your microfinance operations</p>
      </div>

      {/* First row of stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Customers"
          value={summary?.total_customers || 0}
          icon={Users}
          variant="default"
          href="/customers"
        />
        <StatCard
          title="Active Loans"
          value={summary?.active_loans || 0}
          icon={Wallet}
          variant="success"
          href="/loans"
        />
        <StatCard
          title="Total Issued"
          value={`₹${(summary?.total_issued || 0).toLocaleString()}`}
          icon={TrendingUp}
          variant="default"
          href="/loans"
        />
        <StatCard
          title="Pending Amount"
          value={`₹${(summary?.pending || 0).toLocaleString()}`}
          icon={DollarSign}
          variant="warning"
          href="/payments"
        />
      </div>

      {/* Second row of stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Collection"
          value={`₹${(summary?.today_collection || 0).toLocaleString()}`}
          icon={DollarSign}
          variant="success"
          href="/payments"
        />
        <StatCard
          title="Due Today"
          value={summary?.due_today || 0}
          icon={Clock}
          variant="warning"
          href="/payments"
        />
        <StatCard
          title="Overdue Loans"
          value={summary?.overdue || 0}
          icon={AlertCircle}
          variant="destructive"
          onClick={() => setShowOverdueDialog(true)}
        />
        <StatCard
          title="Collected Amount"
          value={`₹${(summary?.collected || 0).toLocaleString()}`}
          icon={TrendingUp}
          variant="success"
          href="/payments"
        />
      </div>

      {/* Charts - Stack on mobile */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Financial Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Amount Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Today's Collections */}
      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Today's Collections</CardTitle>
        </CardHeader>
        <CardContent>
          {todayCollection && todayCollection.length > 0 ? (
            <div className="space-y-3">
              {todayCollection.slice(0, 5).map((collection, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium text-sm sm:text-base">{collection.customer_name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{collection.payment_date}</p>
                  </div>
                  <p className="font-semibold text-success text-sm sm:text-base">₹{collection.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4 text-sm">No collections today</p>
          )}
        </CardContent>
      </Card>

      {/* Overdue Loans Dialog */}
      <Dialog open={showOverdueDialog} onOpenChange={setShowOverdueDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Overdue Loans ({summary?.overdue || 0})
            </DialogTitle>
          </DialogHeader>
          {overdueLoans && overdueLoans.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Loan Amount</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Overdue Days</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueLoans.map((loan: any) => (
                    <TableRow 
                      key={loan.loan_id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setShowOverdueDialog(false);
                        navigate(`/loans/${loan.loan_id}`);
                      }}
                    >
                      <TableCell className="font-medium">{loan.customer_name}</TableCell>
                      <TableCell>₹{Number(loan.total_amount || 0).toLocaleString()}</TableCell>
                      <TableCell>₹{Number(loan.remaining || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">{loan.overdue_days} days</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-destructive border-destructive">
                          Overdue
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No overdue loans found</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
