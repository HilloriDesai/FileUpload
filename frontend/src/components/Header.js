import React from "react";
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

/**
 * Navigation link component for the header
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.to - The route to navigate to
 * @param {string} props.children - The link text
 * @param {boolean} props.isActive - Whether the link is active
 */
const NavLink = ({ to, children, isActive }) => (
  <Link
    to={to}
    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      isActive
        ? "text-blue-600 bg-blue-50"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
    }`}
    aria-current={isActive ? "page" : undefined}
  >
    {children}
  </Link>
);

NavLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  isActive: PropTypes.bool,
};

/**
 * Header component for the application
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - The application title
 */
const Header = ({ title = "Typeface" }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                to="/upload"
                className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition-colors duration-200"
                aria-label="Go to home page"
              >
                {title}
              </Link>
            </div>
          </div>

          <nav
            className="flex items-center space-x-4"
            role="navigation"
            aria-label="Main navigation"
          >
            <NavLink to="/upload" isActive={isActive("/upload")}>
              Upload
            </NavLink>
            <NavLink to="/files" isActive={isActive("/files")}>
              All Files
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  title: PropTypes.string,
};

export default Header;
