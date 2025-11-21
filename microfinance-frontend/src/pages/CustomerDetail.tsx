import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { customerService } from "@/services/customerService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Phone, MapPin, FileText } from "lucide-react";

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", id],
    queryFn: () => customerService.getById(id!),
    enabled: !!id,
  });

  const { data: loans } = useQuery({
    queryKey: ["customer-loans", id],
    queryFn: () => customerService.getLoans(id!),
    enabled: !!id,
  });

  const { data: ledger } = useQuery({
    queryKey: ["customer-ledger", id],
    queryFn: () => customerService.getLedger(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading customer details...</div>;
  }

  if (!customer) {
    return <div className="text-center py-8">Customer not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/customers")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{customer.name}</h1>
          <p className="text-muted-foreground">Customer Details</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Phone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{customer.phone}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Address</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{customer.address}</p>
          </CardContent>
        </Card>

        {customer.id_proof_url && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">ID Proof</CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={customer.id_proof_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View Document
              </a>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="loans" className="w-full">
        <TabsList>
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="loans">
          <Card>
            <CardHeader>
              <CardTitle>Loan History</CardTitle>
            </CardHeader>
            <CardContent>
              {loans && loans.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loan ID</TableHead>
                      <TableHead>Principal</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loans.map((loan: any) => (
                      <TableRow key={loan.id}>
                        <TableCell className="font-mono text-sm">{loan.id.slice(0, 8)}</TableCell>
                        <TableCell>₹{loan.principal_amount.toLocaleString()}</TableCell>
                        <TableCell>₹{loan.total_amount.toLocaleString()}</TableCell>
                        <TableCell>{new Date(loan.start_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className="rounded-full bg-success/10 px-2 py-1 text-xs text-success">
                            Active
                          </span>
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
        </TabsContent>

        <TabsContent value="ledger">
          <Card>
            <CardHeader>
              <CardTitle>Payment Ledger</CardTitle>
            </CardHeader>
            <CardContent>
              {ledger && ledger.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Debit</TableHead>
                      <TableHead>Credit</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledger.map((entry: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell>{entry.debit > 0 ? `₹${entry.debit.toLocaleString()}` : "-"}</TableCell>
                        <TableCell>{entry.credit > 0 ? `₹${entry.credit.toLocaleString()}` : "-"}</TableCell>
                        <TableCell className="text-right font-medium">₹{entry.balance.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No ledger entries found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
