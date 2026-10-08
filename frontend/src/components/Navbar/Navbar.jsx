import { useContext, useState } from "react";
import "./Navbar.css";
import { assets } from "../../assets/frontend_assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const { getTotalCartAmount, token, setToken } = useContext(StoreContext);
  const navigate=useNavigate();

  const navigateToSection = (sectionId, menuItem) => {
    setMenu(menuItem);
    navigate({ pathname: "/", hash: `#${sectionId}` });
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "instant", block: "start" });
  };

  const logout=()=>{
    localStorage.removeItem("token");
    setToken("");
    toast.success("Logout Successfully")
    navigate("/");
  }
  return (
    <div className="navbar">
      <Link to="/" className="brand-link" aria-label="Foodaroo home">
        <span className="brand-mark" aria-hidden="true">f</span>
        <span className="brand-wordmark">foodaroo<span>.</span></span>
      </Link>
      <ul className="navbar-menu">
        <Link
          to="/"
          onClick={() => setMenu("home")}
          className={menu === "home" ? "active" : ""}
        >
          Home
        </Link>
        <Link
          to="/#explore-menu"
          onClick={(event) => {
            event.preventDefault();
            navigateToSection("explore-menu", "menu");
          }}
          className={menu === "menu" ? "active" : ""}
        >
          Menu
        </Link>
        <Link
          to="/#app-download"
          onClick={(event) => {
            event.preventDefault();
            navigateToSection("app-download", "mobile-app");
          }}
          className={menu === "mobile-app" ? "active" : ""}
        >
          Get the app
        </Link>
        <Link
          to="/#footer"
          onClick={(event) => {
            event.preventDefault();
            navigateToSection("footer", "contact-us");
          }}
          className={menu === "contact-us" ? "active" : ""}
        >
          Contact
        </Link>
      </ul>
      <div className="navbar-right">
        <img src={assets.search_icon} alt="" />
        <div className="navbar-search-icon">
          <Link to="/cart">
            <img src={assets.basket_icon} alt="" />
          </Link>
          <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
        </div>
        {!token ? (
          <button onClick={() => setShowLogin(true)}>Sign in</button>
        ) : (
          <div className="navbar-profile">
            <img src={assets.profile_icon} alt="" />
            <ul className="nav-profile-dropdown">
              <li onClick={()=>navigate("/myorders")}><img src={assets.bag_icon} alt="" /><p>Orders</p></li>
              <hr />
              <li onClick={logout}><img src={assets.logout_icon} alt="" /><p>Logout</p></li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

Navbar.propTypes = {
  setShowLogin: PropTypes.func.isRequired,
};

export default Navbar;
