import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService } from "@/services/customerService";
import { loanService } from "@/services/loanService";
import { paymentService } from "@/services/paymentService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

export default function Payments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => customerService.getAll(),
  });

  const { data: customerLoans } = useQuery({
    queryKey: ["customer-loans", selectedCustomerId],
    queryFn: () => customerService.getLoans(selectedCustomerId),
    enabled: !!selectedCustomerId,
  });

  const { data: allLoans, isLoading } = useQuery({
    queryKey: ["loans"],
    queryFn: () => loanService.getAll(),
  });

  const resetForm = () => {
    setShowForm(false);
    setSelectedCustomerId("");
    setSelectedLoanId("");
    setPaymentAmount("");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setNotes("");
  };

  const mutation = useMutation({
    mutationFn: paymentService.create,
    onSuccess: () => {
      toast({ title: "Success", description: "Payment added successfully" });

      // 🔥 Correct invalidation keys for refresh
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["loan-summary", selectedLoanId] });
      queryClient.invalidateQueries({ queryKey: ["loan-payments", selectedLoanId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["todayCollection"] });
      queryClient.invalidateQueries({ queryKey: ["ledger", selectedCustomerId] });

      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to record payment",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!selectedLoanId || !paymentAmount) {
      return toast({
        title: "Error",
        description: "Please select a loan and enter payment amount",
        variant: "destructive",
      });
    }

    mutation.mutate({
      loan_id: selectedLoanId,
      paid_amount: Number(paymentAmount),
      payment_date: paymentDate,
      notes: notes || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">Record loan installment payments</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" /> Add Payment
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Record New Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Customer</Label>
                  <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                    <SelectContent>
                      {customers?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} - {c.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Select Loan</Label>
                  <Select
                    value={selectedLoanId}
                    onValueChange={setSelectedLoanId}
                    disabled={!selectedCustomerId}
                  >
                    <SelectTrigger><SelectValue placeholder="Select loan" /></SelectTrigger>
                    <SelectContent>
                      {customerLoans?.map((loan) => (
                        <SelectItem key={loan.id} value={loan.id}>
                          ₹{loan.installment_amount} / {loan.repayment_frequency} — Bal: ₹
                          {(loan.total_amount - loan.total_paid).toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Amount Received</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Payment Date</Label>
                  <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
                </div>

                <div className="md:col-span-2">
                  <Label>Notes (optional)</Label>
                  <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Saving..." : "Record Payment"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active Loans</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Installment</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allLoans?.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-mono text-xs">{loan.customer_id.slice(0, 8)}...</TableCell>
                    <TableCell>₹{loan.principal_amount}</TableCell>
                    <TableCell className="font-semibold">₹{loan.total_amount}</TableCell>
                    <TableCell>₹{loan.installment_amount}</TableCell>
                    <TableCell>{new Date(loan.start_date).toLocaleDateString()}</TableCell>
                    <TableCell><Badge>Active</Badge></TableCell>
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
