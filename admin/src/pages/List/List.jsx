import { useCallback, useEffect, useState } from "react";
import "./List.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useContext } from "react";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const List = ({ url }) => {
  const navigate = useNavigate();
  const { token,admin } = useContext(StoreContext);
  const [list, setList] = useState([]);

  const fetchList = useCallback(async () => {
    const response = await axios.get(`${url}/api/food/list`);
    if (response.data.success) {
      setList(response.data.data);
    } else {
      toast.error("Error");
    }
  }, [url]);

  const removeFood = async (foodId) => {
    const response = await axios.post(
      `${url}/api/food/remove`,
      { id: foodId },
      { headers: { token } }
    );
    await fetchList();
    if (response.data.success) {
      toast.success(response.data.message);
    } else {
      toast.error("Error");
    }
  };
  useEffect(() => {
    if (!admin && !token) {
      toast.error("Please Login First");
      navigate("/");
    }
    fetchList();
  }, [admin, fetchList, navigate, token]);

  return (
    <div className="list add flex-col">
      <div className="page-heading">
        <span>Catalog / 02</span>
        <h1>Menu items</h1>
        <p>Review what’s available and keep the menu current.</p>
      </div>
      <div className="list-toolbar">
        <span>Current menu</span>
        <strong>{list.length} {list.length === 1 ? "dish" : "dishes"}</strong>
      </div>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>
        {list.map((item) => {
          return (
            <div key={item._id} className="list-table-format">
              <img src={`${url}/images/` + item.image} alt={item.name} />
              <p>{item.name}</p>
              <p><span className="menu-category">{item.category}</span></p>
              <p className="menu-price">${item.price}</p>
              <button type="button" onClick={() => removeFood(item._id)} className="remove-item" aria-label={`Remove ${item.name}`}>
                Remove
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

List.propTypes = {
  url: PropTypes.string.isRequired,
};

export default List;
