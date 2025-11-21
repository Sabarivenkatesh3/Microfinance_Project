import { useQuery } from "@tanstack/react-query";
import { loanService } from "@/services/loanService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function Loans() {
  const navigate = useNavigate();

  const { data: loans, isLoading } = useQuery({
    queryKey: ["loans"],
    queryFn: () => loanService.getAll(),
  });

  const getFrequencyBadge = (frequency: string) => {
    const colors = {
      daily: "bg-primary/10 text-primary",
      weekly: "bg-success/10 text-success",
      monthly: "bg-warning/10 text-warning",
    };
    return colors[frequency as keyof typeof colors] || colors.daily;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Loans</h1>
          <p className="text-muted-foreground">Manage loan applications and tracking</p>
        </div>
        <Button onClick={() => navigate("/loans/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Loan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Loans</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading loans...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan ID</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Installment</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans?.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-mono text-sm">{loan.id.slice(0, 8)}</TableCell>
                    <TableCell>₹{loan.principal_amount.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold">₹{loan.total_amount.toLocaleString()}</TableCell>
                    <TableCell>₹{loan.installment_amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getFrequencyBadge(loan.repayment_frequency)}>
                        {loan.repayment_frequency}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(loan.start_date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/loans/${loan.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
