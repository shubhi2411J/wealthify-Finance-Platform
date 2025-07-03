import ChartSection from "@/components/ChartSection";
import TransactionTable from "@/components/TransactionTable";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import React, { Suspense, useEffect, useState } from "react";
import { useParams } from "react-router";
import { BarLoader } from "react-spinners";

const DynamicAccount = () => {
  const { id } = useParams();
  const { isSignedIn, user } = useUser();
  const [accountData, setAccountData] = useState(null);
  const [progress, setProgress] = useState(0);
  const REACT_APP_BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;
  const interval = setInterval(() => {
    setProgress((prev) => (prev < 100 ? prev + 10 : 100));
  }, 100);
  const [revalidate, setRevalidate] = useState(false);
  const handleRevalidate = (data) => {
    setRevalidate(data);
  };

  useEffect(() => {
    axios
      .get(`${REACT_APP_BACKEND_URL}/dashboard/account/${id}`, {
        params: {
          userId: user.id,
        },
      })
      .then((response) => {
        setAccountData(response.data);
        clearInterval(interval);
      });
    return () => clearInterval(interval);
  }, [revalidate]);

  return (
    <div className="mt-28 ml-16 mr-12 ">
      {accountData ? (
        <div className="space-y-8 px-5 ">
          <div className="flex gap-4 items-end justify-between">
            <div>
              <h1 className="text-5xl sm:text-6xl font-bold gradient-title capitalize ">
                {accountData[0].name}
              </h1>
              <p className="text-muted-foreground">
                {accountData[0].type.charAt(0) +
                  accountData[0].type.slice(1).toLowerCase()}{" "}
                Account
              </p>
            </div>

            <div className="text-right pb-2">
              <div className="text-xl sm:text-2xl font-bold">
                {" "}
                ₹{parseFloat(accountData[0].balance.$numberDecimal).toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">
                {accountData.transactionCount} Transaction
              </p>
            </div>
          </div>
          {/* {chart section} */}
          <Suspense
            fallback={
              <BarLoader width={"100%"} className="mt-4" color="#9333ea" />
            }
          >
            <ChartSection transactions={accountData[0].transactions} />
          </Suspense>

          {/* {Transaction table} */}
          <Suspense
            fallback={
              <BarLoader width={"100%"} className="mt-4" color="#9333ea" />
            }
          >
            <TransactionTable
              transactions={accountData[0].transactions}
              handleRevalidate={handleRevalidate}
              revalidate={revalidate}
            />
          </Suspense>
        </div>
      ) : (
        <div className="mt-20">
          <Progress value={progress} />
        </div>
      )}
    </div>
  );
};

export default DynamicAccount;
