import { type ReactElement } from "react";
import { Link } from "react-router-dom";
export function NavBar(): ReactElement {
  return (
    <nav className="flex absolute right-0 top-0 m-8 flex-row align-center gap-x-10 dark:text-white text-gray-900">
      <button className="bg-green-600 hover:bg-green-700 pl-5 pr-5 p-2 text-2xl rounded-2xl ">
        <Link to="/login">Login</Link>
      </button>
      <button className="bg-green-600 hover:bg-green-700 pl-5 pr-5 p-2 text-2xl rounded-2xl">
        <Link to="/register">Register</Link>
      </button>
    </nav>
  );
}
