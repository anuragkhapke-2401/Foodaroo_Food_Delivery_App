import { useContext } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";
import {useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate=useNavigate();
  const {token, admin, setAdmin, setToken } = useContext(StoreContext);
  const logout=()=>{
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    setToken("");
    setAdmin(false);
    toast.success("Logout Successfully")
    navigate("/");
  }
  return (
    <div className="navbar">
      <div className="admin-brand">
        <span className="brand-mark" aria-hidden="true">f</span>
        <span className="admin-brand-copy"><strong>foodaroo<span>.</span></strong><small>ADMIN / OPERATIONS</small></span>
      </div>
      {token && admin ? (
        <button className="login-conditon" onClick={logout}>Log out</button>
      ) : (
        <button className="login-conditon" onClick={()=>navigate("/")}>Log in</button>
      )}
      <img className="profile" src={assets.profile_image} alt="Profile" />
    </div>
  );
};

export default Navbar;
