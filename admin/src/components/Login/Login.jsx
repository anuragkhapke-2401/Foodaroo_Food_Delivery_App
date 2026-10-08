import { useContext, useEffect } from "react";
import "./Login.css";
import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import {useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const Login = ({ url }) => {
  const navigate=useNavigate();
  const {admin,setAdmin,token, setToken } = useContext(StoreContext);
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };
  const onLogin = async (event) => {
    event.preventDefault();
    const response = await axios.post(url + "/api/user/admin/login", data);
    if (response.data.success) {
      if (response.data.role === "admin") {
        setToken(response.data.token);
        setAdmin(true);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("admin", true);
        toast.success("Login Successfully");
        navigate("/add")
      }else{
        toast.error("You are not an admin");
      }
    } else {
      toast.error(response.data.message);
    }
  };
  useEffect(()=>{
    if(admin && token){
       navigate("/add");
    }
  }, [admin, navigate, token]);
  return (
    <div className="login-popup">
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <div>
            <span className="login-eyebrow">Foodaroo / Admin</span>
            <h2>Welcome back</h2>
            <p>Sign in with an administrator account.</p>
          </div>
        </div>
        <div className="login-popup-inputs">
          <input
            name="email"
            onChange={onChangeHandler}
            value={data.email}
            type="email"
            placeholder="Your email"
            required
          />
          <input
            name="password"
            onChange={onChangeHandler}
            value={data.password}
            type="password"
            placeholder="Your password"
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

Login.propTypes = {
  url: PropTypes.string.isRequired,
};

export default Login;
