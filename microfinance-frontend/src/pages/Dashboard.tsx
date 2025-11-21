import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboardService";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wallet, DollarSign, AlertCircle, TrendingUp, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function Dashboard() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: dashboardService.getSummary,
  });

  const { data: todayCollection } = useQuery({
    queryKey: ["today-collection"],
    queryFn: dashboardService.getTodayCollection,
  });

  if (isLoading) {
    return <div className="text-center">Loading dashboard...</div>;
  }

  const chartData = [
    { name: "Issued", value: summary?.total_issued || 0 },
    { name: "Collected", value: summary?.collected || 0 },
    { name: "Pending", value: summary?.pending || 0 },
  ];

  const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your microfinance operations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Customers"
          value={summary?.total_customers || 0}
          icon={Users}
          variant="default"
        />
        <StatCard
          title="Active Loans"
          value={summary?.active_loans || 0}
          icon={Wallet}
          variant="success"
        />
        <StatCard
          title="Total Issued"
          value={`₹${(summary?.total_issued || 0).toLocaleString()}`}
          icon={TrendingUp}
          variant="default"
        />
        <StatCard
          title="Pending Amount"
          value={`₹${(summary?.pending || 0).toLocaleString()}`}
          icon={DollarSign}
          variant="warning"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Collection"
          value={`₹${(summary?.today_collection || 0).toLocaleString()}`}
          icon={DollarSign}
          variant="success"
        />
        <StatCard
          title="Due Today"
          value={summary?.due_today || 0}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Overdue Loans"
          value={summary?.overdue || 0}
          icon={AlertCircle}
          variant="destructive"
        />
        <StatCard
          title="Collected Amount"
          value={`₹${(summary?.collected || 0).toLocaleString()}`}
          icon={TrendingUp}
          variant="success"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Amount Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
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

      <Card>
        <CardHeader>
          <CardTitle>Today's Collections</CardTitle>
        </CardHeader>
        <CardContent>
          {todayCollection && todayCollection.length > 0 ? (
            <div className="space-y-3">
              {todayCollection.slice(0, 5).map((collection, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{collection.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{collection.payment_date}</p>
                  </div>
                  <p className="font-semibold text-success">₹{collection.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No collections today</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
