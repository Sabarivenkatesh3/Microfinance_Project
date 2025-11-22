import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { customerService } from "@/services/customerService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Ledger() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => customerService.getAll(),
  });

  const { data: ledgerData, isLoading } = useQuery({
    queryKey: ["customer-ledger", selectedCustomerId],
    queryFn: () => customerService.getLedger(selectedCustomerId),
    enabled: !!selectedCustomerId,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ledger</h1>
        <p className="text-muted-foreground">View detailed customer transaction ledger</p>
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

      {selectedCustomerId && ledgerData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-lg font-semibold">{ledgerData.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-lg font-semibold">{ledgerData.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer ID</p>
                  <p className="text-lg font-mono text-xs">{ledgerData.customer_id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <p className="text-center py-8">Loading ledger...</p>
          ) : ledgerData.ledger && ledgerData.ledger.length > 0 ? (
            <div className="space-y-6">
              {ledgerData.ledger.map((loan, index) => (
                <Card key={loan.loan_id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Loan #{index + 1} - {loan.status}
                      </CardTitle>
                      {loan.is_overdue && (
                        <Badge variant="destructive">
                          Overdue by {loan.overdue_days} days
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Principal</p>
                        <p className="text-lg font-semibold">₹{loan.principal_amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Interest</p>
                        <p className="text-lg font-semibold">₹{loan.interest_amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="text-lg font-semibold">₹{loan.total_amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Installment</p>
                        <p className="text-lg font-semibold">₹{loan.installment_amount.toLocaleString()}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Paid</p>
                        <p className="text-lg font-semibold text-success">₹{loan.total_paid.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Remaining</p>
                        <p className="text-lg font-semibold text-warning">₹{loan.remaining_amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Installments Paid</p>
                        <p className="text-lg font-semibold">{loan.installments_paid} / {loan.number_of_installments}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Remaining</p>
                        <p className="text-lg font-semibold">{loan.installments_remaining}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Start Date</p>
                        <p className="font-medium">{new Date(loan.start_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">End Date</p>
                        <p className="font-medium">{new Date(loan.end_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Next Due Date</p>
                        <p className="font-medium">
                          {loan.next_due_date ? new Date(loan.next_due_date).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                    </div>

                    {loan.payments && loan.payments.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-3">Payment History</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Notes</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {loan.payments.map((payment) => (
                                <TableRow key={payment.payment_id}>
                                  <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                                  <TableCell className="text-success font-semibold">
                                    ₹{payment.amount.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">
                                    {payment.notes || "-"}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">No loan history found for this customer</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
