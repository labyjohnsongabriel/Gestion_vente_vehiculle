// src/pages/Profile.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../../src/components/context/AuthContext";

import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Alert,
} from "@mui/material";

const ProfilePage = () => {
  const { user, profile, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    bio: "",
    website: "",
    twitter: "",
    facebook: "",
    linkedin: "",
    instagram: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (profile) {
      setFormData({
        phone: profile.phone || "",
        address: profile.address || "",
        bio: profile.bio || "",
        website: profile.social?.website || "",
        twitter: profile.social?.twitter || "",
        facebook: profile.social?.facebook || "",
        linkedin: profile.social?.linkedin || "",
        instagram: profile.social?.instagram || "",
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const profileData = {
      phone: formData.phone,
      address: formData.address,
      bio: formData.bio,
      social: {
        website: formData.website,
        twitter: formData.twitter,
        facebook: formData.facebook,
        linkedin: formData.linkedin,
        instagram: formData.instagram,
      },
    };

    const result = await updateProfile(profileData);
    if (result.success) {
      setMessage("Profil mis à jour avec succès");
    } else {
      setMessage(result.message || "Erreur lors de la mise à jour");
    }
  };

  if (!user) return <div>Chargement...</div>;

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Profil de {user.first_name} {user.last_name}
        </Typography>

        {message && (
          <Alert
            severity={message.includes("succès") ? "success" : "error"}
            sx={{ mb: 3 }}
          >
            {message}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Téléphone"
            name="phone"
            fullWidth
            margin="normal"
            value={formData.phone}
            onChange={handleChange}
          />

          <TextField
            label="Adresse"
            name="address"
            fullWidth
            margin="normal"
            multiline
            rows={2}
            value={formData.address}
            onChange={handleChange}
          />

          <TextField
            label="Bio"
            name="bio"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={formData.bio}
            onChange={handleChange}
          />

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Réseaux sociaux
          </Typography>

          <TextField
            label="Site web"
            name="website"
            fullWidth
            margin="normal"
            value={formData.website}
            onChange={handleChange}
          />

          <TextField
            label="Twitter"
            name="twitter"
            fullWidth
            margin="normal"
            value={formData.twitter}
            onChange={handleChange}
          />

          <TextField
            label="Facebook"
            name="facebook"
            fullWidth
            margin="normal"
            value={formData.facebook}
            onChange={handleChange}
          />

          <TextField
            label="LinkedIn"
            name="linkedin"
            fullWidth
            margin="normal"
            value={formData.linkedin}
            onChange={handleChange}
          />

          <TextField
            label="Instagram"
            name="instagram"
            fullWidth
            margin="normal"
            value={formData.instagram}
            onChange={handleChange}
          />

          <Button type="submit" variant="contained" sx={{ mt: 3 }}>
            Enregistrer les modifications
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default ProfilePage;
