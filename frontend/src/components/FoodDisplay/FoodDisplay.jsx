import { useContext } from "react";
import PropTypes from "prop-types";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import { FiAlertCircle } from "react-icons/fi";

const FoodDisplay = ({ category, search }) => {
  const { food_list } = useContext(StoreContext);

  const filteredFoods = food_list.filter((item) => {
    const itemCategory = item.category || "";
    const itemName = item.name || "";
    const itemDesc = item.description || "";

    const matchesCategory =
      category === "All" || category.toLowerCase() === itemCategory.toLowerCase();

    const searchTerm = search.toLowerCase().trim();
    const matchesSearch =
      searchTerm === "" ||
      itemName.toLowerCase().includes(searchTerm) ||
      itemDesc.toLowerCase().includes(searchTerm) ||
      itemCategory.toLowerCase().includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

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

FoodDisplay.propTypes = {
  category: PropTypes.string.isRequired,
  search: PropTypes.string.isRequired,
};

export default FoodDisplay;