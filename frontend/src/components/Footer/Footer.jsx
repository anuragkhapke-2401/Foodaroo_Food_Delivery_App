import "./Footer.css";
import { assets } from "../../assets/frontend_assets/assets";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
          <span className="footer-brand">foodaroo<span>.</span></span>
          <p>
            Good food has a way of making the day better. Find your next
            favorite and we’ll bring it fresh to your door.
          </p>
          <div className="footer-social-icons">
            <img src={assets.facebook_icon} alt="" />
            <img src={assets.twitter_icon} alt="" />
            <img src={assets.linkedin_icon} alt="" />
          </div>
        </div>
        <div className="footer-content-center">
          <h2>Company</h2>
          <ul>
            <li>Home</li>
            <li>About us</li>
            <li>Delivery</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>Order support</h2>
          <ul>
            <li>Need an update on a delivery?</li>
            <li><Link to="/myorders">Check your order history</Link></li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">
        © 2026 Foodaroo. Made for the moments around the table.
      </p>
    </div>
  );
};

export default Footer;
