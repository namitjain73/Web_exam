# Travel Planner with Itinerary + Expense Splitter

A comprehensive collaborative travel application that combines itinerary management with a robust expense splitter. Perfect for group trips where friends can plan together and settle debts transparently.

## Features

### Core Functionality

- **Collaborative Itinerary**: Drag-and-drop timeline where multiple users can add/edit activities in real-time
- **Expense Splitting**: Support for equal and unequal splits with automatic debt calculation
- **Debt Simplification**: Min-Cash Flow algorithm minimizes the number of transactions needed to settle all debts
- **Voting System**: Create polls for group decisions (e.g., "Hotel X vs. Hotel Y")
- **Document Vault**: Central storage for PDFs and images linked to specific itinerary days
- **User Roles**: Admin, Editor, and Viewer permissions for trip management
- **Join System**: Share trips via join code or link

### Technical Features

- **Offline Support**: View itinerary and log expenses without internet (syncs when back online)
- **Currency Conversion**: Auto-convert expenses to user's home currency (OpenExchangeRates API)
- **Real-Time Sync**: Updates reflect instantly for all users
- **Responsive Design**: Modern, beautiful UI with smooth animations

## Tech Stack

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** authentication
- **RESTful API** architecture

### Frontend
- **React** with Vite
- **React Router** for navigation
- **React Beautiful DnD** for drag-and-drop
- **Axios** for API calls
- **Date-fns** for date formatting

## Project Structure

```
├── backend/
│   ├── controllers/     # Business logic
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middlewares/     # Auth middleware
│   ├── utils/           # Utilities (debt simplifier)
│   └── app.js           # Express server
│
└── frontend/
    ├── src/
    │   ├── components/  # React components
    │   ├── pages/       # Page components
    │   ├── context/     # React context (Auth)
    │   ├── utils/       # Utilities (API, offline, currency)
    │   └── App.jsx      # Main app component
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
REFRESH_SECRET=your_refresh_token_secret
PORT=5000
```

4. Start the server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_CURRENCY_API_KEY=your_openexchangerates_api_key
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/me` - Get current user

### Trips
- `POST /api/trips` - Create trip
- `GET /api/trips` - Get user's trips
- `GET /api/trips/:tripId` - Get trip details
- `POST /api/trips/join` - Join trip with code
- `PATCH /api/trips/:tripId/role` - Update member role
- `PATCH /api/trips/:tripId/finalize` - Finalize trip

### Activities
- `POST /api/activities` - Create activity
- `GET /api/activities/trip/:tripId` - Get trip activities
- `PATCH /api/activities/:activityId` - Update activity
- `PATCH /api/activities/:activityId/status` - Update activity status
- `DELETE /api/activities/:activityId` - Delete activity

### Expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses/trip/:tripId` - Get trip expenses
- `GET /api/expenses/trip/:tripId/summary` - Get debt summary
- `POST /api/expenses/settle` - Settle expense
- `DELETE /api/expenses/:expenseId` - Delete expense

### Votes
- `POST /api/votes` - Create vote
- `GET /api/votes/trip/:tripId` - Get trip votes
- `POST /api/votes/:voteId/vote` - Cast vote

### Documents
- `POST /api/documents` - Upload document
- `GET /api/documents/trip/:tripId` - Get trip documents
- `DELETE /api/documents/:documentId` - Delete document

## Debt Simplification Algorithm

The application uses a **Min-Cash Flow** algorithm to minimize the number of transactions needed to settle all debts. 

### How it works:

1. **Calculate Net Balances**: For each member, calculate what they paid minus what they owe
2. **Separate Creditors and Debtors**: 
   - Creditors have positive balance (they are owed money)
   - Debtors have negative balance (they owe money)
3. **Greedy Matching**: Match the largest debtor with the largest creditor, settle the maximum possible amount, and repeat

### Example:
- A paid $100, owes $30 → Net: +$70 (creditor)
- B paid $50, owes $60 → Net: -$10 (debtor)
- C paid $0, owes $40 → Net: -$40 (debtor)

**Result**: C pays A $40, B pays A $10 (2 transactions instead of 3)

## Usage Flow

1. **Create Trip**: Organizer creates a trip with dates, destination, and currency
2. **Invite Friends**: Share join code or link with group members
3. **Plan Itinerary**: Members add activities to the timeline (drag-and-drop to reorder)
4. **Add Expenses**: Log expenses and split between members (equal or unequal)
5. **View Debts**: See simplified debt summary showing minimum transactions needed
6. **Vote on Decisions**: Create polls for group decisions
7. **Store Documents**: Upload tickets, vouchers, and IDs for easy access
8. **Finalize Trip**: Lock the itinerary when ready

## Offline Support

The app stores data locally when offline:
- View itinerary and expenses
- Add new activities and expenses (queued for sync)
- When back online, pending actions are automatically synced

## Currency Conversion

Expenses are automatically converted to the trip's base currency using OpenExchangeRates API. Users can see expenses in their preferred currency.

## Future Enhancements

- Real-time sync with WebSockets or Firebase
- File upload to cloud storage (AWS S3, Cloudinary)
- Push notifications for trip updates
- Mobile app (React Native)
- Integration with Google Places API for location suggestions
- Email notifications
- Export trip summary as PDF

## License

MIT License - feel free to use this project for your hackathon or learning purposes!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

