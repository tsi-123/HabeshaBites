import { useCallback, useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { assets } from "../../assets/frontend_assets/assets";
import { FaStar } from "react-icons/fa";
import { FiX, FiInbox } from "react-icons/fi";
import { toast } from "react-toastify";

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [reviewOrder, setReviewOrder] = useState(null);
  
  // Rating states inside review modal
  const [reviewRatings, setReviewRatings] = useState({});
  const [reviewComments, setReviewComments] = useState({});
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        url + "/api/order/userorders",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [token, url]);

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [fetchOrders, token]);

  const handleReviewSubmit = async (foodId, e) => {
    e.preventDefault();
    const rating = reviewRatings[foodId] || 5;
    const comment = reviewComments[foodId] || "";

    if (!comment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await axios.post(
        `${url}/api/reviews/add`,
        { foodId, rating, comment },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(`Review submitted successfully!`);
        // Clear inputs for this food item
        setReviewComments((prev) => ({ ...prev, [foodId]: "" }));
        setReviewRatings((prev) => ({ ...prev, [foodId]: 5 }));
      } else {
        toast.error(response.data.message || "Failed to submit review");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error submitting review");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Filter orders
  const filteredOrders = data.filter((order) => {
    if (filter === "All") return true;
    if (filter === "Preparing") return order.status === "Food Processing";
    if (filter === "Out for Delivery") return order.status === "Out for delivery";
    if (filter === "Delivered") return order.status === "Delivered";
    return true;
  });

  return (
    <div className="my-orders">
      <div className="my-orders-header">
        <h2>My Orders</h2>
        
        {/* Filter Tabs */}
        <div className="order-filters">
          {["All", "Preparing", "Out for Delivery", "Delivered"].map((tab) => (
            <button
              key={tab}
              className={`filter-tab ${filter === tab ? "active" : ""}`}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="orders-skeleton-list">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="my-orders-order skeleton">
              <div className="skeleton-image"></div>
              <div className="skeleton-details">
                <div className="skeleton-line short"></div>
                <div className="skeleton-line"></div>
              </div>
              <div className="skeleton-price"></div>
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="orders-empty-state">
          <FiInbox className="empty-icon" />
          <h3>No Orders Found</h3>
          <p>You don't have any orders in this category. Place a new order to get started!</p>
        </div>
      ) : (
        <div className="container">
          {filteredOrders.map((order, index) => {
            const orderDate = new Date(order.date);
            const deliveryTime = new Date(orderDate.getTime() + 35 * 60 * 1000);
            const shortId = order._id.slice(-6).toUpperCase();

            return (
              <div key={index} className="my-orders-order">
                <img src={assets.parcel_icon} alt="" />
                
                <div className="order-meta-info">
                  <p className="order-number">Order #{shortId}</p>
                  <p className="order-date">
                    {orderDate.toLocaleDateString()} {orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="order-items-list">
                    {order.items.map((item, idx) => {
                      return item.name + " x " + item.quantity + (idx === order.items.length - 1 ? "" : ", ");
                    })}
                  </p>
                </div>

                <div className="order-financials">
                  <p className="order-amount">${order.amount}.00</p>
                  <p className="order-qty">Items: {order.items.length}</p>
                </div>

                <div className="order-status-eta">
                  <p className="order-status-badge">
                    <span>&#x25cf;</span>
                    <b> {order.status}</b>
                  </p>
                  {order.status !== "Delivered" && (
                    <p className="order-eta">
                      Est. Delivery: <b>{deliveryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</b>
                    </p>
                  )}
                </div>

                <div className="order-actions">
                  <button className="track-btn" onClick={fetchOrders}>
                    Track Order
                  </button>
                  <button className="review-btn" onClick={() => setReviewOrder(order)}>
                    Review Items
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewOrder && (
        <div className="review-modal-overlay" onClick={() => setReviewOrder(null)}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="review-modal-header">
              <h3>Review Order Items</h3>
              <button className="close-review-modal" onClick={() => setReviewOrder(null)}>
                <FiX />
              </button>
            </div>
            
            <div className="review-items-container">
              {reviewOrder.items.map((item) => (
                <div key={item._id} className="review-item-row">
                  <img src={url + "/images/" + item.image} alt={item.name} className="review-item-img" />
                  <div className="review-item-details">
                    <h4>{item.name}</h4>
                    
                    <form onSubmit={(e) => handleReviewSubmit(item._id, e)} className="row-review-form">
                      <div className="row-stars-select">
                        <span>Rating:</span>
                        <div className="row-stars-input">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              className={(reviewRatings[item._id] || 5) >= star ? "star active" : "star"}
                              onClick={() =>
                                setReviewRatings((prev) => ({ ...prev, [item._id]: star }))
                              }
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="comment-submit-group">
                        <input
                          type="text"
                          placeholder="What did you think of this dish?"
                          value={reviewComments[item._id] || ""}
                          onChange={(e) =>
                            setReviewComments((prev) => ({ ...prev, [item._id]: e.target.value }))
                          }
                          required
                        />
                        <button type="submit" className="row-submit-btn" disabled={submittingReview}>
                          Submit
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
