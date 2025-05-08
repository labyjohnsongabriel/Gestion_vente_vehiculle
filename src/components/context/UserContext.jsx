// src/context/UserContext.jsx
import React, { createContext, useContext, useState, useMemo } from "react";
import PropTypes from "prop-types";

const defaultUser = {
  name: "Gabriel Johnson",
  role: "Administrateur",
  email: "gabriel@example.com",
  phone: "+261123456789",
  image: "/static/images/avatar/1.jpg",
  lastLogin: new Date().toISOString(),
};

const UserContext = createContext({
  user: null,
  setUser: () => {
    throw new Error("setUser must be used within a UserProvider");
  },
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(defaultUser);

  const value = useMemo(() => ({ user, setUser }), [user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

// Export names pour meilleure auto-complétion
export { UserContext };
