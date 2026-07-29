import axios from "axios";
import PropTypes from "prop-types";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const url = "http://localhost:4000";
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);

  const addToCart = async (itemId) => {
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }
    if (token) {
      const response=await axios.post(
        url + "/api/cart/add",
        { itemId },
        { headers: { token } }
      );
      if(response.data.success){
        toast.success("item Added to Cart")
      }else{
        toast.error("Something went wrong")
      }
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    if (token) {
      const response= await axios.post(
        url + "/api/cart/remove",
        { itemId },
        { headers: { token } }
      );
      if(response.data.success){
        toast.success("item Removed from Cart")
      }else{
        toast.error("Something went wrong")
      }
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => product._id === item);
        totalAmount += itemInfo.price * cartItems[item];
      }
    }
    return totalAmount;
  };

  const fetchFoodList = async () => {
    const response = await axios.get(url + "/api/food/list");
    if (response.data.success) {
      setFoodList(response.data.data);
    } else {
      alert("Error! Products are not fetching..");
    }
  };

  const loadCardData = async (token) => {
    const response = await axios.post(
      url + "/api/cart/get",
      {},
      { headers: { token } }
    );
    setCartItems(response.data.cartData);
  };

  const [favorites, setFavorites] = useState([]);

  const fetchFavorites = async (userToken) => {
    try {
      const response = await axios.get(url + "/api/favourites", {
        headers: { token: userToken },
      });
      if (response.data.success) {
        setFavorites(response.data.data.map((item) => item._id));
      }
    } catch (error) {
      console.log("Error fetching favorites", error);
    }
  };

  const addToFavorites = async (foodId) => {
    if (!token) {
      toast.error("Please login to add favorites");
      return;
    }
    try {
      const response = await axios.post(
        url + "/api/favourites/add",
        { foodId },
        { headers: { token } }
      );
      if (response.data.success) {
        setFavorites((prev) => [...prev, foodId]);
        toast.success("Added to Favourites");
      } else {
        toast.error(response.data.message || "Failed to add to favourites");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error adding to favourites");
    }
  };

  const removeFromFavorites = async (foodId) => {
    if (!token) return;
    try {
      const response = await axios.delete(
        `${url}/api/favourites/remove/${foodId}`,
        { headers: { token } }
      );
      if (response.data.success) {
        setFavorites((prev) => prev.filter((id) => id !== foodId));
        toast.success("Removed from Favourites");
      } else {
        toast.error(response.data.message || "Failed to remove from favourites");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error removing from favourites");
    }
  };

  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      if (localStorage.getItem("token")) {
        const storedToken = localStorage.getItem("token");
        setToken(storedToken);
        await loadCardData(storedToken);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (token) {
      fetchFavorites(token);
    } else {
      setFavorites([]);
    }
  }, [token]);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
    favorites,
    addToFavorites,
    removeFromFavorites,
  };
  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

StoreContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default StoreContextProvider;
