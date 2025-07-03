import React from "react";
import Dashboard from "./Dashboard";
import { Suspense } from "react";
import { BarLoader } from "react-spinners";

const DashboardLayout = () => {
  return (
    <div className="px-5 mx-16 ">
      <h1 className="text-6xl gradient-title font-bold mb-5 mt-32">Dashboard</h1>

      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <Dashboard  />
      </Suspense>
    </div>
  );
};

export default DashboardLayout;
