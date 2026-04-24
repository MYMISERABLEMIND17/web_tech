import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  HomeIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  AcademicCapIcon,
  UsersIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeSolid,
  UserCircleIcon as UserSolid,
  UsersIcon as UsersSolid,
  BellIcon as BellSolid,
} from "@heroicons/react/24/solid";
import { usersAPI } from "../services/api";

export default function Navbar() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const MotionNav = motion.nav;
  const [showNotifications, setShowNotifications] = useState(false);
  const [requests, setRequests] = useState([]);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    if (showNotifications) {
      usersAPI.getRequests().then(res => setRequests(res.data)).catch(console.error);
    }
  }, [showNotifications]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAccept = async (id) => {
    try {
      const res = await usersAPI.acceptConnection(id);
      setUser(prev => ({ ...prev, connections: res.data.connections, connectionRequests: res.data.connectionRequests }));
      setRequests(prev => prev.filter(r => r._id !== id));
    } catch (err) { console.error(err); }
  };

  const handleDecline = async (id) => {
    try {
      const res = await usersAPI.rejectConnection(id);
      setUser(prev => ({ ...prev, connectionRequests: res.data.connectionRequests }));
      setRequests(prev => prev.filter(r => r._id !== id));
    } catch (err) { console.error(err); }
  };

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

          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="nav-link relative"
            >
              {showNotifications ? <BellSolid className="w-5 h-5" /> : <BellIcon className="w-5 h-5" />}
              <span className="text-xs font-medium">Alerts</span>
              {user?.connectionRequests?.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-500/50" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 glass-card rounded-xl shadow-xl overflow-hidden border border-navy-200/20 z-50">
                <div className="p-3 border-b border-navy-200/10 bg-navy-900/30">
                  <h3 className="text-sm font-semibold text-navy-50">Connection Requests</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {user?.connectionRequests?.length === 0 ? (
                    <div className="p-4 text-center text-xs text-navy-200">No pending requests</div>
                  ) : requests.length === 0 ? (
                    <div className="p-4 text-center text-xs text-navy-200 animate-pulse">Loading...</div>
                  ) : (
                    requests.map(req => (
                      <div key={req._id} className="p-3 border-b border-navy-200/5 flex items-center gap-3 hover:bg-navy-900/20 transition-colors">
                        <Link to={`/profile/${req._id}`} onClick={() => setShowNotifications(false)}>
                          <img src={req.avatar} alt={req.name} className="w-10 h-10 rounded-full object-cover border border-navy-200/20" />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/profile/${req._id}`} onClick={() => setShowNotifications(false)} className="text-sm font-medium text-navy-50 hover:text-electric-400 truncate block">
                            {req.name}
                          </Link>
                          <p className="text-xs text-navy-200">wants to connect</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button onClick={() => handleAccept(req._id)} className="px-2 py-1 text-[10px] font-bold bg-electric-500 hover:bg-electric-600 text-white rounded">Accept</button>
                          <button onClick={() => handleDecline(req._id)} className="px-2 py-1 text-[10px] font-bold bg-navy-900/50 hover:bg-red-500/80 hover:text-white text-navy-200 rounded transition-colors">Decline</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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