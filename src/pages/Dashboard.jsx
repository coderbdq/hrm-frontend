// src/pages/Dashboard.jsx
import { useAuth } from "../hooks/useAuth";

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 24 }}>
      <h1>Dashboard HRM</h1>
      {user && (
        <>
          <p>
            Xin chào, <b>{user.fullName}</b> ({user.username})
          </p>
          <p>Email: {user.email}</p>
          <p>Roles: {user.roles?.join(", ")}</p>
        </>
      )}

      <button
        onClick={logout}
        style={{
          marginTop: 16,
          padding: "8px 12px",
          background: "#ef4444",
          border: "none",
          color: "white",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Đăng xuất
      </button>
    </div>
  );
};

export default Dashboard;
