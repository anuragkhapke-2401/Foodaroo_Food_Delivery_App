import "./Orders.css";
import { useCallback, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { assets } from "../../assets/assets";
import { useContext } from "react";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const Orders = ({ url }) => {
  const navigate = useNavigate();
  const { token, admin } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);

  const fetchAllOrder = useCallback(async () => {
    const response = await axios.get(url + "/api/order/list", {
      headers: { token },
    });
    if (response.data.success) {
      setOrders(response.data.data);
    }
  }, [token, url]);

  const statusHandler = async (event, orderId) => {
    const response = await axios.post(
      url + "/api/order/status",
      {
        orderId,
        status: event.target.value,
      },
      { headers: { token } }
    );
    if (response.data.success) {
      toast.success(response.data.message);
      await fetchAllOrder();
    } else {
      toast.error(response.data.message);
    }
  };
  useEffect(() => {
    if (!admin && !token) {
      toast.error("Please Login First");
      navigate("/");
    }
    fetchAllOrder();
  }, [admin, fetchAllOrder, navigate, token]);

  return (
    <div className="order add">
      <div className="page-heading">
        <span>Fulfillment / 01</span>
        <h1>Orders</h1>
        <p>Keep every order moving from kitchen to doorstep.</p>
      </div>
      <div className="order-queue-heading">
        <span>Order queue</span>
        <strong>{orders.length} {orders.length === 1 ? "order" : "orders"}</strong>
      </div>
      <div className="order-list">
        {orders.length === 0 && (
          <div className="orders-empty">
            <span aria-hidden="true">—</span>
            <h2>No orders yet</h2>
            <p>New customer orders will appear here.</p>
          </div>
        )}
        {orders.map((order) => (
          <article key={order._id} className="order-item">
            <div className="order-item-mark"><img src={assets.parcel_icon} alt="" /></div>
            <div className="order-item-customer">
              <span className="order-item-label">DELIVER TO</span>
              <p className="order-item-name">
                {order.address.firstName + " " + order.address.lastName}
              </p>
              <p className="order-item-food">
                {order.items.map((item, index) => {
                  if (index === order.items.length - 1) {
                    return item.name + " x " + item.quantity;
                  } else {
                    return item.name + " x " + item.quantity + ", ";
                  }
                })}
              </p>
              <div className="order-item-address">
                <p>{order.address.street + ","}</p>
                <p>
                  {order.address.city +
                    ", " +
                    order.address.state +
                    ", " +
                    order.address.country +
                    ", " +
                    order.address.zipcode}
                </p>
              </div>
              <p className="order-item-phone">{order.address.phone}</p>
            </div>
            <div className="order-item-metric">
              <span>ITEMS</span>
              <strong>{order.items.length}</strong>
            </div>
            <div className="order-item-metric order-item-total">
              <span>ORDER TOTAL</span>
              <strong>${order.amount}</strong>
            </div>
            <label className="order-item-status">
              <span>STATUS</span>
            <select
              aria-label={`Status for order ${order._id}`}
              onChange={(event) => statusHandler(event, order._id)}
              value={order.status}
            >
              <option value="Food Processing">Food Processing</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
            </label>
          </article>
        ))}
      </div>
    </div>
  );
};

Orders.propTypes = {
  url: PropTypes.string.isRequired,
};

export default Orders;
