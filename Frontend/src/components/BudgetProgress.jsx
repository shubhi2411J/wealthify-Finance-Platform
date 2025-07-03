import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Check, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import { Progress } from "./ui/progress";

const BudgetProgress = ({
  initialBudget,
  currentExpenses,
  handleRevalidate,
  revalidate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.$numberDecimal || ""
  );
  const REACT_APP_BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;
  const percentUsed = initialBudget
    ? (currentExpenses / initialBudget.amount.$numberDecimal) * 100
    : 0;

  const [loading, setLoading] = useState(false);
  const { isSignedIn, user } = useUser();
  const [submitted, setSubmitted] = useState(false);

  const handleUpdate = () => {
   
    setSubmitted(true);
    setLoading(true);
  };

  useEffect(() => {
    if (submitted) {
      const amount = parseFloat(newBudget);

      if (isNaN(amount) || amount <= 0) {
        toast.error("Please enter valid amount",{position: "top-center", });
       setIsEditing(false)
       setLoading(false)
       setSubmitted(false)
        return;
      }
     

      axios
        .put(`${REACT_APP_BACKEND_URL}/dashboard/budget`, {
          userId: user.id,
          amount: amount,
        })
        .then((response) => {
          setNewBudget(response.data);
          setIsEditing(false);
          handleRevalidate(!revalidate);
          toast.success("Budget set Successfully",{position: "top-center", });
        })
        .catch((error) => {
          toast.error("Failed to set budget",{position: "top-center", });
        });
      setLoading(false);
      setSubmitted(false);
    }
  }, [submitted]);

  const handleCancel = () => {
    setNewBudget(initialBudget?.amount.$numberDecimal || "");
    setIsEditing(false);
  };

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div className="flex-1">
            <CardTitle>Monthly Budget (Default Account)</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={newBudget}
                    onChange={(e) => {
                      setNewBudget(e.target.value);
                    }}
                    className="w-32 "
                    placeholder="Enter amount"
                    autoFocus
                    disabled={loading}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleUpdate}
                    disabled={loading}
                  >
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ) : (
                <>
                  {" "}
                  <CardDescription>
                    {initialBudget
                      ? `₹${currentExpenses.toFixed(2)} of ₹${
                          initialBudget.amount.$numberDecimal
                        } spent`
                      : "No budget set"}
                  </CardDescription>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      setIsEditing(true);
                    }}
                  >
                    <Pencil />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {initialBudget && (
            <div className="space-y-2">
              <Progress
                value={percentUsed}
                extraStyles={`${
                  percentUsed >= 90
                    ? "bg-red-500"
                    : percentUsed >= 75
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
              />
              <p className="text-xs text-muted-foreground text-right">{percentUsed.toFixed(1)}% used</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetProgress;
