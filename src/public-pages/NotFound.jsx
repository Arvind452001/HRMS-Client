import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-base-200">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-lg text-gray-600 mt-2">
        Page not found
      </p>

      <Link
        to="/"
        className="mt-6 px-6 py-2 bg-sky-600 text-white rounded-md"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound;
