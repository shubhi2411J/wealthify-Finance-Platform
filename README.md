Project Title- Wealthify - AI-Powered Financial Management Platform

Overview Section:
Wealthify is an AI-powered financial management platform designed to help users manage transactions, set budgets, and track expenses. 
Advanced features include receipt scanning and email-based alerts for seamless financial tracking.

![Dashboard](Frontend/public/wealthify-dashboard.png)




Features Section:
- Email Authentication: Secure login via Clerk.
- Interactive Dashboard: Manage accounts, budgets, and expenses efficiently.
- Monthly Budgets: Set and monitor financial goals for each month.
- Expense Tracking: Real-time email alerts for financial activities.
- AI-Powered Receipt Scanning: Automatically categorize and process receipts.
- Detailed Transaction Management: View, filter, and search transaction histories.
- Technologies Used:
  - Frontend: HTML, CSS, Tailwind CSS, JavaScript, React.js
  - Backend: Node.js, Express.js
  - Database: MongoDB
  - Other Tools: Arcjet, Resend, React-Email, Shadcn UI, Recharts


Installation Steps:

1. Clone the Repository:
   git clone https://github.com/sanyamjain-dev/Wealthify-AI-Powered-Finance-Platform.git
   cd Wealthify-AI-Powered-Finance-Platform

2. Install Dependencies:
   npm install

3. Setup Environment Variables:
   - Create a .env file in the root directory.
   - Add these variables to the .env file:
     NODE_ENV=development,
     PORT=YOUR PORT NUMBER,
     MONGO_URI=your_mongodb_connection_string,
     JWT_SECRET=your_jwt_secret,
     CLERK_API_KEY=your_clerk_api_key,
     EMAIL_SERVICE_API_KEY=your_email_service_api_key,
   - Replace placeholder values with your actual credentials.

4. Run the Backend Server:
   npm run dev

5. Run the Frontend Server:
   - Navigate to the frontend directory:
     cd frontend
   - Install dependencies and start the development server:
     npm install
     npm start


Contact Section: 
- Email: sanyamjain9191@gmail.com
- GitHub: https://github.com/sanyamjain-dev

