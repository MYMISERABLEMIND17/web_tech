import { Suspense, lazy, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AcademicCapIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";

const AuthHeroScene = lazy(() => import("../components/AuthHeroScene"));

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const MotionDiv = motion.div;
  const MotionP = motion.p;
  const MotionButton = motion.button;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      login(data.user, data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 gap-8 items-stretch py-10">
      {/* Hero */}
      <div className="hidden lg:block relative overflow-hidden rounded-[28px] glass-card-dark">
        <Suspense fallback={null}>
          <AuthHeroScene />
        </Suspense>
        <div className="relative z-10 p-10 h-full flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-navy-200/15 bg-navy-900/40">
              <AcademicCapIcon className="w-6 h-6 text-electric-400" />
            </div>
            <span className="font-display font-bold text-2xl text-navy-50">CampusLink</span>
          </div>

          <div>
            <h2 className="font-display text-4xl font-bold text-navy-50 leading-tight mb-4">
              Your campus,
              <br />
              amplified in <span className="text-electric-400">real time</span>.
            </h2>
            <p className="text-navy-200 text-lg leading-relaxed max-w-sm">
              Build reputation, share wins, and find your people.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {["Projects", "Hackathons", "Referrals", "Clubs"].map((tag) => (
              <span
                key={tag}
                className="text-xs text-navy-100 border border-navy-200/15 bg-navy-900/30 rounded-full px-3 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center px-2 sm:px-6">
        <MotionDiv
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md glass-card p-7 sm:p-8"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-navy-900/50 rounded-lg flex items-center justify-center border border-navy-200/15">
              <AcademicCapIcon className="w-5 h-5 text-electric-400" />
            </div>
            <span className="font-display font-bold text-navy-50 text-xl">CampusLink</span>
          </div>

          <h1 className="text-3xl font-bold text-navy-50 mb-1">Welcome back</h1>
          <p className="text-navy-200 mb-7">Sign in to your campus network</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-100 mb-1.5">Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@college.edu"
                className="input-field"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-100 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-200 hover:text-navy-50"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <MotionP
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-300 text-sm bg-red-950/30 border border-red-400/20 rounded-xl px-4 py-2.5"
              >
                {error}
              </MotionP>
            )}

            <MotionButton
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 mt-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {loading ? "Signing in..." : "Sign in"}
            </MotionButton>
          </form>

          <div className="neon-divider my-6" />

          <p className="text-center text-sm text-navy-200">
            New to CampusLink?{" "}
            <Link to="/register" className="font-semibold text-electric-400 hover:text-electric-500 underline underline-offset-4">
              Create account
            </Link>
          </p>
        </MotionDiv>
      </div>
    </div>
  );
}