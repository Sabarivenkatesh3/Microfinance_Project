import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { customerService } from "@/services/customerService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Ledger() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => customerService.getAll(),
  });

  const { data: ledger, isLoading } = useQuery({
    queryKey: ["customer-ledger", selectedCustomerId],
    queryFn: () => customerService.getLedger(selectedCustomerId),
    enabled: !!selectedCustomerId,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ledger</h1>
        <p className="text-muted-foreground">View customer transaction ledger</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a customer" />
            </SelectTrigger>
            <SelectContent>
              {customers?.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name} - {customer.phone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCustomerId && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8">Loading ledger...</p>
            ) : ledger && ledger.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Loan ID</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledger.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                      <TableCell className="capitalize">{entry.type}</TableCell>
                      <TableCell className="font-mono text-xs">{entry.loan_id.slice(0, 8)}...</TableCell>
                      <TableCell className="text-right text-destructive">
                        {entry.debit ? `₹${entry.debit.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell className="text-right text-success">
                        {entry.credit ? `₹${entry.credit.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{entry.balance.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">No transactions found</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
