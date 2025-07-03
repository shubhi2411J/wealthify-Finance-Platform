import React, { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import accountSchema from "@/lib/schema";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { useEffect } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const CreateAccountDrawer = ({
  children,
  handleAccountRefresh,
  getAccountRefresh,
}) => {
  const REACT_APP_BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { isSignedIn, user } = useUser();
  const [currentUser, setCurrentUser] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setsubmittedData] = useState();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: "",
      isDefault: false,
    },
  });

  const onSubmit = async (data) => {
    setsubmittedData(data);
    setSubmitted(true);
    setLoading(true);
  };

  useEffect(() => {
    if (submittedData) {
      axios
        .post(`${REACT_APP_BACKEND_URL}/dashboard/create-account`, {
          userId: user.id,
          data: submittedData,
        })
        .then((response) => {
          setCurrentUser(response.data);
          toast.success("Account created successfully", {
            position: "top-center",
          });
          handleAccountRefresh(!getAccountRefresh);
          reset();
          setOpen(false);
        })
        .catch((error) =>
          toast.error(error.message || "Failed to create account", {
            position: "top-center",
          })
        );
      setLoading(false);
      setSubmitted(false);
    }
  }, [submittedData]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create New Account</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <form
            method="POST"
            action=""
            className="space-x-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Account name{" "}
              </label>
              <Input
                id="name"
                placeholder="e.g., Main Checking"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">
                Account type{" "}
              </label>
              <Select
                onValueChange={(value) => setValue("type", value)}
                defaultValue={watch("type")}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CURRENT">Current</SelectItem>
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                </SelectContent>
              </Select>

              {errors.type && (
                <p className="text-red-500 text-sm">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="balance" className="text-sm font-medium">
                Initial Balance{" "}
              </label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("balance")}
              />
              {errors.balance && (
                <p className="text-red-500 text-sm">{errors.balance.message}</p>
              )}
            </div>

            <div className="flex justify-between items-center rounded-lg border p-3">
              <div className="space-y-0.5">
                <label
                  htmlFor="isDefault"
                  className="text-sm font-medium cursor-pointer"
                >
                  Set as Default{" "}
                </label>
                <p className="text-sm text-muted-foreground">
                  This is account will be selected by default by transaction
                </p>{" "}
              </div>
              <Switch
                id="isDefault"
                onCheckedChange={(checked) => setValue("isDefault", checked)}
                checked={watch("isDefault")}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DrawerClose>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  " Create Account"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateAccountDrawer;
