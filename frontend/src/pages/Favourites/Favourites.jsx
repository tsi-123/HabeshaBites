import { useContext } from "react";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../../components/FoodItem/FoodItem";
import { FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Favourites.css";

const Favourites = () => {
  const { favorites, food_list } = useContext(StoreContext);
  const navigate = useNavigate();

  const safeFoodList = Array.isArray(food_list) ? food_list : [];
  const favoriteDishes = safeFoodList.filter((item) => item && favorites.includes(item._id));

  return (
    <div className="favourites-page">
      <h2>My Favourite Dishes</h2>
      {favoriteDishes.length === 0 ? (
        <div className="favourites-empty-state">
          <FaHeart className="empty-heart-icon" />
          <h3>No Favourites Yet</h3>
          <p>Explore our menu and tap the heart icon to save your favorite Ethiopian delicacies!</p>
          <button className="explore-menu-btn" onClick={() => navigate("/")}>
            Explore Menu
          </button>
        </div>
      ) : (
        <div className="favourites-grid">
          {favoriteDishes.map((item) => (
            <FoodItem
              key={item?._id || Math.random()}
              id={item?._id || ""}
              name={item?.name || "Delicious Dish"}
              description={item?.description || "A flavorful dish"}
              price={item?.price ?? 0}
              image={item?.image || ""}
              rating={Number.isFinite(Number(item?.rating)) ? Number(item.rating) : 4.8}
              spiceLevel={item?.spiceLevel || ""}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favourites;
