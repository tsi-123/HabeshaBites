import React from "react";
import "./Orders.css";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { assets } from "../../assets/assets";
import { useContext } from "react";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const Orders = ({ url }) => {
  const navigate = useNavigate();
  const { token, admin } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);

  const fetchAllOrder = async () => {
    const response = await axios.get(url + "/api/order/list", {
      headers: { token },
    });
    if (response.data.success) {
      setOrders(response.data.data);
    }
  };

  const statusHandler = async (event, orderId) => {
    const response = await axios.post(
      url + "/api/order/status",
      {
        orderId,
        status: event.target.value,
      },
      { headers: { token } }
    );
    if (response.data.success) {
      toast.success(response.data.message);
      await fetchAllOrder();
    } else {
      toast.error(response.data.message);
    }
  };
  useEffect(() => {
    if (!admin && !token) {
      toast.error("Please Login First");
      navigate("/");
    }
    fetchAllOrder();
  }, []);

  return (
    <div className="order add">
      <h3>Order Page</h3>
      <div className="order-list">
        {(Array.isArray(orders) ? orders : []).map((order, index) => {
          if (!order) return null;
          const orderItems = Array.isArray(order.items) ? order.items : [];
          const address = order.address || {};
          return (
            <div key={order._id || index} className="order-item">
              <img src={assets.parcel_icon} alt="" />
              <div>
                <p className="order-item-food">
                  {orderItems.map((item, idx) => {
                    if (!item) return "";
                    const itemName = item.name || "Item";
                    const itemQty = item.quantity || 1;
                    return idx === orderItems.length - 1
                      ? `${itemName} x ${itemQty}`
                      : `${itemName} x ${itemQty}, `;
                  })}
                </p>
                <p className="order-item-name">
                  {`${address.firstName || ""} ${address.lastName || ""}`.trim() || "Guest"}
                </p>
                <div className="order-item-address">
                  <p>{(address.street || "") + ","}</p>
                  <p>
                    {`${address.city || ""}, ${address.state || ""}, ${address.country || ""}, ${address.zipcode || ""}`}
                  </p>
                </div>
                <p className="order-item-phone">{address.phone || ""}</p>
              </div>
              <p>Items: {orderItems.length}</p>
              <p>${Number(order.amount ?? 0)}</p>
              <select
                onChange={(event) => statusHandler(event, order._id)}
                value={order.status || "Food Processing"}
              >
                <option value="Food Processing">Food Processing</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
