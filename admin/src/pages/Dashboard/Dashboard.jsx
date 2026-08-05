import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { FiTrendingUp, FiShoppingBag, FiDollarSign, FiPercent, FiClock, FiCheckCircle } from "react-icons/fi";
import "./Dashboard.css";

const Dashboard = ({ url }) => {
  const navigate = useNavigate();
  const { token, admin } = useContext(StoreContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(url + "/api/order/dashboard-stats", {
        headers: { token },
      });
      if (response.data.success) {
        setStats(response.data.stats);
      } else {
        toast.error(response.data.message || "Failed to load dashboard statistics.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error loading dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!admin && !token) {
      toast.error("Please Login First");
      navigate("/");
    } else {
      fetchStats();
    }
  }, [admin, token]);

  if (loading) {
    return (
      <div className="dashboard skeleton-container">
        <h2>Admin Dashboard</h2>
        <div className="skeleton-grid">
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
        </div>
        <div className="skeleton-content-grid">
          <div className="skeleton-panel"></div>
          <div className="skeleton-panel"></div>
        </div>
      </div>
    );
  }

  if (!stats) return <p>No statistics data available.</p>;

  return (
    <div className="dashboard">
      <div className="dashboard-title">
        <h2>Admin Dashboard</h2>
        <button className="refresh-btn" onClick={fetchStats}>Refresh Data</button>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-cards-grid">
        <div className="stat-card revenue">
          <div className="card-info">
            <p className="card-label">Total Revenue</p>
            <h3>ETB {Number(stats?.totalRevenue ?? 0).toFixed(2)}</h3>
          </div>
          <div className="card-icon">
            <FiDollarSign />
          </div>
        </div>

        <div className="stat-card orders">
          <div className="card-info">
            <p className="card-label">Total Orders</p>
            <h3>{stats?.totalOrders ?? 0}</h3>
          </div>
          <div className="card-icon">
            <FiShoppingBag />
          </div>
        </div>

        <div className="stat-card split-stats">
          <div className="card-info">
            <p className="card-label">Split Bill Revenue</p>
            <h3>ETB {Number(stats?.splitStats?.splitRevenue ?? 0).toFixed(2)}</h3>
            <p className="card-subtext">
              {stats?.splitStats?.completedSplits ?? 0} of {stats?.splitStats?.totalSplits ?? 0} splits settled
            </p>
          </div>
          <div className="card-icon">
            <FiTrendingUp />
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="dashboard-content-layout">
        
        {/* Left column: Popular items & split summary */}
        <div className="layout-left">
          <div className="dashboard-section popular-foods">
            <h3>🔥 Popular Dishes / Top-Selling</h3>
            <div className="foods-list">
              {(stats?.popularFoods || []).length === 0 ? (
                <p className="empty-text">No dishes sold yet.</p>
              ) : (
                (stats?.popularFoods || []).map((food, index) => (
                  <div key={index} className="food-item-row">
                    <span className="rank">#{index + 1}</span>
                    <span className="name">{food.name}</span>
                    <span className="sales">{food.count} portions sold</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="dashboard-section split-breakdown">
            <h3>📊 Split Bill Statistics</h3>
            <div className="split-summary-grid">
              <div className="summary-box">
                <FiShoppingBag className="icon-blue" />
                <p>Total Splits</p>
                <h4>{stats?.splitStats?.totalSplits ?? 0}</h4>
              </div>
              <div className="summary-box">
                <FiCheckCircle className="icon-green" />
                <p>Settled Splits</p>
                <h4>{stats?.splitStats?.completedSplits ?? 0}</h4>
              </div>
              <div className="summary-box">
                <FiClock className="icon-yellow" />
                <p>Pending Splits</p>
                <h4>{stats?.splitStats?.pendingSplits ?? 0}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Recent orders */}
        <div className="layout-right">
          <div className="dashboard-section recent-orders">
            <h3>🕒 Recent Orders</h3>
            <div className="orders-list">
              {(stats?.recentOrders || []).length === 0 ? (
                <p className="empty-text">No orders placed yet.</p>
              ) : (
                (stats?.recentOrders || []).map((order) => {
                  const orderDate = new Date(order.date || Date.now());
                  const orderItems = Array.isArray(order.items) ? order.items : [];
                  return (
                    <div key={order._id} className="recent-order-row">
                      <div className="order-row-meta">
                        <span className="order-row-num">#{order._id ? order._id.slice(-6).toUpperCase() : "N/A"}</span>
                        <span className="order-row-date">
                          {orderDate.toLocaleDateString()} {orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="order-row-items">
                        {orderItems.map((item) => (item?.name || "Item") + " x " + (item?.quantity || 1)).join(", ")}
                      </div>
                      <div className="order-row-total">
                        <span>ETB {Number(order?.amount ?? 0).toFixed(2)}</span>
                        <span className={`status-badge ${(order?.status || "").toLowerCase().replace(/\s+/g, '-')}`}>
                          {order?.status || "Processing"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
