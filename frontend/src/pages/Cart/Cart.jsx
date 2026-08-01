import { useContext } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import { normalizeImageUrl } from "../../utils/imageUtils";

const Cart = () => {
  const {
    food_list,
    cartItems,
    removeFromCart,
    getTotalCartAmount,
    foodLoading,
  } = useContext(StoreContext);

  const navigate = useNavigate();
  const safeFoodList = Array.isArray(food_list) ? food_list : [];
  const safeCartItems = cartItems && typeof cartItems === "object" ? cartItems : {};
  const subtotal = getTotalCartAmount();

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {foodLoading && !safeFoodList.length ? (
          <p>Loading your cart...</p>
        ) : (
          safeFoodList.map((item) => {
            if (!item || !item._id) return null;
            const itemId = item?._id;
            if (!itemId) return null;

            const quantity = Number(safeCartItems[itemId] || 0);
            const price = Number(item?.price ?? 0);

            if (quantity > 0 && Number.isFinite(price)) {
              return (
                <div key={itemId}>
                  <div className="cart-items-title cart-items-item">
                    <img src={normalizeImageUrl(item?.image)} alt="" />
                    <p>{item?.name || "Delicious Dish"}</p>
                    <p>${price}</p>
                    <p>{quantity}</p>
                    <p>${price * quantity}</p>
                    <p onClick={() => removeFromCart(itemId)} className="cross">
                      x
                    </p>
                  </div>
                  <hr />
                </div>
              );
            }
            return null;
          })
        )}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotals</p>
              <p>${subtotal}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${subtotal === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${subtotal === 0 ? 0 : subtotal + 2}</b>
            </div>
          </div>
          <button onClick={() => navigate("/order")}>PROCEED TO CHECKOUT</button>
          <button className="split-btn" onClick={() => navigate("/split-bill")}> Split Bill </button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>If you have a promocode, Enter it here</p>
            <div className="cart-promocode-input">
              <input type="text" placeholder="promo code" />
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
