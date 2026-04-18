import { useState } from "react";
import {
  login,
  register,
  forgotPassword,
  verifyOTP,
  resetPassword,
} from "../api/api";

// Password strength validator — mirrors backend rules
function validatePassword(pwd) {
  if (!pwd || pwd.length < 6) return "Password must be at least 6 characters.";
  if (!/[A-Z]/.test(pwd)) return "Password must contain at least 1 uppercase letter.";
  return null;
}

// Live strength indicator
function PasswordStrengthBar({ password }) {
  const checks = {
    length: password.length >= 6,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;

  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div style={{ marginBottom: "16px", marginTop: "-10px" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: "4px",
              borderRadius: "2px",
              background: i < score ? colors[score - 1] : "rgba(255,255,255,0.15)",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: "11px", color: colors[score - 1] || "#9ca3af" }}>
        {password ? labels[score - 1] || "Weak" : ""}
      </div>
      <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
        {!checks.length && <span>• Min 6 characters &nbsp;</span>}
        {!checks.upper && <span>• 1 Uppercase letter &nbsp;</span>}
        {!checks.number && <span>• Number (optional) &nbsp;</span>}
        {!checks.symbol && <span>• Symbol (optional)</span>}
      </div>
    </div>
  );
}

export default function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot password flow
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Styles
  const pageStyle = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    backgroundImage: "url('/Front_end/public/Food Photography Remote & Worldwide — Uzo Onyejiaka _ Food & Product Photographer _ Barcelona, Spain.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    position: "relative",
  };
  const cardStyle = {
    position: "relative",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "20px",
    padding: "36px 32px",
    maxWidth: "400px",
    width: "100%",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
    color: "#fff",
    overflow: "hidden",
  };
  const glossLayer = {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(135deg, rgba(255,255,255,0.2), transparent 50%)",
    borderRadius: "20px",
    pointerEvents: "none",
  };
  const labelStyle = { display: "block", marginBottom: "6px", color: "#e5e7eb", fontSize: "14px", fontWeight: "500" };
  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    marginBottom: "16px",
    background: "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.05))",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    backdropFilter: "blur(12px)",
    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.3), 0 8px 18px rgba(0,0,0,0.45)",
    boxSizing: "border-box",
  };
  const buttonStyle = {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(145deg, #3b82f6, #1e40af)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 16px 32px rgba(59,130,246,0.7), inset 0 1px 0 rgba(255,255,255,0.35)",
    marginBottom: "12px",
  };
  const errorStyle = {
    padding: "12px",
    background: "rgba(239,68,68,0.25)",
    border: "1px solid rgba(239,68,68,0.35)",
    borderRadius: "8px",
    color: "#fecaca",
    fontSize: "14px",
    marginBottom: "16px",
  };
  const successStyle = {
    padding: "12px",
    background: "rgba(34,197,94,0.2)",
    border: "1px solid rgba(34,197,94,0.35)",
    borderRadius: "8px",
    color: "#bbf7d0",
    fontSize: "14px",
    marginBottom: "16px",
  };

  // Helper: File → Base64
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });

  // ── Login / Register ──────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        // Client-side password validation
        const pwdError = validatePassword(password);
        if (pwdError) { setError(pwdError); setLoading(false); return; }

        if (!image) throw new Error("Profile image is required");
        const base64Image = await getBase64(image);
        await register(email, password, base64Image, mobile);
      }
      onLogin();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password: Step 1 — Send OTP to email ───────────────────────────
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      await forgotPassword(forgotEmail);
      setOtpSent(true);
      setSuccessMsg(`OTP sent to ${forgotEmail}. Check your inbox.`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password: Step 2 — Verify OTP ─────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      await verifyOTP(forgotEmail, otp);
      setOtpVerified(true);
      setSuccessMsg("OTP verified! Enter your new password below.");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password: Step 3 — Reset Password ──────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    // Client-side password validation before sending
    const pwdError = validatePassword(newPassword);
    if (pwdError) { setError(pwdError); setLoading(false); return; }

    try {
      await resetPassword(forgotEmail, otp, newPassword);
      setSuccessMsg("Password reset successfully! You can now log in.");
      setTimeout(() => {
        setShowForgotPassword(false);
        setOtpSent(false);
        setOtpVerified(false);
        setForgotEmail("");
        setOtp("");
        setNewPassword("");
        setSuccessMsg("");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Step label for forgot-password flow ───────────────────────────────────
  const stepLabel = !otpSent ? "Step 1 of 3 — Enter your email" : !otpVerified ? "Step 2 of 3 — Enter OTP" : "Step 3 of 3 — Set new password";

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={glossLayer} />
        <h1 style={{ color: "#fff", marginBottom: "8px" }}>Small Scale Hotel</h1>
        <p style={{ color: "#cbd5e1", marginBottom: "4px" }}>
          {showForgotPassword ? "Reset your password" : isLogin ? "Login to continue" : "Create an account"}
        </p>
        {showForgotPassword && (
          <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "20px" }}>{stepLabel}</p>
        )}

        {error && <div style={errorStyle}>{error}</div>}
        {successMsg && <div style={successStyle}>{successMsg}</div>}

        {/* ── LOGIN / REGISTER FORM ── */}
        {!showForgotPassword ? (
          <form onSubmit={handleSubmit}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            <label style={labelStyle}>Password</label>
            <input
              type="password"
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isLogin ? "Enter password" : "Min 6 chars, 1 uppercase"}
              required
            />
            {!isLogin && <PasswordStrengthBar password={password} />}

            {!isLogin && (
              <>
                <label style={labelStyle}>Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  style={inputStyle}
                  onChange={(e) => setImage(e.target.files[0])}
                  required
                />
                <label style={labelStyle}>Mobile (optional)</label>
                <input
                  style={inputStyle}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 XXXXXXXXXX"
                />
              </>
            )}

            <button style={buttonStyle} disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
            </button>

            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
              style={{ background: "none", border: "none", color: "#93c5fd", marginBottom: "8px", cursor: "pointer", display: "block" }}
            >
              {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </button>

            {isLogin && (
              <button
                type="button"
                onClick={() => { setShowForgotPassword(true); setError(""); }}
                style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer" }}
              >
                Forgot Password?
              </button>
            )}
          </form>
        ) : (
          /* ── FORGOT PASSWORD FLOW ── */
          <form
            onSubmit={!otpSent ? handleForgotPassword : !otpVerified ? handleVerifyOTP : handleResetPassword}
          >
            {/* Step 1: Email input (always visible) */}
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              style={{ ...inputStyle, background: otpSent ? "rgba(255,255,255,0.06)" : inputStyle.background }}
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="Registered email"
              required
              disabled={otpSent}
            />

            {/* Step 2: OTP input */}
            {otpSent && !otpVerified && (
              <>
                <label style={labelStyle}>Enter OTP</label>
                <input
                  style={{ ...inputStyle, textAlign: "center", letterSpacing: "8px", fontSize: "20px" }}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="------"
                  maxLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: "12px", marginTop: "-8px", marginBottom: "12px", display: "block" }}
                >
                  Resend OTP
                </button>
              </>
            )}

            {/* Step 3: New password */}
            {otpVerified && (
              <>
                <label style={labelStyle}>New Password</label>
                <input
                  type="password"
                  style={inputStyle}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 chars, 1 uppercase"
                  required
                />
                <PasswordStrengthBar password={newPassword} />
              </>
            )}

            <button style={buttonStyle} disabled={loading}>
              {loading
                ? "Processing..."
                : !otpSent
                ? "Send OTP"
                : !otpVerified
                ? "Verify OTP"
                : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setOtpSent(false);
                setOtpVerified(false);
                setForgotEmail("");
                setOtp("");
                setNewPassword("");
                setError("");
                setSuccessMsg("");
              }}
              style={{ background: "none", border: "none", color: "#93c5fd", cursor: "pointer" }}
            >
              ← Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}