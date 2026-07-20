import { useContext, useEffect, useState } from "react";
import "./Add.css";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const Add = ({ url }) => {
  const navigate=useNavigate();
  const {token,admin} = useContext(StoreContext);
  const [image, setImage] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Traditional Dishes",
    rating: 4.8,
    spiceLevel: "Medium",
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
    formData.append("rating", data.rating);
    formData.append("spiceLevel", data.spiceLevel);
    formData.append("image", image);

    const response = await axios.post(`${url}/api/food/add`, formData,{headers:{token}});
    if (response.data.success) {
      setData({
        name: "",
        description: "",
        price: "",
        category: "Traditional Dishes",
        rating: 4.8,
        spiceLevel: "Medium",
      });
      setImage(false);
      toast.success(response.data.message);
    } else {
      toast.error(response.data.message);
    }
  };
  useEffect(() => {
    if (!admin && !token) {
      toast.error("Please Login First");
      navigate("/");
    }
  }, [admin, navigate, token]);
  return (
    <div className="add">
      <form onSubmit={onSubmitHandler} className="flex-col">
        <div className="add-img-upload flex-col">
          <p>Upload image</p>
          <label htmlFor="image">
            <img
              src={image ? URL.createObjectURL(image) : assets.upload_area}
              alt=""
            />
          </label>
          <input
            onChange={(e) => setImage(e.target.files[0])}
            type="file"
            id="image"
            hidden
            required
          />
        </div>
        <div className="add-product-name flex-col">
          <p>Product name</p>
          <input
            onChange={onChangeHandler}
            value={data.name}
            type="text"
            name="name"
            placeholder="Type here"
            required
          />
        </div>
        <div className="add-product-description flex-col">
          <p>Product description</p>
          <textarea
            onChange={onChangeHandler}
            value={data.description}
            name="description"
            rows="6"
            placeholder="Write content here"
            required
          ></textarea>
        </div>
        <div className="add-category-price">
          <div className="add-category flex-col">
            <p>Product category</p>
            <select
              name="category"
              required
              onChange={onChangeHandler}
              value={data.category}
            >
              <option value="Traditional Dishes">Traditional Dishes</option>
              <option value="Meat Dishes">Meat Dishes</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Coffee and Tea">Coffee and Tea</option>
              <option value="Snacks">Snacks</option>
              <option value="Drinks">Drinks</option>
              <option value="Desserts">Desserts</option>
            </select>
          </div>
          <div className="add-price flex-col">
            <p>Product price</p>
            <input
              onChange={onChangeHandler}
              value={data.price}
              type="Number"
              name="price"
              placeholder="420 ETB"
              required
            />
          </div>
          <div className="add-rating flex-col">
            <p>Rating</p>
            <input
              type="number"
              min="1"
              max="5"
              step="0.1"
              name="rating"
              value={data.rating}
              onChange={onChangeHandler}
            />
         </div>
         <div className="add-spice flex-col">
          <p>Spice Level</p>

           <select
             name="spiceLevel"
             value={data.spiceLevel}
             onChange={onChangeHandler}
     >
            <option value="Mild">🌱 Mild</option>
            <option value="Medium">🌶 Medium</option>
            <option value="Hot">🔥 Hot</option>
          </select>
         </div>
        </div>
        <button type="submit" className="add-btn">
          ADD
        </button>
      </form>
    </div>
  );
};

Add.propTypes = {
  url: PropTypes.string.isRequired,
};

export default Add;
