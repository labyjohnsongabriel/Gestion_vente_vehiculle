import React, { useEffect, useState } from "react";
import axios from "../utils/axiosConfig";

const CustomersCard = () => {
  const [clientCount, setClientCount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClientCount = async () => {
      try {
        const response = await axios.get("/clients/count");
        setClientCount(response.data.count);
      } catch (err) {
        console.error(
          "❌ Erreur lors de la récupération du nombre de clients :",
          err
        );
        setError("Impossible de récupérer le nombre de clients.");
      }
    };

    fetchClientCount();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h3>Nombre de clients</h3>
      <p>{clientCount}</p>
    </div>
  );
};

export default CustomersCard;
