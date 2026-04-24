import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { usersAPI } from "../services/api";
import { Link } from "react-router-dom";
import { UsersIcon, AcademicCapIcon, MapPinIcon, LinkIcon } from "@heroicons/react/24/outline";

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function Network() {
  const { user: currentUser, setUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const MotionDiv = motion.div;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await usersAPI.getAllUsers();
        // Filter out current user
        setUsers(res.data.filter(u => u._id !== currentUser?._id));
      } catch (err) {
        console.error(err);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentUser]);

  const handleConnect = async (targetId) => {
    try {
      const res = await usersAPI.toggleConnection(targetId);
      setUser(prev => ({ ...prev, sentRequests: res.data.sentRequests }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccept = async (targetId) => {
    try {
      const res = await usersAPI.acceptConnection(targetId);
      setUser(prev => ({ ...prev, connections: res.data.connections, connectionRequests: res.data.connectionRequests }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (targetId) => {
    try {
      const res = await usersAPI.rejectConnection(targetId);
      setUser(prev => ({ ...prev, connectionRequests: res.data.connectionRequests }));
    } catch (err) {
      console.error(err);
    }
  };

  const isConnected = (targetId) => {
    if (!currentUser || !currentUser.connections) return false;
    return currentUser.connections.includes(targetId) || currentUser.connections.some(c => c._id === targetId);
  };

  const isPending = (targetId) => {
    if (!currentUser || !currentUser.sentRequests) return false;
    return currentUser.sentRequests.includes(targetId) || currentUser.sentRequests.some(r => r._id === targetId);
  };

  const isIncoming = (targetId) => {
    if (!currentUser || !currentUser.connectionRequests) return false;
    return currentUser.connectionRequests.includes(targetId) || currentUser.connectionRequests.some(r => r._id === targetId);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card p-5 animate-pulse flex flex-col items-center">
              <div className="w-20 h-20 bg-navy-900/40 rounded-full mb-4" />
              <div className="h-4 bg-navy-900/40 rounded w-1/2 mb-2" />
              <div className="h-3 bg-navy-900/30 rounded w-1/3 mb-4" />
              <div className="w-full h-8 bg-navy-900/40 rounded mt-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-50 flex items-center gap-2">
          <UsersIcon className="w-7 h-7 text-electric-400" />
          Campus Network
        </h1>
        <p className="text-navy-200 mt-1">Discover and connect with your peers.</p>
      </div>

      {error && (
        <div className="glass-card p-4 text-center text-red-300 mb-6">{error}</div>
      )}

      {users.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <UsersIcon className="w-10 h-10 text-navy-200 mx-auto mb-3" />
          <p className="text-navy-50 font-medium">No other users found</p>
          <p className="text-navy-200 text-sm mt-1">Invite your friends to join the network!</p>
        </div>
      ) : (
        <MotionDiv variants={stagger} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <MotionDiv key={user._id} variants={fadeUp} className="glass-card p-5 flex flex-col items-center text-center hover:border-electric-400/30 transition-colors">
              <Link to={`/profile/${user._id}`}>
                <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full border border-navy-200/20 object-cover shadow-sm mb-3 hover:scale-105 transition-transform" />
              </Link>
              
              <Link to={`/profile/${user._id}`} className="font-semibold text-lg text-navy-50 hover:text-electric-400 transition-colors">
                {user.name}
              </Link>
              
              <p className="text-sm text-navy-200 line-clamp-2 min-h-[40px] mt-1">
                {user.bio || "No bio provided"}
              </p>
              
              <div className="w-full flex flex-col gap-1 mt-3 mb-4 text-xs text-navy-200 items-center">
                {user.college && (
                  <span className="flex items-center gap-1">
                    <AcademicCapIcon className="w-3.5 h-3.5" />
                    {user.college}
                  </span>
                )}
                {user.branch && (
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="w-3.5 h-3.5" />
                    {user.branch} {user.year && `• ${user.year}`}
                  </span>
                )}
              </div>

              <div className="mt-auto w-full pt-4 border-t border-navy-200/10">
                {isConnected(user._id) ? (
                  <button className="w-full py-2 rounded-lg text-sm font-medium transition-colors bg-navy-900/50 text-navy-200 border border-navy-200/20 cursor-default">
                    Connected
                  </button>
                ) : isIncoming(user._id) ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAccept(user._id)}
                      className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors bg-electric-500 hover:bg-electric-600 text-white shadow-md shadow-electric-500/20"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleReject(user._id)}
                      className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors bg-red-500/80 hover:bg-red-600/80 text-white shadow-md shadow-red-500/20"
                    >
                      Reject
                    </button>
                  </div>
                ) : isPending(user._id) ? (
                  <button 
                    onClick={() => handleConnect(user._id)}
                    className="w-full py-2 rounded-lg text-sm font-medium transition-colors bg-navy-900/80 hover:bg-red-500/80 hover:text-white text-navy-200 border border-navy-200/30 group relative"
                  >
                    <span className="group-hover:hidden">Pending...</span>
                    <span className="hidden group-hover:inline">Withdraw</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => handleConnect(user._id)}
                    className="w-full py-2 rounded-lg text-sm font-medium transition-colors bg-electric-500 hover:bg-electric-600 text-white shadow-md shadow-electric-500/20"
                  >
                    Connect
                  </button>
                )}
              </div>
            </MotionDiv>
          ))}
        </MotionDiv>
      )}
    </div>
  );
}
