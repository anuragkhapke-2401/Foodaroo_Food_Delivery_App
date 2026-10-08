import { useContext } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const {
    food_list,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url
  } = useContext(StoreContext);

  const navigate=useNavigate();
  const items = food_list.filter((item) => cartItems[item._id] > 0);
  const itemCount = items.reduce((total, item) => total + cartItems[item._id], 0);
  const subtotal = getTotalCartAmount();
  const deliveryFee = subtotal > 0 ? 2 : 0;

  return (
    <div className="cart">
      <header className="cart-page-heading">
        <div>
          <span className="cart-eyebrow">FOODAROO / YOUR ORDER</span>
          <h1>Your basket</h1>
          <p>Good choices. Let’s get them to your table.</p>
        </div>
        <span className="cart-item-count">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
      </header>
      <div className="cart-layout">
        <section className="cart-items" aria-label="Items in your basket">
          <div className="cart-items-heading">
            <span>Your items</span>
            <span>Quantity</span>
            <span>Subtotal</span>
            <span className="cart-remove-heading">Remove</span>
          </div>
          <div className="cart-item-list">
            {items.map((item) => (
              <article className="cart-item" key={item._id}>
                <img src={`${url}/images/${item.image}`} alt={item.name} />
                <div className="cart-item-info">
                  <h2>{item.name}</h2>
                  <p>${item.price} <span>each</span></p>
                </div>
                <div className="cart-quantity-control" aria-label={`Quantity for ${item.name}`}>
                  <button type="button" onClick={() => removeFromCart(item._id)} aria-label={`Remove one ${item.name}`}>−</button>
                  <span>{cartItems[item._id]}</span>
                  <button type="button" onClick={() => addToCart(item._id)} aria-label={`Add one ${item.name}`}>+</button>
                </div>
                <strong className="cart-item-subtotal">${item.price * cartItems[item._id]}</strong>
                <button type="button" onClick={() => removeFromCart(item._id)} className="cart-remove-button" aria-label={`Remove one ${item.name} from basket`}>×</button>
              </article>
            ))}
          </div>
        </section>
        <aside className="cart-summary" aria-labelledby="cart-summary-title">
          <div className="cart-summary-heading">
            <div>
              <span>READY WHEN YOU ARE</span>
              <h2 id="cart-summary-title">Order summary</h2>
            </div>
            <span className="cart-summary-count">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
          </div>
          <div className="cart-summary-lines">
            <div className="cart-summary-line">
              <span>Subtotal</span>
              <strong>${subtotal}</strong>
            </div>
            <div className="cart-summary-line">
              <span>Delivery fee</span>
              <strong>{deliveryFee === 0 ? "Free" : `$${deliveryFee}`}</strong>
            </div>
          </div>
          <div className="cart-summary-total">
            <span>Total</span>
            <strong>${subtotal + deliveryFee}</strong>
          </div>
          <button className="cart-checkout-button" onClick={() => navigate("/order")}>
            Continue to checkout <span aria-hidden="true">↗</span>
          </button>
          <div className="cart-promo">
            <label htmlFor="promo-code">Have a promo code?</label>
            <div className="cart-promo-input">
              <input id="promo-code" type="text" placeholder="Enter code" />
              <button type="button">Apply</button>
            </div>
          </div>
          <p className="cart-secure-note">Secure payment powered by Stripe</p>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
