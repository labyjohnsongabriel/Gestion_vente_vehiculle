import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const VentesTable = () => {
  const [ventes, setVentes] = useState([]);

  const fetchVentes = async () => {
    const res = await axios.get("/api/ventes");
    setVentes(res.data);
  };

  useEffect(() => {
    fetchVentes();
  }, []);

  const handleDelete = async (id) => {
    await axios.delete(`/api/ventes/${id}`);
    fetchVentes();
  };

  return (
    <TableContainer component={Paper}>
      <Typography variant="h6" sx={{ m: 2 }}>Liste des ventes</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Produit</TableCell>
            <TableCell>Client</TableCell>
            <TableCell>Quantité</TableCell>
            <TableCell>Prix Unitaire</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ventes.map((vente) => (
            <TableRow key={vente.id}>
              <TableCell>{vente.produit}</TableCell>
              <TableCell>{vente.client}</TableCell>
              <TableCell>{vente.quantite}</TableCell>
              <TableCell>{vente.prix_unitaire} €</TableCell>
              <TableCell>{new Date(vente.date).toLocaleDateString()}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleDelete(vente.id)}>
                  <DeleteIcon color="error" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default VentesTable;
