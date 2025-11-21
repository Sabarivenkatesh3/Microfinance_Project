import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loanService } from "@/services/loanService";
import { customerService } from "@/services/customerService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const loanSchema = z.object({
  customer_id: z.string().uuid("Please select a customer"),
  principal_amount: z.number().min(1, "Principal amount must be greater than 0"),
  interest_amount: z.number().min(0, "Interest amount cannot be negative"),
  installment_amount: z.number().min(1, "Installment amount must be greater than 0"),
  repayment_frequency: z.enum(["daily", "weekly", "monthly"]),
  start_date: z.string().min(1, "Start date is required"),
  notes: z.string().optional(),
});

type LoanFormData = z.infer<typeof loanSchema>;

export default function LoanForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => customerService.getAll(),
  });

  const form = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      customer_id: "",
      principal_amount: 0,
      interest_amount: 0,
      installment_amount: 0,
      repayment_frequency: "monthly",
      start_date: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: loanService.create,
    onSuccess: () => {
      toast.success("Loan created successfully!");
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      navigate("/loans");
    },
    onError: () => {
      toast.error("Failed to create loan");
    },
  });

  const onSubmit = (data: LoanFormData) => {
    createMutation.mutate({
      customer_id: data.customer_id,
      principal_amount: data.principal_amount,
      interest_amount: data.interest_amount,
      installment_amount: data.installment_amount,
      repayment_frequency: data.repayment_frequency,
      start_date: data.start_date,
      notes: data.notes,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/loans")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Loan</h1>
          <p className="text-muted-foreground">Issue a new loan to a customer</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loan Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="customer_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers?.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} - {customer.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="principal_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Principal Amount (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="10000"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="interest_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Amount (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2000"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="installment_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Installment Amount (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1000"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="repayment_frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repayment Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional information about this loan..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Loan"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/loans")}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
