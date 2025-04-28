import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
} from "@mui/icons-material";

import "../../styles/footer.css"; // Assurez-vous d'importer le fichier CSS pour le style
const footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        py: 2,
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Colonne 1 - A propos */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              À propos
            </Typography>
            <Typography variant="body2" paragraph>
              Notre entreprise est dédiée à fournir des solutions innovantes et
              de qualité pour répondre à vos besoins.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton aria-label="Facebook" color="inherit">
                <Facebook />
              </IconButton>
              <IconButton aria-label="Twitter" color="inherit">
                <Twitter />
              </IconButton>
              <IconButton aria-label="Instagram" color="inherit">
                <Instagram />
              </IconButton>
              <IconButton aria-label="LinkedIn" color="inherit">
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>

          {/* Colonne 2 - Liens rapides */}
          <Grid item xs={6} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Liens rapides
            </Typography>
            <Link
              href="#"
              color="inherit"
              underline="hover"
              display="block"
              mb={1}
            >
              Accueil
            </Link>
            <Link
              href="#"
              color="inherit"
              underline="hover"
              display="block"
              mb={1}
            >
              Services
            </Link>
            <Link
              href="#"
              color="inherit"
              underline="hover"
              display="block"
              mb={1}
            >
              Produits
            </Link>
            <Link
              href="#"
              color="inherit"
              underline="hover"
              display="block"
              mb={1}
            >
              Contact
            </Link>
          </Grid>

          {/* Colonne 3 - Ressources */}
          <Grid item xs={6} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Ressources
            </Typography>
            <Link
              href="#"
              color="inherit"
              underline="hover"
              display="block"
              mb={1}
            >
              Blog
            </Link>
            <Link
              href="#"
              color="inherit"
              underline="hover"
              display="block"
              mb={1}
            >
              Documentation
            </Link>
            <Link
              href="#"
              color="inherit"
              underline="hover"
              display="block"
              mb={1}
            >
              FAQ
            </Link>
            <Link
              href="#"
              color="inherit"
              underline="hover"
              display="block"
              mb={1}
            >
              Support
            </Link>
          </Grid>

          {/* Colonne 4 - Contact */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Contactez-nous
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Email sx={{ mr: 1 }} />
              <Typography variant="body2">contact@entreprise.com</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Phone sx={{ mr: 1 }} />
              <Typography variant="body2">+123 456 7890</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <LocationOn sx={{ mr: 1 }} />
              <Typography variant="body2">
                123 Rue Exemple, Ville, Pays
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="body2" align="center" sx={{ opacity: 0.8 }}>
          © {currentYear} Nom de l'entreprise. Tous droits réservés.
        </Typography>
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Link href="#" color="inherit" underline="hover" sx={{ mx: 1 }}>
            Politique de confidentialité
          </Link>
          <Link href="#" color="inherit" underline="hover" sx={{ mx: 1 }}>
            Conditions d'utilisation
          </Link>
          <Link href="#" color="inherit" underline="hover" sx={{ mx: 1 }}>
            Mentions légales
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default footer;
