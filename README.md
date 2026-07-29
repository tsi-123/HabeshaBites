# 🇪🇹 HabeshaBites

HabeshaBites is a modern Ethiopian food ordering platform built with the MERN Stack. It provides a seamless experience for discovering Ethiopian dishes, placing orders, managing deliveries, and introducing collaborative dining through a unique Split Bill feature.

---

## Features

### Customer

- User Authentication (JWT)
- Browse Ethiopian dishes
- Search dishes
- Category filtering
- Shopping cart
- Place orders
- Order history
- Favorites
- Food reviews and ratings
- Responsive design
- Beautiful UI

### Split Bill

One of the core features of HabeshaBites.

Users can:

- Split restaurant bills
- Generate secure QR payment codes
- View payment status
- Track payment progress
- Individual payment links
- Payment status tracking

_(Payment gateway integration coming soon.)_

### Admin Dashboard

- Add food
- Update food
- Delete food
- Manage orders
- Dashboard analytics

---

## Tech Stack

### Frontend

- React
- React Router
- Context API
- Axios
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer

---

## Project Structure

```
HabeshaBites

frontend/

backend/

admin/
```

---

## Installation

Clone the repository

```bash
git clone https://github.com/tsi-123/HabeshaBites.git
```

Go into the project

```bash
cd HabeshaBites
```

Install dependencies

Frontend

```bash
cd frontend
npm install
```

Backend

```bash
cd backend
npm install
```

Admin

```bash
cd admin
npm install
```

---

## Environment Variables

Create a `.env` file inside the backend folder.

```env
JWT_SECRET=YOUR_SECRET
MONGO_URL=YOUR_MONGODB_URL
```

---

## Running the Project

Backend

```bash
npm run server
```

Frontend

```bash
npm run dev
```

Admin

```bash
npm run dev
```

---

## Upcoming Features

- telebirr Payment Integration
- Amharic Language Support
- Live Order Tracking
- Push Notifications
- AI Food Recommendations

---

## Author

**Tsion Tesera**

GitHub:
https://github.com/tsi-123

---

## License

This project is for educational and portfolio purposes.
