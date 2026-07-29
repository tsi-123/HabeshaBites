import { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";
import { FiUser, FiPhone, FiMapPin, FiLock, FiTrendingUp, FiShoppingBag, FiAward } from "react-icons/fi";
import "./Profile.css";

const Profile = () => {
  const { url, token } = useContext(StoreContext);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    profilePicture: "",
  });
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    topDish: "None",
  });
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [password, setPassword] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${url}/api/user/profile`, {
          headers: { token },
        });
        if (response.data.success) {
          setProfile(response.data.user);
          setStats(response.data.statistics);
          if (response.data.user.profilePicture) {
            setImagePreview(`${url}/images/${response.data.user.profilePicture}`);
          }
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token, url]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("phone", profile.phone);
      formData.append("address", profile.address);
      if (password) {
        formData.append("password", password);
      }
      if (imageFile) {
        formData.append("profilePicture", imageFile);
      }

      const response = await axios.post(`${url}/api/user/profile/update`, formData, {
        headers: {
          token,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Profile updated successfully!");
        setProfile(response.data.user);
        setPassword("");
        setImageFile(null);
      } else {
        toast.error(response.data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error updating profile.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container skeleton">
          <div className="skeleton-avatar"></div>
          <div className="skeleton-line short"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h2>My User Profile</h2>
        
        <div className="profile-grid">
          {/* Left section: photo & form */}
          <div className="profile-card edit-card">
            <form onSubmit={handleUpdate} className="profile-form">
              <div className="avatar-upload-container">
                <div className="avatar-preview">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile Avatar" />
                  ) : (
                    <div className="avatar-placeholder">
                      <FiUser />
                    </div>
                  )}
                </div>
                <label htmlFor="avatar-file" className="avatar-label">
                  Change Picture
                </label>
                <input
                  id="avatar-file"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </div>

              <div className="input-group">
                <label>Email Address (read-only)</label>
                <input type="email" value={profile.email} disabled className="disabled-input" />
              </div>

              <div className="input-group">
                <label>Name</label>
                <div className="input-with-icon">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Phone Number</label>
                <div className="input-with-icon">
                  <FiPhone className="input-icon" />
                  <input
                    type="text"
                    value={profile.phone || ""}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Address</label>
                <div className="input-with-icon">
                  <FiMapPin className="input-icon" />
                  <input
                    type="text"
                    value={profile.address || ""}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    placeholder="Enter street and city"
                  />
                </div>
              </div>

              <div className="input-group">
                <label>New Password (leave blank to keep current)</label>
                <div className="input-with-icon">
                  <FiLock className="input-icon" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password (min 8 chars)"
                  />
                </div>
              </div>

              <button type="submit" className="save-btn" disabled={updating}>
                {updating ? "Saving Changes..." : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Right section: Statistics */}
          <div className="profile-card stats-card">
            <h3>HabeshaBites Dining Statistics</h3>
            
            <div className="stats-list">
              <div className="stat-item">
                <div className="stat-icon-wrapper orders">
                  <FiShoppingBag />
                </div>
                <div className="stat-details">
                  <p className="stat-label">Total Orders Placed</p>
                  <p className="stat-value">{stats.totalOrders}</p>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon-wrapper revenue">
                  <FiTrendingUp />
                </div>
                <div className="stat-details">
                  <p className="stat-label">Total Amount Spent</p>
                  <p className="stat-value">${stats.totalSpent.toFixed(2)}</p>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon-wrapper dish">
                  <FiAward />
                </div>
                <div className="stat-details">
                  <p className="stat-label">Top Ordered Dish</p>
                  <p className="stat-value">{stats.topDish}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
