import { SignIn, useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router";
import DashboardLayout from "./DashboardLayout";

const ProtectedRoute = () => {
  const { isSignedIn } = useUser();

  return (
    <div className="container mx-auto my-24">
      {isSignedIn ? <DashboardLayout/> : <SignIn /> && <Navigate to="/sign-in" />}
    </div>
  );
};

export default ProtectedRoute;
