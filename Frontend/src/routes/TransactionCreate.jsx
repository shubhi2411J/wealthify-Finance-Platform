import AddTransactionForm from "@/components/AddTransactionForm";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { defaultCategories } from "../../data/category";
import React, { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { useSearchParams } from "react-router";

const TransactionCreate = () => {
  const { isSignedIn, user } = useUser();
  const [Accounts, setAccounts] = useState(null);

  const REACT_APP_BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;
  const [progress, setProgress] = useState(0);
  const interval = setInterval(() => {
    setProgress((prev) => (prev < 100 ? prev + 10 : 100));
  }, 100);
 

  
  

  useEffect(() => {
    if (!isSignedIn || !user) return;
    axios
      .get(`${REACT_APP_BACKEND_URL}/transaction/create`, {
        params: {
          id: user.id,
        },
      })
      .then((response) => {
        setAccounts(response.data);
        clearInterval(interval);
      });
    return () => clearInterval(interval);
  }, [isSignedIn, user]);

  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [initialData, setInitialData] = useState(null);

  const [transaction, setTransaction] = useState(null);
  useEffect(() => {
    if (editId) {
      axios
        .get(`${REACT_APP_BACKEND_URL}/transaction/edit/${editId}`, {
          params: {
            userId: user.id,
          },
        })
        .then((response) => {
          setTransaction(response.data);
          clearInterval(interval);
        });
    }
    return () => clearInterval(interval);
  }, [editId]);

  useEffect(() => {
    if (
      transaction &&
      transaction.length > 0 &&
      initialData !== transaction[0]
    ) {
      setInitialData(transaction[0]);
    }
  }, [transaction]);
  return Accounts? (
    editId && !initialData ? ( // If in edit mode but initialData isn't available, show loader
      <div className="mt-20">
        <Progress value={progress} />
      </div>
    ) : (
      <div className="max-w-3xl mx-auto px-5 mt-28">
        <h1 className="text-5xl gradient-title mb-8">
          {editId ? "Edit Transaction" : "Add Transaction"}
        </h1>
        <AddTransactionForm
          accounts={Accounts}
          categories={defaultCategories}
          editMode={!!editId}
          initialData={editId ? initialData : {}} // Pass empty object for new transaction
        />
      </div>
    )
  ) : (
    <div className="mt-20">
      <Progress value={progress} />
    </div>
  );
};

export default TransactionCreate;
