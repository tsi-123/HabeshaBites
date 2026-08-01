import { useCallback, useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { assets } from "../../assets/frontend_assets/assets";
import { FaStar } from "react-icons/fa";
import { FiX, FiInbox } from "react-icons/fi";
import { toast } from "react-toastify";
import { normalizeImageUrl } from "../../utils/imageUtils";

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
        const ordersData = Array.isArray(response.data.data) ? response.data.data : [];
        setData(ordersData);
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
  const filteredOrders = Array.isArray(data)
    ? data.filter((order) => {
        if (filter === "All") return true;
        if (filter === "Preparing") return order?.status === "Food Processing";
        if (filter === "Out for Delivery") return order?.status === "Out for delivery";
        if (filter === "Delivered") return order?.status === "Delivered";
        return true;
      })
    : [];

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
          <p>You don&apos;t have any orders in this category. Place a new order to get started!</p>
        </div>
      ) : (
        <div className="container">
          {filteredOrders.map((order, index) => {
            const orderDate = order?.date ? new Date(order.date) : new Date();
            const deliveryTime = new Date(orderDate.getTime() + 35 * 60 * 1000);
            const shortId = order?._id ? order._id.slice(-6).toUpperCase() : "N/A";
            const orderItems = Array.isArray(order?.items) ? order.items : [];

            return (
              <div key={index} className="my-orders-order">
                <img src={assets.parcel_icon} alt="" />
                
                <div className="order-meta-info">
                  <p className="order-number">Order #{shortId}</p>
                  <p className="order-date">
                    {orderDate.toLocaleDateString()} {orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="order-items-list">
                    {orderItems.map((item, idx) => {
                      return (item?.name || "Dish") + " x " + (item?.quantity || 0) + (idx === orderItems.length - 1 ? "" : ", ");
                    })}
                  </p>
                </div>

                <div className="order-financials">
                  <p className="order-amount">${Number(order?.amount ?? 0)}.00</p>
                  <p className="order-qty">Items: {orderItems.length}</p>
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
              {(Array.isArray(reviewOrder?.items) ? reviewOrder.items : []).map((item, index) => {
                const reviewItemId = item?._id || `${reviewOrder?._id || "order"}-${index}`;
                return (
                <div key={reviewItemId} className="review-item-row">
                  <img src={normalizeImageUrl(item?.image)} alt={item?.name || "Dish"} className="review-item-img" />
                  <div className="review-item-details">
                    <h4>{item?.name || "Dish"}</h4>
                    
                    <form onSubmit={(e) => handleReviewSubmit(reviewItemId, e)} className="row-review-form">
                      <div className="row-stars-select">
                        <span>Rating:</span>
                        <div className="row-stars-input">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              className={(reviewRatings[reviewItemId] || 5) >= star ? "star active" : "star"}
                              onClick={() =>
                                setReviewRatings((prev) => ({ ...prev, [reviewItemId]: star }))
                              }
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="comment-submit-group">
                        <input
                          type="text"
                          placeholder="What did you think of this dish?"
                          value={reviewComments[reviewItemId] || ""}
                          onChange={(e) =>
                            setReviewComments((prev) => ({ ...prev, [reviewItemId]: e.target.value }))
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
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
