import React from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { Link, NavLink } from "react-router";
import { Button } from "./ui/button";
import { LayoutDashboard, PenBox } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import axios from "axios";

const Header = () => {
  const REACT_APP_BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;
  const { isSignedIn, user } = useUser();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (isSignedIn && user) {
      axios
        .post(`${REACT_APP_BACKEND_URL}/dashboard`, {
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
          email: user.primaryEmailAddress.emailAddress,
        })
        .then((response) => setCurrentUser(response.data))
        .catch((error) => console.error("Error:", error));
    }
  }, [isSignedIn, user]);


  return (
    <div className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <NavLink to={"/"}>
          <img
            src="/wealthify.png"
            alt="wealthify"
            height={60}
            className="h-12 w-[10rem] object-cover ml-5"
          />
        </NavLink>
        <div className="flex items-center space-x-4">
          <SignedIn>
            <Link
              to={"/dashboard"}
              className="text-gray-600 hover:text-blue-600 flex items-center gap-2"
            >
              <Button variant="outline">
                <LayoutDashboard size={18} />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>

            <Link
              to={"/transaction/create"}
              className=" flex items-center gap-2"
            >
              <Button variant="">
                <PenBox size={18} />
                <span className="hidden md:inline">Add Transaction</span>
              </Button>
            </Link>
          </SignedIn>

          <SignedOut>
            <SignInButton forceRedirectUrl="/sign-in">
              <Button variant="outline">Login</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </nav>
    </div>
  );
};

export default Header;
