import React, { useState } from "react";
import { Avatar, Dialog, DialogContent, IconButton, Typography, Box, Tooltip } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";

// Liste des champs à afficher
const profileFields = [
  { key: "image", label: "Photo" },
  { key: "prenom", label: "Prénom" },
  { key: "nom", label: "Nom" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Téléphone" },
  { key: "address", label: "Adresse" },
  { key: "status", label: "Statut" },
];

const ClientDetails = ({ client }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedField, setSelectedField] = useState(null);

  const handleOpen = (field) => {
    setSelectedField(field);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setSelectedField(null);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Tooltip title="Agrandir la photo">
          <Avatar
            src={client.image}
            alt={`${client.prenom} ${client.nom}`}
            sx={{ width: 80, height: 80, cursor: "pointer" }}
            onClick={() => handleOpen("image")}
          />
        </Tooltip>
        <IconButton onClick={() => handleOpen("image")}>
          <ZoomInIcon />
        </IconButton>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {profileFields
          .filter((f) => f.key !== "image")
          .map((field) => (
            <Box
              key={field.key}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                "&:hover .zoomIcon": { opacity: 1 },
              }}
              onClick={() => handleOpen(field.key)}
            >
              <Typography variant="subtitle2" sx={{ minWidth: 90 }}>
                {field.label}:
              </Typography>
              <Typography variant="body1">{client[field.key]}</Typography>
              <ZoomInIcon className="zoomIcon" sx={{ opacity: 0.5, ml: 1 }} />
            </Box>
          ))}
      </Box>

      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm">
        <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 300 }}>
          {selectedField === "image" ? (
            <img
              src={client.image}
              alt={`${client.prenom} ${client.nom}`}
              style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: 12 }}
            />
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h5" gutterBottom>
                {profileFields.find((f) => f.key === selectedField)?.label}
              </Typography>
              <Typography variant="h4" sx={{ wordBreak: "break-all" }}>
                {client[selectedField]}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ClientDetails;
