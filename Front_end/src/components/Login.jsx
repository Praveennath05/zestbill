import { useState } from "react";
import {
  login,
  register,
  forgotPassword,
  verifyOTP,
  resetPassword,
} from "../api/api";

export default function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [image, setImage] = useState(null); // Store File initially
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotMobile, setForgotMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  //Styles
  const pageStyle = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    backgroundImage: "url('/98.jpeg')",
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

  //Helper to convert File to Base64
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };



  //Handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const res = await login(email, password);
        // Token already set in login function
      } else {
        if (!image) throw new Error("Profile image is required");

        // Convert image File to Base64
        const base64Image = await getBase64(image);

        const res = await register(email, password, base64Image, mobile);
        // Token already set in register function
      }

      onLogin();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Something went wrong";
      setError(errorMessage);
      console.error("Login/Register error:", err);
    } finally {
      setLoading(false);
    }
  };


  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await forgotPassword(forgotMobile);
      setOtpSent(true);
      console.log("OTP sent:", res.otp);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to send OTP";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await verifyOTP(forgotMobile, otp);
      setOtpVerified(true);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Invalid OTP";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await resetPassword(forgotMobile, otp, newPassword);
      alert("Password reset successful");
      setShowForgotPassword(false);
      setOtpSent(false);
      setOtpVerified(false);
      setForgotMobile("");
      setOtp("");
      setNewPassword("");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Reset failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Render
  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={glossLayer} />
        <h1 style={{ color: "#fff", marginBottom: "8px" }}>Small Scale Hotel</h1>
        <p style={{ color: "#cbd5e1", marginBottom: "24px" }}>
          {showForgotPassword ? "Reset your password" : isLogin ? "Login to continue" : "Create an account"}
        </p>

        {error && <div style={errorStyle}>{error}</div>}

        {!showForgotPassword ? (
          <form onSubmit={handleSubmit}>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} required />

            <label style={labelStyle}>Password</label>
            <input type="password" style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} required />

            {!isLogin && (
              <>
                <label style={labelStyle}>Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  style={inputStyle}
                  onChange={(e) => setImage(e.target.files[0])} // store File object
                  required
                />
                <label style={labelStyle}>Mobile</label>
                <input style={inputStyle} value={mobile} onChange={(e) => setMobile(e.target.value)} />
              </>
            )}

            <button style={buttonStyle} disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
            </button>

            <button type="button" onClick={() => setIsLogin(!isLogin)} style={{ background: "none", border: "none", color: "#93c5fd", marginBottom: "8px", cursor: "pointer" }}>
              {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </button>

            {isLogin && (
              <button type="button" onClick={() => setShowForgotPassword(true)} style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer" }}>
                Forgot Password?
              </button>
            )}
          </form>
        ) : (
          <form
            onSubmit={
              !otpSent ? handleForgotPassword : !otpVerified ? handleVerifyOTP : handleResetPassword
            }
          >
            <label style={labelStyle}>Mobile Number</label>
            <input style={inputStyle} value={forgotMobile} onChange={(e) => setForgotMobile(e.target.value)} required />

            {otpSent && !otpVerified && (
              <>
                <label style={labelStyle}>OTP</label>
                <input style={{ ...inputStyle, textAlign: "center", letterSpacing: "6px" }} value={otp} onChange={(e) => setOtp(e.target.value)} />
              </>
            )}

            {otpVerified && (
              <>
                <label style={labelStyle}>New Password</label>
                <input type="password" style={inputStyle} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </>
            )}

            <button style={buttonStyle} disabled={loading}>
              {loading ? "Processing..." : !otpSent ? "Send OTP" : otpVerified ? "Reset Password" : "Verify OTP"}
            </button>

            <button type="button" onClick={() => setShowForgotPassword(false)} style={{ background: "none", border: "none", color: "#93c5fd", cursor: "pointer" }}>
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
