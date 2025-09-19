import React from 'react';

export default function WelcomeMessage({ user }) {
  // Get current time to display appropriate greeting
  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const greeting = getCurrentGreeting();
  const userName = user?.displayName || 'Artisan';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-4">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={userName}
              className="h-16 w-16 rounded-full"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-800 text-xl font-medium">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {userName}!
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome to your dashboard. Here's an overview of your activity.
          </p>
        </div>
      </div>
    </div>
  );
}