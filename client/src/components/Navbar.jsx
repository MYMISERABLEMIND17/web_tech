import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  HomeIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  AcademicCapIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeSolid,
  UserCircleIcon as UserSolid,
  UsersIcon as UsersSolid,
} from "@heroicons/react/24/solid";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const MotionNav = motion.nav;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <MotionNav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="sticky top-0 z-50 backdrop-blur-md border-b border-navy-200/10 bg-cream-50/50"
    >
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-navy-900/50 border border-navy-200/15 rounded-lg flex items-center justify-center group-hover:border-electric-400/40 transition-colors">
            <AcademicCapIcon className="w-5 h-5 text-electric-400" />
          </div>
          <span className="font-display font-bold text-navy-50 text-lg leading-none">
            CampusLink
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          <Link
            to="/"
            className={`nav-link ${isActive("/") ? "nav-link-active" : ""}`}
          >
            {isActive("/") ? (
              <HomeSolid className="w-5 h-5" />
            ) : (
              <HomeIcon className="w-5 h-5" />
            )}
            <span className="text-xs font-medium">Home</span>
          </Link>

          <Link
            to="/network"
            className={`nav-link ${isActive("/network") ? "nav-link-active" : ""}`}
          >
            {isActive("/network") ? (
              <UsersSolid className="w-5 h-5" />
            ) : (
              <UsersIcon className="w-5 h-5" />
            )}
            <span className="text-xs font-medium">Network</span>
          </Link>

          <Link
            to={`/profile/${user?._id}`}
            className={`nav-link ${isActive(`/profile/${user?._id}`) ? "nav-link-active" : ""}`}
          >
            {isActive(`/profile/${user?._id}`) ? (
              <UserSolid className="w-5 h-5" />
            ) : (
              <UserCircleIcon className="w-5 h-5" />
            )}
            <span className="text-xs font-medium">Profile</span>
          </Link>

          {/* Avatar + Logout */}
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-cream-200">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover border border-navy-200/20"
            />
            <button
              onClick={handleLogout}
              className="nav-link text-red-300 hover:text-red-200 hover:bg-red-950/25"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span className="text-xs font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </MotionNav>
  );
}