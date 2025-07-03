import AccountCard from "@/components/AccountCard";
import BudgetProgress from "@/components/BudgetProgress";
import CreateAccountDrawer from "@/components/CreateAccountDrawer";
import DashboardOverview from "@/components/DashboardOverview";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { Plus } from "lucide-react";
import React, { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

const Dashboard = () => {
  const { isSignedIn, user } = useUser();
  const [Accounts, setAccounts] = useState(null);

  const REACT_APP_BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;

  const [defaultState, setDefaultState] = useState(false);
  const [revalidate, setRevalidate] = useState(false);
  const handleRevalidate = (data) => {
    setRevalidate(data);
  };

  const handleDefaultChild = (data) => {
    setDefaultState(data);
  };
  const [getAccountRefresh, setGetAccountRefresh] = useState(false);
  const handleAccountRefresh = (data) => {
    setGetAccountRefresh(data);
  };

  useEffect(() => {
    axios
      .get(`${REACT_APP_BACKEND_URL}/dashboard/account-fetch`, {
        params: {
          id: user.id,
        },
      })
      .then((response) => {
        setAccounts(response.data);
      });
  }, [defaultState, getAccountRefresh]);

  const defaultAccount = Accounts?.find((account) => account.isDefault);
  const [budgetData, setBudgetData] = useState(null);

  useEffect(() => {
    if (defaultAccount) {
      axios
        .get(`${REACT_APP_BACKEND_URL}/dashboard/budget`, {
          params: {
            userId: user.id,
            accountId: defaultAccount._id,
          },
        })
        .then((response) => {
          setBudgetData(response.data);
        })
        .catch((err) => {
          toast.error(err.message || "Failed to fetch budget", {
            position: "top-center",
          });
        });
    }
  }, [defaultAccount, revalidate]);

  const [transactions, setTransactions] = useState(null);

  useEffect(() => {
    axios
      .get(`${REACT_APP_BACKEND_URL}/dashboard/overview`, {
        params: {
          userId: user.id,
        },
      })
      .then((response) => {
        setTransactions(response.data);
      })
      .catch(() => {
        toast.error("Failed to get transaction");
      });
  }, []);

  return (
    <div className="space-y-8">
      {/*Budget Progress*/}
      {defaultAccount && (
        <BudgetProgress
          initialBudget={budgetData?.budget}
          currentExpenses={budgetData?.currentExpenses || 0}
          handleRevalidate={handleRevalidate}
          revalidate={revalidate}
        />
      )}
      {/*Overview*/}
      <Suspense fallback={"Loading Overview..."}>
        {Accounts && (
          <DashboardOverview
            accounts={Accounts}
            transactions={transactions || []}
          />
        )}
      </Suspense>

      {/*Accounts grid*/}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer
          getAccountRefresh={getAccountRefresh}
          handleAccountRefresh={handleAccountRefresh}
        >
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex flex-col justify-center items-center text-muted-foreground h-full pt-5">
              <Plus className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        {Accounts?.map((Account) => {
          return (
            <AccountCard
              defaultState={defaultState}
              handleDefaultChild={handleDefaultChild}
              key={Account.id}
              Account={Account}
              handleRevalidate={handleRevalidate}
              revalidate={revalidate}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
