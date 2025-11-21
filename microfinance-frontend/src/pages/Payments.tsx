import { useQuery } from "@tanstack/react-query";
import { loanService } from "@/services/loanService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Payments() {
  const { data: loans, isLoading } = useQuery({
    queryKey: ["loans"],
    queryFn: () => loanService.getAll(),
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading payments...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground">View all loan payments across the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Loans</CardTitle>
        </CardHeader>
        <CardContent>
          {loans && loans.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium font-mono text-xs">{loan.customer_id.slice(0, 8)}...</TableCell>
                    <TableCell>₹{loan.principal_amount.toLocaleString()}</TableCell>
                    <TableCell>₹{loan.total_amount.toLocaleString()}</TableCell>
                    <TableCell className="capitalize">{loan.repayment_frequency}</TableCell>
                    <TableCell>{new Date(loan.start_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="default">Active</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No loans found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
