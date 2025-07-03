import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Switch } from "./ui/switch";
import {
  ArrowDownRight,
  ArrowUpRight,
  MoreHorizontal,
  MoreVertical,
} from "lucide-react";
import { Link } from "react-router";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

const AccountCard = ({ Account, handleDefaultChild, defaultState }) => {
  const REACT_APP_BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;

  const { name, type, balance, _id, isDefault } = Account;
  const { $numberDecimal } = balance;

  const [loading, setLoading] = useState(false);

  const { isSignedIn, user } = useUser();
  const [updateAccount, setUpdateAccount] = useState(Account);
  const [submitted, setSubmitted] = useState(false);

  const handleDefaultChange = () => {
    if (isDefault) {
      toast.warning("Atleast one account need to be default", {
        position: "top-center",
      });
      return;
    }
    setLoading(true);
    setSubmitted(true);
  };
  useEffect(() => {
    if (submitted) {
      axios
        .put(`${REACT_APP_BACKEND_URL}/dashboard/update-default/${_id}`, {
          userId: user.id,
        })
        .then((response) => {
          setUpdateAccount(response.data);
          handleDefaultChild(!defaultState);
          toast.success("Default account set Successfully", {
            position: "top-center",
          });
        })
        .catch((error) =>
          toast.error(error.message || "Failed to set default", {
            position: "top-center",
          })
        );

      setLoading(false);
      setSubmitted(false);
    }
  }, [submitted]);
  const [submittedId, setSubmittedId] = useState(null);
  const handleAccountDelete = (id) => {
    if (isDefault) {
      toast.warning("Default account cannot be deleted", {
        position: "top-center",
      });
      return;
    }
    setSubmittedId(id);
  };

  useEffect(() => {
    if (submittedId) {
      axios
        .delete(`${REACT_APP_BACKEND_URL}/dashboard/delete-account/${_id}`, {
          params: { userId: user.id },
        })
        .then((response) => {
          toast.success("Account Deleted Successfully", {
            position: "top-center",
          });
          handleDefaultChild(!defaultState);
        })
        .catch(() => {
          toast.error(error, { position: "top-center" });
        });
    }
  }, [submittedId]);

  return (
    <Card className="hover:shadow-md transition-shadow group relative">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium capitalize">{name}</CardTitle>
        <div className="flex items-center ">
          <Switch
            checked={isDefault}
            onClick={handleDefaultChange}
            disabled={loading}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="ml-5">
                {" "}
                <Button variant="ghost" className="h-8 w-8 p-0" type="button">
                  <MoreVertical className="h-4 w-4 " />
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleAccountDelete(Account._id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <Link to={`/dashboard/account/${_id}`}>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{parseFloat($numberDecimal).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground ">
            {type.charAt(0) + type.slice(1).toLowerCase()} Account
          </p>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
            Income
          </div>
          <div className="flex items-center">
            <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
            Expense
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

export default AccountCard;
