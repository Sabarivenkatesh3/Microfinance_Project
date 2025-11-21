import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loanService } from "@/services/loanService";
import { paymentService } from "@/services/paymentService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";

export default function LoanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  const { data: summary, isLoading } = useQuery({
    queryKey: ["loan-summary", id],
    queryFn: () => loanService.getSummary(id!),
    enabled: !!id,
  });

  const { data: payments } = useQuery({
    queryKey: ["loan-payments", id],
    queryFn: () => paymentService.getByLoan(id!),
    enabled: !!id,
  });

  const createPaymentMutation = useMutation({
    mutationFn: paymentService.create,
    onSuccess: () => {
      toast.success("Payment recorded successfully!");
      queryClient.invalidateQueries({ queryKey: ["loan-summary", id] });
      queryClient.invalidateQueries({ queryKey: ["loan-payments", id] });
      setIsPaymentDialogOpen(false);
      setPaymentAmount("");
      setPaymentNotes("");
    },
    onError: () => {
      toast.error("Failed to record payment");
    },
  });

  const handleAddPayment = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    createPaymentMutation.mutate({
      loan_id: id!,
      paid_amount: parseFloat(paymentAmount),
      payment_date: new Date().toISOString().split("T")[0],
      notes: paymentNotes,
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading loan details...</div>;
  }

  if (!summary) {
    return <div className="text-center py-8">Loan not found</div>;
  }

  const progress = (summary.total_paid / summary.total_amount) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/loans")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Loan Details</h1>
            <p className="text-muted-foreground">{summary.customer_name}</p>
          </div>
        </div>
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Payment Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="1000"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Payment details..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                />
              </div>
              <Button onClick={handleAddPayment} disabled={createPaymentMutation.isPending}>
                {createPaymentMutation.isPending ? "Recording..." : "Record Payment"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Principal Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{summary.principal_amount.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{summary.total_amount.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">₹{summary.total_paid.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-warning">₹{summary.remaining.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-success transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{summary.installments_paid} / {summary.installments_paid + summary.installments_remaining} installments</span>
              <span>{summary.installment_amount.toLocaleString()} per installment</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Next Due Date</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">
              {summary.next_due_date ? new Date(summary.next_due_date).toLocaleDateString() : "Completed"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Overdue Days</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-lg font-medium ${summary.overdue_days > 0 ? "text-destructive" : ""}`}>
              {summary.overdue_days} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Last Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">
              {summary.last_payment_date ? new Date(summary.last_payment_date).toLocaleDateString() : "No payments yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments && payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-semibold text-success">₹{payment.paid_amount.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{payment.notes || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No payments recorded yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
