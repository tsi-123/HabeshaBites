import { useContext, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import "./FoodItem.css";
import { assets } from "../../assets/frontend_assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";
import { normalizeImageUrl } from "../../utils/imageUtils";

const FoodItem = ({ id, name, price, description, image, rating = 4.8, spiceLevel }) => {
  const {
    cartItems,
    addToCart,
    removeFromCart,
    url,
    favorites,
    addToFavorites,
    removeFromFavorites,
    token,
  } = useContext(StoreContext);

  const [showDetails, setShowDetails] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(rating);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const isFavorite = Array.isArray(favorites) && favorites.includes(id);
  const normalizedImage = normalizeImageUrl(image);
  const safeCartItems = cartItems || {};
  const displayPrice = Number.isFinite(Number(price)) ? Number(price) : 0;
  const displayName = name || "Delicious Dish";
  const displayDescription = description || "A flavorful dish";

  const toggleFavorite = (e) => {
    e.stopPropagation();
    if (isFavorite) {
      removeFromFavorites(id);
    } else {
      addToFavorites(id);
    }
  };

  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const response = await axios.get(`${url}/api/reviews/${id}`);
      if (response.data.success) {
        const reviewsData = Array.isArray(response.data.reviews) ? response.data.reviews : [];
        setReviews(reviewsData);
        setAvgRating(
          Number.isFinite(Number(response.data.avgRating)) ? Number(response.data.avgRating) : rating
        );
      }
    } catch (error) {
      console.log("Error fetching reviews", error);
    } finally {
      setReviewsLoading(false);
    }
  }, [id, rating, url]);

  useEffect(() => {
    if (showDetails) {
      fetchReviews();
    }
  }, [showDetails, fetchReviews]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please login to submit a review");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please enter a comment");
      return;
    }
    setSubmittingReview(true);
    try {
      const response = await axios.post(
        `${url}/api/reviews/add`,
        { foodId: id, rating: newRating, comment },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Review submitted successfully!");
        setComment("");
        setNewRating(5);
        fetchReviews();
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

  return (
    <>
      <div className="food-item">
        <div className="food-item-img-container">
        <img src={normalizedImage} alt="" className="food-item-image" />
          <div className="favorite-icon-container" onClick={toggleFavorite}>
            {isFavorite ? (
              <FaHeart className="fav-icon filled" />
            ) : (
              <FaRegHeart className="fav-icon" />
            )}
          </div>
          {!safeCartItems[id] ? (
            <img
              className="add"
              onClick={() => addToCart(id)}
              src={assets.add_icon_white}
              alt=""
            />
          ) : (
            <div className="food-item-counter">
              <img
                onClick={() => removeFromCart(id)}
                src={assets.remove_icon_red}
                alt=""
              />
              <p>{safeCartItems[id]}</p>
              <img onClick={() => addToCart(id)} src={assets.add_icon_green} alt="" />
            </div>
          )}
        </div>
        <div className="food-item-info" onClick={() => setShowDetails(true)}>
          <div className="food-item-name-rating">
            <p>{displayName}</p>
            <span>⭐ {avgRating}</span>
            {spiceLevel && <span className="spice-tag">{spiceLevel}</span>}
          </div>
          <p className="food-item-desc">{displayDescription}</p>
          <p className="food-item-price">${displayPrice}</p>
        </div>
      </div>

      {/* Food Details Modal */}
      {showDetails && (
        <div className="food-details-modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="food-details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setShowDetails(false)}>
              <FiX />
            </button>

            <div className="modal-content-grid">
              <div className="modal-left">
                <img src={normalizedImage} alt={displayName} className="modal-food-img" />
                <div className="modal-food-meta">
                  <h2>{displayName}</h2>
                  <div className="rating-spice-row">
                    <span className="rating-badge">⭐ {avgRating}</span>
                    {spiceLevel && <span className="spice-badge">{spiceLevel} Spice</span>}
                  </div>
                  <p className="modal-food-desc">{displayDescription}</p>
                  <h3 className="modal-food-price">${displayPrice}</h3>
                </div>
              </div>

              <div className="modal-right">
                <h3>Customer Reviews</h3>

                {/* Reviews List */}
                <div className="modal-reviews-list">
                  {reviewsLoading ? (
                    <div className="modal-reviews-skeleton">
                      <div className="skeleton-line"></div>
                      <div className="skeleton-line"></div>
                      <div className="skeleton-line"></div>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="empty-reviews-state">
                      <p>No reviews yet. Be the first to share your thoughts!</p>
                    </div>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev._id} className="review-item">
                        <div className="review-header">
                          <span className="review-user">{rev.userName}</span>
                          <span className="review-stars">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={i < rev.rating ? "star active" : "star"}
                              />
                            ))}
                          </span>
                        </div>
                        <p className="review-comment">{rev.comment}</p>
                        <span className="review-date">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Review Form */}
                {token ? (
                  <form onSubmit={submitReview} className="modal-review-form">
                    <h4>Write a Review</h4>
                    <div className="rating-select">
                      <span>Rating:</span>
                      <div className="stars-input">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            className={star <= newRating ? "star-btn active" : "star-btn"}
                            onClick={() => setNewRating(star)}
                          />
                        ))}
                      </div>
                    </div>
                    <textarea
                      placeholder="Share your thoughts about this dish..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    ></textarea>
                    <button type="submit" className="submit-review-btn" disabled={submittingReview}>
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                ) : (
                  <div className="login-to-review-msg">
                    <p>Please login to write a review for this food item.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

FoodItem.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  rating: PropTypes.number,
  spiceLevel: PropTypes.string,
};

export default FoodItem;
