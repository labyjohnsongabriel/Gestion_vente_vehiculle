import React, { useState, useCallback, memo } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Typography,
  Box,
  useMediaQuery,
  IconButton,
  Avatar,
  Chip,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  SyncAlt as SyncIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountIcon,
  ExpandLess,
  ExpandMore,
  BarChart as BarChartIcon,
  ListAlt as ListAltIcon,
  Feedback as FeedbackIcon,
  ChevronLeft,
  Store as StoreIcon,
  Receipt as ReceiptIcon,
  Category as CategoryIcon,
  DirectionsCar as CarIcon,
  Build as BuildIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useTheme, styled } from "@mui/material/styles";


const PremiumDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    width: 309,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: theme.palette.common.white,
    borderRight: "none",
    borderRadius: "1px", // Ajoutez cette ligne pour le border-radius
    boxShadow: "1px 0 5px rgba(77, 19, 169, 0.1)",
    overflowX: "hidden",
    paddingLeft: "trasparent",
    paddingRight: "0px",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
}));

const PremiumListItem = styled(ListItemButton)(({ theme }) => ({
  margin: "4px 8px",
  transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
  "&:hover": {
    background: "rgba(10, 8, 8, 0.15)",
    transform: "translateX(5px)",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  "&.Mui-selected": {
    background:
      "linear-gradient(90deg, rgba(14, 32, 126, 0.3) 0%, rgba(138,95,182,0.3) 100%)",
    borderLeft: "4px solid #142dbb",
  },
}));

const PremiumSubListItem = styled(ListItemButton)(({ theme }) => ({
  paddingLeft: "40px !important",
  borderRadius: "8px",
  margin: "2px 8px",
  transition: "all 0.2s ease",
  "&:hover": {
    background: "rgba(255, 255, 255, 0.1)",
    transform: "translateX(3px)",
  },
  "&.Mui-selected": {
    background: "rgba(255, 255, 255, 0.15)",
  },
}));

// Menu items déplacés à l'extérieur du composant pour éviter les recréations inutiles
const MENU_ITEMS = [
  {
    text: "Tableau de bord",
    icon: <DashboardIcon sx={{ color: "#6fd1ff" }} />,
    path: "/",
    subItems: [
      {
        text: "Statistiques",
        icon: <BarChartIcon sx={{ color: "#6fd1ff", fontSize: "1.2rem" }} />,
        path: "/statistics",
      },
      {
        text: "Rapports",
        icon: <AssessmentIcon sx={{ color: "#6fd1ff", fontSize: "1.2rem" }} />,
        path: "/dashboard",
      },
    ],
  },
  {
    text: "Clients",
    icon: <PeopleIcon sx={{ color: "#81c784" }} />,
    path: "/clients",
  },
  {
    text: "Fournisseurs",
    icon: <StoreIcon sx={{ color: "#ffb74d" }} />,
    path: "/fournisseurs",
  },
  {
    text: "Commandes",
    icon: <ReceiptIcon sx={{ color: "#ba68c8" }} />,
    path: "/commandes",
  },
  {
    text: "Catégories",
    icon: <CategoryIcon sx={{ color: "#4db6ac" }} />,
    path: "/categorie",
  },
  {
    text: "Pièces",
    icon: <BuildIcon sx={{ color: "#7986cb" }} />,
    path: "/pieces",
  },
  {
    text: "Stocks",
    icon: <InventoryIcon sx={{ color: "#9575cd" }} />,
    path: "/stocks",
  },

  {
    text: "Véhicules",
    icon: <CarIcon sx={{ color: "#ef9a9a" }} />,
    path: "/vehicules",
  },
  /* {
    text: "Pièces Véhicule",
    icon: <BuildIcon sx={{ color: "#7986cb" }} />,
    path: "/piece-vehicule",
  }
  {
    text: "Intégrations",
    icon: <SyncIcon sx={{ color: "#90a4ae" }} />,
    path: "/integrations",
  },,*/
  {
    text: "Factures",
    icon: <ListAltIcon sx={{ color: "#4dd0e1" }} />,
    path: "/factures",
  },
  {
    text: "Paramètres",
    icon: <SettingsIcon sx={{ color: "#cfd8dc" }} />,
    path: "/setting",
    subItems: [
      {
        text: "Sécurité",
        icon: <SecurityIcon sx={{ color: "#cfd8dc", fontSize: "1.2rem" }} />,
        path: "/settings",
      },
    ],
  },
  {
    text: "Compte",
    icon: <AccountIcon sx={{ color: "#f48fb1" }} />,
    path: "/account",
    subItems: [
      {
        text: "Profil",
        icon: <AccountIcon sx={{ color: "#f48fb1", fontSize: "1.2rem" }} />,
        path: "/Profile",
      },
    ],
  },
  {
    text: "Feedback",
    icon: <FeedbackIcon sx={{ color: "#fff176" }} />,
    path: "/feedback",
  },
];

// Utilisation de memo pour éviter les re-rendus inutiles
export const Sidebar = memo(({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedItem, setSelectedItem] = useState("Tableau de bord");

  // Utilisation de useCallback pour éviter les recréations de fonctions
  const toggleMenu = useCallback((menu) => {
    setActiveMenu((prevActiveMenu) => (prevActiveMenu === menu ? null : menu));
  }, []);

  const handleItemClick = useCallback(
    (text) => {
      setSelectedItem(text);
      if (isMobile) onClose();
    },
    [isMobile, onClose]
  );

  return (
    <PremiumDrawer
      variant={isMobile ? "temporary" : "persistent"}
      open={open}
      onClose={onClose}
      sx={{
        width: 229,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 285,
          boxSizing: "border-box",
          backgroundColor: theme.palette.background.default,
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: open
              ? theme.transitions.duration.enteringScreen
              : theme.transitions.duration.leavingScreen,
          }),
          overflowX: "hidden",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 3,
          background: "rgba(255,255,255,0.1)",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: "#1931be",
              width: 50,
              height: 50,
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            AP
          </Avatar>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",      color: "transparent",
              }}
            >
              AutoPartsPro
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255,255,255,0.8)",
                fontSize: ".9rem",
                letterSpacing: "0.5px",
              }}
            >
              Gestion des pièces
            </Typography>
          </Box>
        </Box>
        {isMobile && (
          <IconButton
            onClick={onClose}
            sx={{
              color: "rgba(255,255,255,0.9)",
              "&:hover": {
                color: "#fff",
                background: "rgba(255,255,255,0.2)",
              },
            }}
            aria-label="Fermer le menu"
          >
            <ChevronLeft />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", my: 1 }} />

      <List sx={{ p: 1 }}>
        {MENU_ITEMS.map((item) => (
          <React.Fragment key={item.text}>
            <PremiumListItem
              selected={selectedItem === item.text}
              onClick={() => {
                if (item.subItems) {
                  toggleMenu(item.text);
                } else {
                  handleItemClick(item.text);
                }
              }}
              component={!item.subItems ? Link : "div"}
              to={!item.subItems ? item.path : undefined}
              aria-label={item.text}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: "0.95rem",
                  fontWeight: selectedItem === item.text ? 600 : 400,
                  color: "rgba(255,255,255,0.9)",
                }}
              />
              {item.subItems &&
                (activeMenu === item.text ? (
                  <ExpandLess sx={{ color: "rgba(255,255,255,0.9)" }} />
                ) : (
                  <ExpandMore sx={{ color: "rgba(255,255,255,0.9)" }} />
                ))}
            </PremiumListItem>

            {item.subItems && (
              <Collapse
                in={activeMenu === item.text}
                timeout="auto"
                unmountOnExit
              >
                <List component="div" disablePadding>
                  {item.subItems.map((subItem) => (
                    <PremiumSubListItem
                      key={subItem.text}
                      selected={selectedItem === subItem.text}
                      component={Link}
                      to={subItem.path}
                      onClick={() => handleItemClick(subItem.text)}
                      aria-label={subItem.text}
                    >
                      <ListItemIcon>{subItem.icon}</ListItemIcon>
                      <ListItemText
                        primary={subItem.text}
                        primaryTypographyProps={{
                          fontSize: "0.85rem",
                          color: "rgba(255,255,255,0.9)",
                        }}
                      />
                    </PremiumSubListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", my: 1 }} />

      <Box sx={{ p: 2, textAlign: "center" }}>
        <Chip
          label="Version Pro"
          color="primary"
          size="small"
          sx={{
            background: "linear-gradient(45deg, #7c8dee, #8a5fb6)",
            color: "#fff",
            fontWeight: 600,
            mb: 1,
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: "rgba(255,255,255,0.8)",
            fontSize: "0.7rem",
            display: "block",
          }}
        >
          © 2025 AutoPartsPro
        </Typography>
      </Box>
    </PremiumDrawer>
  );
});

// Ajout du displayName pour faciliter le débogage
Sidebar.displayName = "Sidebar";
