import React, { useEffect, useState } from "react";
import axios from "axios";
import { Alert, CircularProgress, Typography, Box } from "@mui/material";

const FournisseurList = () => {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFournisseurs = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/fournisseurs"
      );
      setFournisseurs(response.data);
    } catch (err) {
      console.error(
        "Erreur lors du chargement des fournisseurs :",
        err.message
      );
      setError(
        "Impossible de charger les fournisseurs. Veuillez réessayer plus tard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Liste des Fournisseurs
      </Typography>
      {fournisseurs.map((fournisseur) => (
        <Box key={fournisseur.id} sx={{ mb: 2 }}>
          <Typography variant="h6">{fournisseur.nom}</Typography>
          <Typography variant="body2">{fournisseur.email}</Typography>
        </Box>
      ))}
    </Box>
  );
};

export default FournisseurList;
