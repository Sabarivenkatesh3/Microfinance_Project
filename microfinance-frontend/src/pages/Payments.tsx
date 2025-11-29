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
import { Loan } from "@/types";

export default function Payments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedLoanId, setSelectedLoanId] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => customerService.getAll(),
  });

  // Fetch all loans and filter by customer
  const { data: allLoans, isLoading } = useQuery({
    queryKey: ["loans"],
    queryFn: () => loanService.getAll(),
  });

  // Filter loans for selected customer
  const customerLoans = allLoans?.filter(
    (loan: Loan) => loan.customer_id === selectedCustomerId
  );

  const createPaymentMutation = useMutation({
    mutationFn: paymentService.create,
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Payment added successfully",
      });
      // Force refetch all related queries immediately
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["loans"], refetchType: "active" }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-summary"], refetchType: "active" }),
        queryClient.invalidateQueries({ queryKey: ["today-collection"], refetchType: "active" }),
        queryClient.invalidateQueries({ queryKey: ["customer-loans"], refetchType: "active" }),
      ]);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to add payment",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setSelectedCustomerId("");
    setSelectedLoanId("");
    setPaymentAmount("");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setNotes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLoanId || !paymentAmount) {
      toast({
        title: "Error",
        description: "Please select a loan and enter payment amount",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return;
    }

    createPaymentMutation.mutate({
      loan_id: selectedLoanId,
      paid_amount: amount,
      payment_date: paymentDate,
      notes: notes || undefined,
    });
  };

  // Get customer name by ID
  const getCustomerName = (customerId: string) => {
    const customer = customers?.find((c) => c.id === customerId);
    return customer?.name || "Unknown";
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Payments</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Record loan installment payments</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Payment
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Record New Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer Name</Label>
                  <Select value={selectedCustomerId} onValueChange={(val) => {
                    setSelectedCustomerId(val);
                    setSelectedLoanId(""); // Reset loan when customer changes
                  }}>
                    <SelectTrigger id="customer">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loan">Select Loan</Label>
                  <Select
                    value={selectedLoanId}
                    onValueChange={setSelectedLoanId}
                    disabled={!selectedCustomerId}
                  >
                    <SelectTrigger id="loan">
                      <SelectValue placeholder={selectedCustomerId ? "Select loan" : "Select customer first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {customerLoans?.map((loan: Loan) => (
                        <SelectItem key={loan.id} value={loan.id}>
                          ₹{Number(loan.principal_amount).toLocaleString()} - {loan.repayment_frequency} (₹{Number(loan.installment_amount).toLocaleString()}/installment)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount Received</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="Enter amount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Payment Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Add any notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" disabled={createPaymentMutation.isPending} className="w-full sm:w-auto">
                  {createPaymentMutation.isPending ? "Processing..." : "Record Payment"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="w-full sm:w-auto">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Active Loans</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          {isLoading ? (
            <div className="text-center py-8">Loading loans...</div>
          ) : allLoans && allLoans.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Customer</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead className="hidden sm:table-cell">Total Amount</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead className="hidden sm:table-cell">Start Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allLoans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        {getCustomerName(loan.customer_id)}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">₹{Number(loan.principal_amount).toLocaleString()}</TableCell>
                      <TableCell className="hidden sm:table-cell">₹{Number(loan.total_amount).toLocaleString()}</TableCell>
                      <TableCell className="capitalize text-xs sm:text-sm">{loan.repayment_frequency}</TableCell>
                      <TableCell className="hidden sm:table-cell">{new Date(loan.start_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="default" className="text-xs">{loan.status || 'Active'}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8 text-sm">No active loans found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
