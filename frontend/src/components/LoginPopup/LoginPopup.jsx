import { useContext, useEffect, useState } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/frontend_assets/assets";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

const LoginPopup = ({ setShowLogin }) => {
  const {url, setToken } = useContext(StoreContext);
  const [currentState, setCurrentState] = useState("Login");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  useEffect(() => {
    if (resendCountdown === 0) return undefined;
    const timeout = setTimeout(() => setResendCountdown((current) => current - 1), 1000);
    return () => clearTimeout(timeout);
  }, [resendCountdown]);

  const sendOtp = async () => {
    const response = await axios.post(url + "/api/user/register/send-otp", data);
    if (!response.data.success) {
      toast.error(response.data.message);
      return false;
    }
    setOtpSent(true);
    setResendCountdown(60);
    toast.success(response.data.message);
    return true;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      if (currentState === "Sign Up" && !otpSent) {
        await sendOtp();
        return;
      }

      const response = currentState === "Login"
        ? await axios.post(url + "/api/user/login", data)
        : await axios.post(url + "/api/user/register/verify-otp", { email: data.email, otp });
      if (!response.data.success) {
        toast.error(response.data.message);
        return;
      }
      setToken(response.data.token);
      localStorage.setItem("token", response.data.token);
      toast.success(currentState === "Login" ? "Welcome back" : "Email verified. Account created");
      setShowLogin(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to reach the server. Try again");
    }
  };

  const switchState = (state) => {
    setCurrentState(state);
    setOtpSent(false);
    setOtp("");
    setResendCountdown(0);
  };

  return (
    <div className="login-popup">
      <form onSubmit={onSubmit} className="login-popup-container">
        <div className="login-popup-title">
          <div>
            <span className="login-popup-eyebrow">Foodaroo account</span>
            <h2>{otpSent ? "Check your email" : currentState === "Login" ? "Welcome back" : "Create your account"}</h2>
            {otpSent && <p>Enter the six-digit code we sent to {data.email}.</p>}
          </div>
          <img
            onClick={() => setShowLogin(false)}
            src={assets.cross_icon}
            alt="Close"
            role="button"
            tabIndex={0}
            onKeyDown={(event) => event.key === "Enter" && setShowLogin(false)}
          />
        </div>
        <div className="login-popup-inputs">
          {currentState === "Sign Up" && !otpSent && (
            <input
              name="name"
              onChange={onChangeHandler}
              value={data.name}
              type="text"
              placeholder="Your name"
              required
            />
          )}
          {!otpSent && <>
            <input
              name="email"
              onChange={onChangeHandler}
              value={data.email}
              type="email"
              placeholder="Your email"
              autoComplete="email"
              required
            />
            <input
              name="password"
              onChange={onChangeHandler}
              value={data.password}
              type="password"
              placeholder="Your password"
              autoComplete={currentState === "Login" ? "current-password" : "new-password"}
              minLength={8}
              required
            />
          </>}
          {otpSent && <input
            name="otp"
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
            value={otp}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="6-digit code"
            aria-label="Email verification code"
            required
          />}
        </div>
        <button type="submit">
          {currentState === "Login" ? "Log in" : otpSent ? "Verify & create account" : "Email me a code"}
        </button>
        {otpSent && <p className="login-popup-resend">
          Didn’t get the code?{" "}
          <button type="button" disabled={resendCountdown > 0} onClick={sendOtp}>
            {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend code"}
          </button>
        </p>}
        {!otpSent && <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>By continuing, I agree to the terms of use and privacy policy.</p>
        </div>}
        {!otpSent && (currentState === "Login" ? (
          <p>
            Create a new account?{" "}
            <span onClick={() => switchState("Sign Up")}>Sign up</span>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <span onClick={() => switchState("Login")}>Log in</span>
          </p>
        ))}
      </form>
    </div>
  );
};

LoginPopup.propTypes = {
  setShowLogin: PropTypes.func.isRequired,
};

export default LoginPopup;
