import { useContext, useState } from "react";
import "./Home.css";
import Header from "../../components/Header/Header";
import SearchBar from "../../components/SearchBar/SearchBar";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import AppDownload from "../../components/AppDownload/AppDownload";
import { StoreContext } from "../../context/StoreContext";

const Home = () => {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const { foodLoading } = useContext(StoreContext);

  return (
    <div>
      <Header />
      <SearchBar search={search} setSearch={setSearch} />
      <ExploreMenu category={category} setCategory={setCategory} />
      {foodLoading ? (
        <div className="food-display" id="food-display">
          <h2>Top dishes near you</h2>
          <div className="search-no-results">
            <h3>Loading delicious dishes...</h3>
            <p>Our menu is loading. Please wait a moment.</p>
          </div>
        </div>
      ) : (
        <FoodDisplay category={category} search={search} />
      )}
      <AppDownload />
    </div>
  );
};

export default Home;
