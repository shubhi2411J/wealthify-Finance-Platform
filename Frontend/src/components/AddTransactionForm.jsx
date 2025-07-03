import { transactionSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import CreateAccountDrawer from "./CreateAccountDrawer";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Switch } from "./ui/switch";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router";
import ReceiptScanner from "./ReceiptScanner";

const AddTransactionForm = ({
  accounts,
  categories,
  editMode = false,
  initialData = null,
}) => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const REACT_APP_BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    getValues,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
            type: initialData.type,
            amount: initialData.amount.$numberDecimal,
            description: initialData.description,
            accountId: initialData.accountId,
            category: initialData.category,
            date: new Date(initialData.date),
            isRecurring: initialData.isRecurring,
            ...(initialData.recurringInterval && {
              recurringInterval: initialData.recurringInterval,
            }),
          }
        : {
            type: "EXPENSE",
            amount: "",
            category:"",
            description: "",
            accountId: accounts.find((ac) => ac.isDefault)?._id,
            date: new Date(),
            isRecurring: false,
          },
  });

  const type = watch("type");
  const date = watch("date");
  const isRecurring = watch("isRecurring");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { isSignedIn, user } = useUser();
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setsubmittedData] = useState(null);

  const filterCategories = categories.filter(
    (category) => category.type === type
  );
  const [updatedTransaction, setUpdatedTransaction] = useState(null);

  const onSubmit = async (data) => {
    setSubmitted(true);
    setLoading(true);
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
    };

    setsubmittedData(formData);
  };

  useEffect(() => {
    if (submittedData) {
      if (editMode) {
        axios
          .put(`${REACT_APP_BACKEND_URL}/transaction/edit/${editId}`, {
            userId: user.id,
            data: submittedData,
          })
          .then((response) => {
            setUpdatedTransaction(response.data);
            toast.success("Transaction updated successfully", {
              position: "top-center",
            });

            setLoading(false);
            setSubmitted(false);
          })
          .catch((error) => {
            if (error.response.data.error) {
              toast.error(error.message || "Failed to update transaction", {
                position: "top-center",
              });
            } else {
              toast.error(error.message || "Failed to update transaction", {
                position: "top-center",
              });
            }
          });
      } else {
        axios
          .post(`${REACT_APP_BACKEND_URL}/transaction/create`, {
            userId: user.id,
            data: submittedData,
          })
          .then((response) => {
            setCurrentTransaction(response.data);
            toast.success("Transaction created successfully", {
              position: "top-center",
            });
            reset();
            setLoading(false);
            setSubmitted(false);
          })
          .catch((error) => {
            if (error.response.data.error) {
              toast.warning(
                error.response.data.error || "Failed to create transaction",
                { position: "top-center" }
              );
            } else {
              toast.error(error.message || "Failed to create transaction", {
                position: "top-center",
              });
            }
            setLoading(false);
            setSubmitted(false);
          });
      }
    }
  }, [submittedData]);

  const handleRevalidate = (transaction) => {
    editMode
      ? navigate(`/dashboard/account/${transaction.accountId}`)
      : navigate(`/dashboard/account/${transaction.accountId}`);
  };
  if (currentTransaction) {
    handleRevalidate(currentTransaction);
  }
  if (updatedTransaction) {
    handleRevalidate(updatedTransaction);
  }

  const handleScanComplete = (scannedData) => {
   
      setValue("amount", scannedData.amount.toString());
      setValue("date", new Date(scannedData.date));
      if (scannedData.description) {
        setValue("description", scannedData.description);
      }
      if (scannedData.category) {
        setValue("category", scannedData.category);
      }
    
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {/* AI receipt scanner */}
      {!editMode && <ReceiptScanner onScanComplete={handleScanComplete} />}

      <div className="space-y-2">
        <label className="text-sm font-medium">Type</label>
        <Select
          onValueChange={(value) => setValue("type", value)}
          defaultValue={type}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXPENSE">Expense</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("amount")}
          />
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Account</label>
          <Select
            onValueChange={(value) => setValue("accountId", value)}
            defaultValue={getValues("accountId")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account._id} value={account._id}>
                  {account.name} (₹{parseFloat(account.balance.$numberDecimal).toFixed(2)})
                </SelectItem>
              ))}
              <CreateAccountDrawer>
                <Button
                  variant="ghost"
                  className="w-full select-none items-center text-sm outline-none"
                >
                  Create Account
                </Button>
              </CreateAccountDrawer>
            </SelectContent>
          </Select>
          {errors.accountId && (
            <p className="text-sm text-red-500">{errors.accountId.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select
          onValueChange={(value) => setValue("category", value)}
          defaultValue={getValues("category")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {filterCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <div>
              <Button
                variant="outline"
                className="w-full pl-3 text-left font-normal"
                type="button"
              >
                {date ? format(date, "PPP") : <span>Pick a date</span>}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => setValue("date", date)}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
            />
          </PopoverContent>
        </Popover>

        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Input placeholder="Enter description" {...register("description")} />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-between items-center rounded-lg border p-3">
        <div className="space-y-0.5">
          <label className="text-sm font-medium cursor-pointer">
            Recurring Transaction
          </label>
          <p className="text-sm text-muted-foreground">
            Set up a recurring schedule for this transaction
          </p>{" "}
        </div>
        <Switch
          onCheckedChange={(checked) => setValue("isRecurring", checked)}
          checked={isRecurring}
        />
      </div>

      {isRecurring && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Recurring Interval</label>
          <Select
            onValueChange={(value) => setValue("recurringInterval", value)}
            defaultValue={getValues("recurringInterval")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>
          {errors.recurringInterval && (
            <p className="text-sm text-red-500">
              {errors.recurringInterval.message}
            </p>
          )}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => navigate("/dashboard")}
        >
          Cancel
        </Button>
        <Button type="submit" className="w-full mb-2" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {editMode ? "Updating..." : "Creating..."}
            </>
          ) : editMode ? (
            "Update Transaction"
          ) : (
            "Create Transaction"
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddTransactionForm;
