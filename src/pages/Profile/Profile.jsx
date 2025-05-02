import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/me");
        setProfile(response.data);
      } catch (err) {
        setError("Erreur lors du chargement du profil.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put("http://localhost:5000/api/users/me", profile);
      alert("Profil mis à jour avec succès !");
    } catch (err) {
      setError("Erreur lors de la mise à jour du profil.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Mon Profil
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <TextField
        label="Nom"
        value={profile?.name || ""}
        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Email"
        value={profile?.email || ""}
        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? <CircularProgress size={24} /> : "Enregistrer"}
      </Button>
    </Box>
  );
};

export default Profile;
