import axios from "axios";
import PropTypes from "prop-types";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  // FIXED: was hardcoded "http://localhost:4000" — breaks in production.
  // Now reads from VITE_API_URL env variable. Falls back to localhost for local dev.
  const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);

  const addToCart = async (itemId) => {
    const safeCart = cartItems || {};
    if (!safeCart[itemId]) {
      setCartItems((prev) => ({ ...(prev || {}), [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...(prev || {}), [itemId]: (prev || {})[itemId] + 1 }));
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
    setCartItems((prev) => {
      const currentCount = prev[itemId] || 0;
      if (currentCount <= 1) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: currentCount - 1 };
    });
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
    if (!cartItems || typeof cartItems !== "object") return 0;
    let totalAmount = 0;
    for (const item in cartItems) {
      const quantity = cartItems[item] || 0;
      if (quantity > 0) {
        const itemInfo = food_list.find((product) => product._id === item);
        if (!itemInfo || itemInfo.price == null) {
          continue;
        }
        totalAmount += itemInfo.price * quantity;
      }
    }
    return totalAmount;
  };

  const fetchFoodList = async () => {
    const response = await axios.get(url + "/api/food/list");
    if (response.data.success) {
      const normalizedFoodList = Array.isArray(response.data.data)
        ? response.data.data.filter((item) => item && item._id != null)
        : [];
      setFoodList(normalizedFoodList);
    } else {
      alert("Error! Products are not fetching..");
    }
  };

  const loadCardData = async (token) => {
    try {
      const response = await axios.post(
        url + "/api/cart/get",
        {},
        { headers: { token } }
      );
      // Guard: cartData may be undefined for new users or empty carts
      if (response.data && response.data.cartData) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      console.log("Error loading cart data:", error);
    }
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
