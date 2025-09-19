# Kalā-Yug Setup Guide

This guide will help you set up and run the Kalā-Yug application locally.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Cloud Platform account
- Firebase account

## Environment Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory using the provided `.env.example` as a template.

4. Update the `.env` file with your actual Firebase and Google Cloud credentials.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the frontend directory with the following variables:
   ```
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. Update the `.env.local` file with your actual Firebase credentials.

## Running the Application

### Start the Backend Server

```bash
cd backend
npm run dev
```

The backend server will start on http://localhost:5000.

### Start the Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend development server will start on http://localhost:3000.

## Troubleshooting

- If you encounter any issues with Firebase authentication, ensure that your Firebase project has Email/Password authentication enabled in the Firebase console.
- If you encounter issues with the Tailwind CSS styling, try running `npm run build` in the frontend directory to rebuild the CSS.
- If you encounter CORS issues, ensure that your backend CORS configuration is correctly set up to allow requests from your frontend origin.