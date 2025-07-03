import { Link } from "react-router-dom";
import { BarChart3, CreditCard } from "lucide-react";
const Footer = () => {
  return (
    <footer className="w-full border-t bg-blue-50 py-12 pl-12">
      <div className=" container mx-auto px-4   text-gray-600">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mx-10">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src="/mono.png" alt="" height="25px" width="25px" />
              <span className="text-xl font-bold">Wealthify</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Simplifying your financial journey with smart tools and insights.
            </p>
            <div className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Wealthify. All rights reserved.
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Quick Links</h3>
            <div className="grid grid-cols-1 gap-3">
              <Link
                to="/dashboard"
                className="text-muted-foreground hover:text-foreground flex items-center gap-2 group"
              >
                <div className="bg-background p-2 rounded-md group-hover:bg-primary/10 transition-colors">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">Dashboard</div>
                  <div className="text-xs text-muted-foreground">
                    View your financial overview
                  </div>
                </div>
              </Link>

              <Link
                to="/transaction/create"
                className="text-muted-foreground hover:text-foreground flex items-center gap-2 group"
              >
                <div className="bg-background p-2 rounded-md group-hover:bg-primary/10 transition-colors">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">Add Transaction</div>
                  <div className="text-xs text-muted-foreground">
                    Record your income and expenses
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
