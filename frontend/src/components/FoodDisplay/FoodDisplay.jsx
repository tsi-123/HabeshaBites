import { useContext } from "react";
import PropTypes from "prop-types";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import { FiAlertCircle } from "react-icons/fi";

const FoodDisplay = ({ category, search }) => {
  const { food_list, foodLoading, foodError } = useContext(StoreContext);
  const safeFoodList = Array.isArray(food_list) ? food_list : [];

  const filteredFoods = safeFoodList.filter((item) => {
    if (!item || !item._id) return false;

    const itemCategory = item.category || "";
    const itemName = item.name || "";
    const itemDesc = item.description || "";
    const searchTerm = typeof search === "string" ? search.toLowerCase().trim() : "";

    const matchesCategory =
      category === "All" || category.toLowerCase() === itemCategory.toLowerCase();

    const matchesSearch =
      searchTerm === "" ||
      itemName.toLowerCase().includes(searchTerm) ||
      itemDesc.toLowerCase().includes(searchTerm) ||
      itemCategory.toLowerCase().includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  if (foodLoading) {
    return (
      <div className="food-display" id="food-display">
        <h2>Top dishes near you</h2>
        <div className="search-no-results">
          <FiAlertCircle className="no-results-icon" />
          <h3>Loading menu...</h3>
          <p>Fetching the latest dishes from our kitchen.</p>
        </div>
      </div>
    );
  }

  if (foodError && filteredFoods.length === 0) {
    return (
      <div className="food-display" id="food-display">
        <h2>Top dishes near you</h2>
        <div className="search-no-results">
          <FiAlertCircle className="no-results-icon" />
          <h3>Menu unavailable</h3>
          <p>{foodError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="food-display" id="food-display">
      <h2>Top dishes near you</h2>

      {filteredFoods.length === 0 ? (
        <div className="search-no-results">
          <FiAlertCircle className="no-results-icon" />
          <h3>No Dishes Found</h3>
          <p>We couldn't find any dishes matching "{search}". Try searching for something else!</p>
        </div>
      ) : (
        <div className="food-display-list">
          {filteredFoods.map((item) => (
            <FoodItem
              key={item._id}
              id={item._id}
              name={item.name || "Delicious Dish"}
              description={item.description || "A flavorful dish"}
              price={item.price ?? 0}
              image={item.image || ""}
              rating={Number.isFinite(Number(item.rating)) ? Number(item.rating) : 4.8}
              spiceLevel={item.spiceLevel || ""}
            />
          ))}
        </div>
      )}
    </div>
  );
};

FoodDisplay.propTypes = {
  category: PropTypes.string.isRequired,
  search: PropTypes.string.isRequired,
};

export default FoodDisplay;