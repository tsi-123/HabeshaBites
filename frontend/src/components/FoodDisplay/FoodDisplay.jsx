import { useContext } from "react";
import PropTypes from "prop-types";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";

const FoodDisplay = ({ category, search }) => {
  const { food_list } = useContext(StoreContext);

  return (
    <div className="food-display" id="food-display">
      <h2>Top dishes near you</h2>

      <div className="food-display-list">
        {food_list
          .filter((item) => {
            const matchesCategory =
              category === "All" || category === item.category;

            const matchesSearch =
              item.name.toLowerCase().includes(search.toLowerCase());

            return matchesCategory && matchesSearch;
          })
          .map((item) => (
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
    </div>
  );
};

FoodDisplay.propTypes = {
  category: PropTypes.string.isRequired,
  search: PropTypes.string.isRequired,
};

export default FoodDisplay;