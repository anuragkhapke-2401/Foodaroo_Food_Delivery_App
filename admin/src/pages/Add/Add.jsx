import { useState } from "react";
import "./Add.css";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { useContext } from "react";
import { StoreContext } from "../../context/StoreContext";
import { useEffect } from "react";
import {useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const Add = ({url}) => {
  const navigate=useNavigate();
  const {token,admin} = useContext(StoreContext);
  const [image, setImage] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Salad",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("category", data.category);
    formData.append("image", image);

    const response = await axios.post(`${url}/api/food/add`, formData,{headers:{token}});
    if (response.data.success) {
      setData({
        name: "",
        description: "",
        price: "",
        category: "Salad",
      });
      setImage(false);
      toast.success(response.data.message);
    } else {
      toast.error(response.data.message);
    }
  };
  useEffect(()=>{
    if(!admin && !token){
      toast.error("Please Login First");
       navigate("/");
    }
  }, [admin, navigate, token]);
  return (
    <div className="add">
      <div className="page-heading">
        <span>Catalog / 01</span>
        <h1>Add a dish</h1>
        <p>Give your next menu favorite a place on the board.</p>
      </div>
      <form onSubmit={onSubmitHandler} className="add-form">
        <section className="add-image-panel">
          <div className="add-field-heading">
            <span>01</span>
            <div>
              <h2>Dish photo</h2>
              <p>Show guests what’s cooking.</p>
            </div>
          </div>
          <label htmlFor="image" className="add-image-target">
            <img
              src={image ? URL.createObjectURL(image) : assets.upload_area}
              alt={image ? `Preview of ${image.name}` : "Upload a dish image"}
            />
            <span>{image ? "Change image" : "Choose image"}</span>
          </label>
          <input
            onChange={(e) => setImage(e.target.files[0])}
            type="file"
            id="image"
            accept="image/*"
            hidden
            required
          />
          <p className="add-image-hint">JPG, PNG or WEBP · clear, well-lit photos work best</p>
        </section>
        <div className="add-fields">
          <label className="add-field add-product-name">
            <span>Dish name</span>
          <input
            onChange={onChangeHandler}
            value={data.name}
            type="text"
            name="name"
            placeholder="Type here"
            required
          />
          </label>
          <label className="add-field add-product-description">
            <span>Description</span>
          <textarea
            onChange={onChangeHandler}
            value={data.description}
            name="description"
            rows="6"
            placeholder="Write content here"
            required
          ></textarea>
          </label>
          <div className="add-field-grid">
            <label className="add-field add-category">
              <span>Category</span>
            <select
              name="category"
              required
              onChange={onChangeHandler}
              value={data.category}
            >
              <option value="Salad">Salad</option>
              <option value="Rolls">Rolls</option>
              <option value="Deserts">Deserts</option>
              <option value="Sandwich">Sandwich</option>
              <option value="Cake">Cake</option>
              <option value="Pure Veg">Pure Veg</option>
              <option value="Pasta">Pasta</option>
              <option value="Noodles">Noodles</option>
            </select>
            </label>
            <label className="add-field add-price">
              <span>Price</span>
              <span className="add-price-input">
                <span>$</span>
            <input
              onChange={onChangeHandler}
              value={data.price}
              type="Number"
              name="price"
              placeholder="$20"
              required
            />
              </span>
            </label>
          </div>
          <div className="add-form-footer">
            <p>New dishes appear in the customer menu as soon as they’re published.</p>
            <button type="submit" className="add-btn">Publish dish <span aria-hidden="true">↗</span></button>
          </div>
        </div>
      </form>
    </div>
  );
};

Add.propTypes = {
  url: PropTypes.string.isRequired,
};

export default Add;
