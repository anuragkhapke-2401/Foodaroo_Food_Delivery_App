import { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom'

const PlaceOrder = () => {
  const navigate= useNavigate();

  const { getTotalCartAmount, token, food_list, cartItems, url } =
    useContext(StoreContext);
  const cartTotal = getTotalCartAmount();
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    let orderItems = [];
    food_list.map((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = item;
        itemInfo["quantity"] = cartItems[item._id];
        orderItems.push(itemInfo);
      }
    });
    let orderData = {
      address: data,
      items: orderItems,
      amount: cartTotal + 2,
    };
    
    let response= await axios.post(url+"/api/order/place",orderData,{headers:{token}});
    if(response.data.success){
      const {session_url}=response.data;
      window.location.replace(session_url);
    }else{
      toast.error("Errors!")
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error("Please Login first");
      navigate("/cart");
    } else if (cartTotal === 0) {
      toast.error("Please Add Items to Cart");
      navigate("/cart");
    }
  }, [cartTotal, navigate, token]);

  const itemCount = Object.values(cartItems).reduce((total, quantity) => total + quantity, 0);
  const subtotal = cartTotal;
  const deliveryFee = subtotal === 0 ? 0 : 2;

  return (
    <form className="place-order" onSubmit={placeOrder}>
      <div className="place-order-left">
        <div className="checkout-intro">
          <div className="checkout-progress" aria-label="Checkout step 1 of 2">
            <span className="checkout-progress-current"><b>01</b> Delivery</span>
            <span className="checkout-progress-line" />
            <span className="checkout-progress-next"><b>02</b> Payment</span>
          </div>
          <p className="checkout-kicker">FOODAROO / CHECKOUT</p>
          <h1 className="title">Delivery Information</h1>
          <p className="checkout-intro-copy">Where should we bring your order?</p>
        </div>
        <section className="checkout-fields" aria-labelledby="delivery-details-title">
          <div className="checkout-section-heading">
            <span>01</span>
            <div>
              <h2 id="delivery-details-title">Your details</h2>
              <p>We’ll use these details for delivery updates.</p>
            </div>
          </div>
          <div className="multi-fields">
          <input
            required
            name="firstName"
            value={data.firstName}
            onChange={onChangeHandler}
            type="text"
            placeholder="First name"
            autoComplete="given-name"
          />
          <input
            required
            name="lastName"
            value={data.lastName}
            onChange={onChangeHandler}
            type="text"
            placeholder="Last name"
            autoComplete="family-name"
          />
          </div>
        <input
          required
          name="email"
          value={data.email}
          onChange={onChangeHandler}
          type="email"
          placeholder="Email Address"
          autoComplete="email"
        />
        <input
          required
          name="street"
          value={data.street}
          onChange={onChangeHandler}
          type="text"
          placeholder="Street"
          autoComplete="street-address"
        />
        <div className="multi-fields">
          <input
            required
            name="city"
            value={data.city}
            onChange={onChangeHandler}
            type="text"
            placeholder="City"
            autoComplete="address-level2"
          />
          <input
            required
            name="state"
            value={data.state}
            onChange={onChangeHandler}
            type="text"
            placeholder="State"
            autoComplete="address-level1"
          />
        </div>
        <div className="multi-fields">
          <input
            required
            name="zipcode"
            value={data.zipcode}
            onChange={onChangeHandler}
            type="text"
            placeholder="Zip Code"
            autoComplete="postal-code"
          />
          <input
            required
            name="country"
            value={data.country}
            onChange={onChangeHandler}
            type="text"
            placeholder="Country"
            autoComplete="country-name"
          />
        </div>
        <input
          required
          name="phone"
          value={data.phone}
          onChange={onChangeHandler}
          type="tel"
          placeholder="Phone"
          autoComplete="tel"
        />
        </section>
      </div>
      <div className="place-order-right">
        <aside className="checkout-summary" aria-labelledby="order-summary-title">
          <div className="checkout-summary-heading">
            <div>
              <span className="checkout-summary-kicker">YOUR ORDER</span>
              <h2 id="order-summary-title">Order summary</h2>
            </div>
            <span className="checkout-item-count">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
          </div>
          <div className="checkout-summary-items">
            {food_list.map((item) => cartItems[item._id] > 0 && (
              <div className="checkout-summary-item" key={item._id}>
                <span className="checkout-summary-quantity">{cartItems[item._id]}×</span>
                <span className="checkout-summary-name">{item.name}</span>
                <strong>${item.price * cartItems[item._id]}</strong>
              </div>
            ))}
          </div>
          <div className="checkout-summary-totals">
            <div className="checkout-summary-row">
              <span>Subtotal</span>
              <strong>${subtotal}</strong>
            </div>
            <div className="checkout-summary-row">
              <span>Delivery</span>
              <strong>{deliveryFee === 0 ? "Free" : `$${deliveryFee}`}</strong>
            </div>
          </div>
          <div className="checkout-summary-total">
            <span>Total</span>
            <strong>${subtotal === 0 ? 0 : subtotal + deliveryFee}</strong>
          </div>
          <button className="checkout-payment-button" type="submit">
            Continue to payment <span aria-hidden="true">↗</span>
          </button>
          <p className="checkout-secure-note">Secure payment powered by Stripe</p>
        </aside>
      </div>
    </form>
  );
};

export default PlaceOrder;
