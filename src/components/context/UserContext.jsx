// src/Context/UserContext.jsx
import React, { createContext, useContext, useState } from "react";

const UserContext = createContext(null); // très important

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: "Gabriel Johnson",
    role: "Administrateur",
    email: "gabriel@example.com",
    phone: "+261123456789",
    image: "/static/images/avatar/1.jpg",
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error(
      "useUser doit être utilisé à l'intérieur de <UserProvider>"
    );
  }
  return context;
};
