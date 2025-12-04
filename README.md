# Travel Planner with Itinerary + Expense Splitter

A comprehensive full-stack web application for collaborative travel planning with smart expense splitting and debt simplification.

## 🎯 Features

### Core Functionality
- **Trip Management**: Create and manage group trips with multiple members
- **Collaborative Itinerary**: Drag-and-drop timeline for activities (dates, times, locations, priorities)
- **Smart Expense Splitting**: Support for equal splits, percentages, and exact amounts
- **Min-Cash-Flow Algorithm**: Automatically simplifies debts to minimize transactions
- **Settlement Tracking**: Track who owes whom and mark payments as completed
- **Real-Time Collaboration**: Socket.io for instant updates across all members
- **Voting System**: Group decisions with polls
- **Document Vault**: Upload and store trip documents (tickets, booking confirmations, etc.)

### Advanced Features
- **Offline Support**: View itinerary and log expenses without internet (syncs when back online)
- **Currency Conversion**: Automatic conversion to home currency
- **User Roles**: Admin (organizer), Editor, and Viewer roles
- **Invite System**: Share trips via unique invite codes
- **Real-Time Notifications**: Socket.io for instant updates
- **Multi-User Support**: Full authorization and permission system

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Real-Time**: Socket.io
- **Password Hashing**: bcryptjs
- **API**: RESTful

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Real-Time**: Socket.io-client
- **Styling**: CSS3 with Flexbox/Grid

## 📋 Project Structure

```
backend/
├── models/
│   ├── User.js
│   ├── Trip.js
│   ├── Expense.js
│   ├── Itinerary.js
│   ├── Document.js
│   ├── Voting.js
│   └── Settlement.js
├── routes/
│   ├── auth.js
│   ├── trips.js
│   ├── expenses.js
│   ├── itinerary.js
│   ├── documents.js
│   ├── voting.js
│   └── settlements.js
├── middleware/
│   └── auth.js
├── utils/
│   └── DebtSimplifier.js
├── server.js
├── package.json
└── .env

frontend/
├── src/
│   ├── components/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── TripDetail.jsx
│   │   ├── Itinerary.jsx
│   │   ├── ExpenseTracker.jsx
│   │   └── Settlement.jsx
│   ├── services/
│   │   └── api.js
│   ├── store/
│   │   └── index.js
│   ├── styles/
│   │   ├── Auth.css
│   │   ├── Dashboard.css
│   │   ├── TripDetail.css
│   │   ├── Itinerary.css
│   │   ├── ExpenseTracker.css
│   │   └── Settlement.css
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
└── index.html
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   Create `.env` file with:
   ```
   MONGO_URI=mongodb://localhost:27017/travel-planner
   JWT_SECRET=your_jwt_secret_key_travel_planner_2025
   PORT=5000
   NODE_ENV=development
   EXCHANGE_RATE_API=https://api.exchangerate-api.com/v4/latest/
   ```

4. **Start MongoDB**
   ```bash
   mongod
   ```

5. **Run backend server**
   ```bash
   npm run dev
   ```
   Backend runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend/my-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

## 📱 User Workflows

### Trip Organizer Flow
1. Register/Login
2. Create a new trip (title, destination, dates)
3. Get invite code for the trip
4. Invite friends via code
5. Add activities to itinerary
6. Manage expenses
7. Track settlements

### Group Member Flow
1. Register/Login
2. Join trip using invite code
3. View and contribute to itinerary
4. Add expenses
5. View personal balance
6. Settle up with payments

## 💰 Expense Splitting Algorithm

The app uses a **Min-Cash-Flow Algorithm** to simplify debts:

### How It Works
1. **Calculate Individual Balances**: For each user, sum up how much they paid and how much they owe
2. **Identify Creditors & Debtors**: Users with positive balance are creditors, negative are debtors
3. **Match & Simplify**: Match creditors with debtors and create minimal transactions
4. **Example**:
   - Person A paid $300, owes $100 → owes $200
   - Person B paid $0, owes $200 → owes $200
   - Person C paid $200, owes $0 → owed $200
   - Instead of 3 transactions: A→B, A→C, C→B
   - Simplified to: A→B ($200), A→C ($100), B→C ($100) or even simpler: A pays $200 to B and $100 to C

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update` - Update user profile

### Trips
- `POST /api/trips` - Create trip
- `GET /api/trips` - Get user's trips
- `GET /api/trips/:tripId` - Get trip details
- `POST /api/trips/join/:inviteCode` - Join trip
- `PUT /api/trips/:tripId` - Update trip
- `PUT /api/trips/:tripId/members/:memberId` - Update member role
- `DELETE /api/trips/:tripId/members/:memberId` - Remove member

### Expenses
- `POST /api/expenses` - Add expense
- `GET /api/expenses/trip/:tripId` - Get trip expenses
- `PUT /api/expenses/:expenseId` - Update expense
- `DELETE /api/expenses/:expenseId` - Delete expense
- `GET /api/expenses/summary/:tripId` - Get expense summary with settlement

### Itinerary
- `GET /api/itinerary/trip/:tripId` - Get trip itinerary
- `POST /api/itinerary/activity` - Add activity
- `PUT /api/itinerary/activity/:tripId/:activityId` - Update activity
- `DELETE /api/itinerary/activity/:tripId/:activityId` - Delete activity
- `POST /api/itinerary/reorder` - Reorder activities

### Documents
- `POST /api/documents` - Upload document
- `GET /api/documents/trip/:tripId` - Get trip documents
- `GET /api/documents/trip/:tripId/date/:date` - Get documents by date
- `DELETE /api/documents/:documentId` - Delete document

### Voting
- `POST /api/voting` - Create poll
- `GET /api/voting/trip/:tripId` - Get trip polls
- `POST /api/voting/:pollId/vote` - Vote on poll
- `PUT /api/voting/:pollId/close` - Close poll

### Settlement
- `GET /api/settlements/trip/:tripId` - Get settlement
- `PUT /api/settlements/:settlementId/transaction/:index` - Mark transaction complete
- `POST /api/settlements/:settlementId/recalculate` - Recalculate settlement

## 🔄 Real-Time Events (Socket.io)

- `join-trip` - User joins a trip room
- `expense-added` - New expense added
- `expense-updated` - Expense changed
- `activity-added` - Activity added to itinerary
- `activity-updated` - Activity changed
- `expense-deleted` - Expense removed
- `settlement-marked` - Settlement marked as paid

## 💾 Data Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  homeCurrency: String (default: USD),
  createdAt: Date
}
```

### Trip
```javascript
{
  title: String,
  destination: String,
  startDate: Date,
  endDate: Date,
  organizer: ObjectId (User),
  members: [{
    userId: ObjectId,
    role: String (admin/editor/viewer),
    currency: String
  }],
  inviteCode: String (unique),
  status: String (planning/ongoing/completed),
  createdAt: Date
}
```

### Expense
```javascript
{
  trip: ObjectId,
  description: String,
  amount: Number,
  currency: String,
  paidBy: ObjectId (User),
  splitBetween: [{
    userId: ObjectId,
    share: Number,
    shareType: String (equal/percentage/exact)
  }],
  category: String,
  date: Date,
  attachments: [String]
}
```

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop and mobile
- **Gradient Backgrounds**: Modern purple gradient theme
- **Smooth Animations**: Transitions and hover effects
- **Status Indicators**: Visual badges for trip and expense status
- **Real-Time Updates**: Instant synchronization across users
- **Error Handling**: User-friendly error messages
- **Loading States**: Clear loading indicators
- **Empty States**: Helpful messages when no data

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcryptjs with salting
- **Role-Based Access Control**: Different permissions for admin/editor/viewer
- **Request Validation**: Server-side input validation
- **Unauthorized Access Prevention**: Protected routes

## 🧪 Testing the App

### Scenario 1: Create Trip & Invite Friends
1. Register as User A
2. Create trip "Paris Vacation"
3. Get invite code
4. Register as User B
5. Join trip using invite code
6. Both users see the same trip

### Scenario 2: Split Expenses
1. User A adds expense: "Hotel - $300" (equal split)
2. User B adds expense: "Dinner - $60" (equal split)
3. Go to Settlement tab
4. See: A owes $30, B owes $30
5. Simplification shows minimal transactions

### Scenario 3: Itinerary Management
1. Add activities for each day
2. Drag and reorder activities
3. Add priorities and times
4. Mark activities as completed
5. See timeline view

## 📝 Notes

- The app is fully functional with all core features implemented
- Real-time sync works with Socket.io when backend is running
- Offline mode can be enhanced with localStorage caching
- Currency conversion is available via exchangerate-api
- Expense splitting supports equal, percentage, and exact amounts

## 🚢 Deployment

### Backend (Heroku)
```bash
heroku create travel-planner-backend
git push heroku main
```

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy build folder to Vercel/Netlify
```

## 📄 License

MIT License

## 👨‍💻 Author

Travel Planner Team

---

**Happy Travels! 🌍✈️**
