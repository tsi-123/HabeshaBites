import axios from "axios";
import PropTypes from "prop-types";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const StoreContext = createContext(null);

const normalizeFoodList = (foods) =>
  Array.isArray(foods) ? foods.filter((item) => item && item._id != null) : [];

const sanitizeCartItems = (cartData, menuItems = []) => {
  if (!cartData || typeof cartData !== "object") return {};

  const validFoodIds = new Set(menuItems.map((item) => item._id));
  const sanitized = {};

  Object.entries(cartData).forEach(([itemId, quantity]) => {
    const numericQuantity = Number(quantity);
    if (
      itemId &&
      validFoodIds.has(itemId) &&
      Number.isFinite(numericQuantity) &&
      numericQuantity > 0
    ) {
      sanitized[itemId] = numericQuantity;
    }
  });

  return sanitized;
};

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);
  const [foodLoading, setFoodLoading] = useState(true);
  const [foodError, setFoodError] = useState("");

  const addToCart = async (itemId) => {
    const safeCart = cartItems || {};
    if (!safeCart[itemId]) {
      setCartItems((prev) => ({ ...(prev || {}), [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...(prev || {}), [itemId]: (prev || {})[itemId] + 1 }));
    }
    if (token) {
      const response = await axios.post(
        url + "/api/cart/add",
        { itemId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("item Added to Cart");
      } else {
        toast.error("Something went wrong");
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
      const response = await axios.post(
        url + "/api/cart/remove",
        { itemId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("item Removed from Cart");
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const getTotalCartAmount = () => {
    if (!cartItems || typeof cartItems !== "object") return 0;
    if (!Array.isArray(food_list)) return 0;

    let totalAmount = 0;

    Object.entries(cartItems).forEach(([itemId, quantity]) => {
      const numericQuantity = Number(quantity);
      if (!itemId || !Number.isFinite(numericQuantity) || numericQuantity <= 0) {
        return;
      }

      const itemInfo = food_list.find((product) => product?._id === itemId);
      const normalizedItem = itemInfo && typeof itemInfo === "object" ? itemInfo : null;
      const numericPrice = Number(normalizedItem?.price ?? 0);

      if (!normalizedItem || !Number.isFinite(numericPrice)) {
        console.warn("Skipping cart item without a valid food record", itemId);
        return;
      }

      totalAmount += numericPrice * numericQuantity;
    });

    return totalAmount;
  };

  const fetchFoodList = async () => {
    setFoodLoading(true);
    setFoodError("");

    try {
      const response = await axios.get(url + "/api/food/list");
      if (response.data && response.data.success) {
        const normalizedFoodList = normalizeFoodList(response.data.data);
        setFoodList(normalizedFoodList);
        return normalizedFoodList;
      }

      setFoodError("Unable to load menu right now.");
      setFoodList([]);
      return [];
    } catch (error) {
      console.error("Error loading food list:", error);
      setFoodError("Unable to load menu right now.");
      setFoodList([]);
      return [];
    } finally {
      setFoodLoading(false);
    }
  };

  const loadCardData = async (userToken, menuItems = []) => {
    try {
      const response = await axios.post(
        url + "/api/cart/get",
        {},
        { headers: { token: userToken } }
      );

      if (response.data && response.data.cartData) {
        const sanitizedCart = sanitizeCartItems(response.data.cartData, menuItems);
        if (Object.keys(sanitizedCart).length !== Object.keys(response.data.cartData).length) {
          console.warn("Removed stale cart items that no longer exist in the menu", response.data.cartData);
        }
        setCartItems(sanitizedCart);
      } else {
        setCartItems({});
      }
    } catch (error) {
      console.error("Error loading cart data:", error);
      setCartItems({});
    }
  };

  const [favorites, setFavorites] = useState([]);

  const fetchFavorites = async (userToken) => {
    try {
      const response = await axios.get(url + "/api/favourites", {
        headers: { token: userToken },
      });
      if (response.data.success) {
        const favoritesData = Array.isArray(response.data.data) ? response.data.data : [];
        const normalizedFavorites = favoritesData
          .map((item) => item?._id)
          .filter(Boolean);
        setFavorites(normalizedFavorites);
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
      const menuItems = await fetchFoodList();
      if (localStorage.getItem("token")) {
        const storedToken = localStorage.getItem("token");
        setToken(storedToken);
        await loadCardData(storedToken, menuItems);
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
    foodLoading,
    foodError,
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
