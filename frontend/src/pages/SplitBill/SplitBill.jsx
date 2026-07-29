import { useContext, useState, useEffect, useRef } from "react";
import { StoreContext } from "../../context/StoreContext";
import QRCode from "react-qr-code";
import axios from "axios";
import { toast } from "react-toastify";
import { FiCopy, FiShare2, FiCheckCircle } from "react-icons/fi";
import "./SplitBill.css";

const SplitBill = () => {
  const { getTotalCartAmount, url } = useContext(StoreContext);
  const [people, setPeople] = useState(2);
  const [shares, setShares] = useState([]);
  const [orderId, setOrderId] = useState("");
  const [progress, setProgress] = useState({ paid: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const pollIntervalRef = useRef(null);

  const total = getTotalCartAmount();
  const amountPerPerson = people > 0 ? total / people : 0;

  const generateShares = async () => {
    if (total <= 0) {
      toast.error("Please add items to your cart before splitting the bill.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${url}/api/split/create`, {
        total,
        people,
      });

      if (response.data.success) {
        setShares(response.data.split.shares);
        setOrderId(response.data.split.orderId);
        setProgress({ paid: 0, total: people });
        toast.success("Split Bill generated successfully!");
      } else {
        toast.error("Failed to generate split bill.");
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Poll progress every 5 seconds
  useEffect(() => {
    if (!orderId) return;

    const fetchProgress = async () => {
      try {
        const response = await axios.get(`${url}/api/split/order/${orderId}`);
        if (response.data.success) {
          setProgress({ paid: response.data.paid, total: response.data.total });
          if (response.data.shares) {
            setShares(response.data.shares);
          }
        }
      } catch (error) {
        console.log("Error polling progress", error);
      }
    };

    fetchProgress(); // fetch immediately
    pollIntervalRef.current = setInterval(fetchProgress, 5000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [orderId, url]);

  const copyLink = (token) => {
    const paymentLink = `${window.location.origin}/payment/${token}`;
    navigator.clipboard.writeText(paymentLink);
    toast.success("Payment link copied to clipboard!");
  };

  const shareLink = async (token, shareNum) => {
    const paymentLink = `${window.location.origin}/payment/${token}`;
    const shareData = {
      title: `HabeshaBites Share #${shareNum}`,
      text: `Please pay your share of ETB ${amountPerPerson.toFixed(2)} using this link!`,
      url: paymentLink,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } catch (err) {
        console.log("Error sharing", err);
      }
    } else {
      copyLink(token);
    }
  };

  const isAllPaid = progress.total > 0 && progress.paid === progress.total;

  return (
    <div className="splitbill-page">
      <div className="splitbill-container">
        <div className="splitbill-card">
          <h1>💸 Habesha SplitPay</h1>
          <p className="subtitle">Divide your Mesob into secure payment shares.</p>

          <div className="total-box">
            <h3>Total Bill</h3>
            <h2>ETB {total.toFixed(2)}</h2>
          </div>

          {!orderId && (
            <>
              <div className="people-box">
                <h3>How many people?</h3>
                <div className="people-selector">
                  <button onClick={() => people > 2 && setPeople(people - 1)}>−</button>
                  <span>{people}</span>
                  <button onClick={() => setPeople(people + 1)}>+</button>
                </div>
              </div>

              <div className="amount-box">
                <h3>Each person pays</h3>
                <h1>ETB {amountPerPerson.toFixed(2)}</h1>
              </div>

              <button className="generate-btn" onClick={generateShares} disabled={loading}>
                {loading ? "Generating..." : "Generate Secure Payment Codes"}
              </button>
            </>
          )}

          {orderId && (
            <div className="progress-section">
              <h3>Group Payment Progress</h3>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${(progress.paid / progress.total) * 100}%` }}
                ></div>
              </div>
              <p className="progress-text">
                {progress.paid} of {progress.total} Paid ({Math.round((progress.paid / progress.total) * 100)}%)
              </p>

              {isAllPaid ? (
                <div className="all-paid-success">
                  <FiCheckCircle className="success-icon" />
                  <h4>Mesob Fully Settled!</h4>
                  <p>All members have paid their shares. Thank you for dining with HabeshaBites!</p>
                </div>
              ) : (
                <p className="poll-hint">Auto-refreshing every 5 seconds...</p>
              )}
            </div>
          )}
        </div>

        {orderId && shares.length > 0 && (
          <div className="shares-grid">
            {shares.map((share, index) => {
              const paymentLink = `${window.location.origin}/payment/${share.token}`;
              return (
                <div key={share.token} className={`share-card ${share.status.toLowerCase()}`}>
                  <div className="share-card-header">
                    <h4>Share #{index + 1}</h4>
                    <span className={`status-badge ${share.status.toLowerCase()}`}>
                      {share.status === "Paid" ? "✅ Paid" : "🟡 Waiting"}
                    </span>
                  </div>
                  <h3>ETB {share.amount.toFixed(2)}</h3>

                  <div className="qr-container">
                    <QRCode value={paymentLink} size={120} />
                  </div>

                  <div className="share-actions">
                    <button className="action-btn copy-btn" onClick={() => copyLink(share.token)}>
                      <FiCopy /> Copy Link
                    </button>
                    <button className="action-btn share-btn" onClick={() => shareLink(share.token, index + 1)}>
                      <FiShare2 /> Share
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitBill;