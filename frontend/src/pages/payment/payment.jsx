import { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";
import { FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";
import "./payment.css";

const Payment = () => {
  const { token } = useParams();
  const { url } = useContext(StoreContext);
  const navigate = useNavigate();

  const [share, setShare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const fetchShare = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/split/${token}`);

      if (response.data.success) {
        setShare(response.data.share);
      } else {
        toast.error("Invalid payment token.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load payment details.");
    } finally {
      setLoading(false);
    }
  }, [token, url]);

  useEffect(() => {
    fetchShare();
  }, [fetchShare]);

  const payNow = async () => {
    setPaying(true);
    try {
      const response = await axios.put(`${url}/api/split/${token}/pay`);

      if (response.data.success) {
        toast.success("Payment Received! Thank you.");
        fetchShare();
      } else {
        toast.error("Payment failed. Please try again.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error processing payment.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-page">
        <div className="payment-card skeleton">
          <div className="skeleton-title"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-text short"></div>
          <div className="skeleton-button"></div>
        </div>
      </div>
    );
  }

  if (!share) {
    return (
      <div className="payment-page">
        <div className="payment-card error-card">
          <FiAlertCircle className="error-icon" />
          <h2>Payment Not Found</h2>
          <p>The split payment share does not exist or has expired.</p>
          <button className="home-btn" onClick={() => navigate("/")}>Go Home</button>
        </div>
      </div>
    );
  }

  const isPaid = share.status === "Paid";

  return (
    <div className="payment-page">
      <div className={`payment-card ${isPaid ? "paid" : "waiting"}`}>
        <h1>HabeshaBites Split Payment</h1>
        
        <div className="amount-section">
          <h3>Amount to Pay</h3>
          <h2>ETB {share.amount.toFixed(2)}</h2>
        </div>

        <div className="details-section">
          <p className="token-label">Payment ID</p>
          <p className="token-value">{share.token}</p>
        </div>

        <div className="status-section">
          {isPaid ? (
            <div className="status-container paid">
              <FiCheckCircle className="status-icon" />
              <span>Payment Completed</span>
            </div>
          ) : (
            <div className="status-container waiting">
              <FiClock className="status-icon" />
              <span>Waiting for Payment</span>
            </div>
          )}
        </div>

        {!isPaid ? (
          <button className="pay-now-btn" onClick={payNow} disabled={paying}>
            {paying ? "Processing..." : "Pay Now"}
          </button>
        ) : (
          <div className="completed-message">
            <p>Thank you! Your share has been processed and credited to the order.</p>
            <button className="home-btn" onClick={() => navigate("/")}>Back to home</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;