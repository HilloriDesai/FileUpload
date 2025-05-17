import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-blue-600 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M2 6a2 2 0 012-2h4a1 1 0 01.707.293L10 5.586l1.293-1.293A1 1 0 0112 4h4a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm5.293-1.293A1 1 0 017.293 4H4v12h12V6h-3.293l-1-1H9.707l-1 1H4V4h3.293z"
              clipRule="evenodd"
            />
          </svg>
          DropBox Clone
        </Link>
      </div>
    </header>
  );
};

export default Header;
