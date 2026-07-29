import { useContext } from "react";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../../components/FoodItem/FoodItem";
import { FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Favourites.css";

const Favourites = () => {
  const { favorites, food_list } = useContext(StoreContext);
  const navigate = useNavigate();

  const favoriteDishes = food_list.filter((item) => favorites.includes(item._id));

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
              key={item._id}
              id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
              rating={item.rating}
              spiceLevel={item.spiceLevel}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favourites;
