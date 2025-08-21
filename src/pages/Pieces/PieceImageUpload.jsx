import React from "react";
import { Box, Button, Avatar } from "@mui/material";

const BACKEND_URL = "http://localhost:5000";

const PieceImageUpload = ({ image, setImage }) => {
  const getImageSrc = () => {
    if (!image) return "/default-part.png";
    if (typeof image === "string") {
      return image.startsWith("http") ? image : `${BACKEND_URL}${image}`;
    }
    return URL.createObjectURL(image);
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Avatar src={getImageSrc()} sx={{ width: 56, height: 56 }} />
      <Button variant="contained" component="label">
        Choisir une image
        <input type="file" accept="image/*" hidden onChange={handleChange} />
      </Button>
    </Box>
  );
};

export default PieceImageUpload;
