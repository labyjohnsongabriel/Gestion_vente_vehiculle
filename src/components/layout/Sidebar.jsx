import React, { useState } from "react";
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
} from "@mui/material";

import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  SyncAlt as SyncIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountIcon,
  Error as ErrorIcon,
  Star as StarIcon,
  ExpandLess,
  ExpandMore,
  BarChart as BarChartIcon,
  ListAlt as ListAltIcon,
  Feedback as FeedbackIcon,
  ChevronLeft,
  Menu,
} from "@mui/icons-material";

import { Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

// Correction du chemin : styles/slide.css →  (supposons que tu es dans src/components/layout/)
import "../../styles/slide.css";

// Correction du chemin : Setting.jsx est dans components/layout/
//import Setting from "../../pages/Setting"; // au lieu de "../layout/Setting.jsx"

export const Sidebar = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [activeMenu, setActiveMenu] = useState(null);

  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const menuItems = [
    {
      text: "Tableau de bord",
      icon: <DashboardIcon />,
      path: "/dashboard",
      subItems: [
        { text: "Statistiques", icon: <BarChartIcon />, path: "/statistic" },
        { text: "Rapports", icon: <ListAltIcon />, path: "/reports" },
      ],
    },
    {
      text: "Clients",
      icon: <PeopleIcon />,
      path: "/customers",
      subItems: [
        { text: "Gestion", icon: <PeopleIcon />, path: "/customers/manage" },
        {
          text: "Analytique",
          icon: <BarChartIcon />,
          path: "/customers/analytics",
        },
      ],
    },
    {
      text: "Inventaire",
      icon: <InventoryIcon />,
      path: "/inventory",
      subItems: [
        { text: "Stock", icon: <InventoryIcon />, path: "/inventory/stock" },
        { text: "Commandes", icon: <ListAltIcon />, path: "/inventory/orders" },
      ],
    },
    { text: "Intégrations", icon: <SyncIcon />, path: "/integrations" },
    { text: "Paramètres", icon: <SettingsIcon />, path: "/setting" },
    {
      text: "Compte",
      icon: <AccountIcon />,
      path: "/account",
      subItems: [
        { text: "Profil", icon: <AccountIcon />, path: "/account/profile" },
        { text: "Sécurité", icon: <SettingsIcon />, path: "/account/security" },
      ],
    },
    { text: "Erreurs", icon: <ErrorIcon />, path: "/errors" },
    { text: "FeedBack", icon: <FeedbackIcon />, path: "/feedback" },
  ];

  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      open={open}
      onClose={onClose}
      sx={{
        width: open ? 30 : 0, // Correction ici (2 n'était pas bon)
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 3,
        }}
      >
        <Box>
          <Typography className="sidebar-header" variant="h6" noWrap>
            AutoPartsPro
          </Typography>
          <Typography
            className="sidebar-subtitle"
            variant="subtitle2"
            sx={{ mt: 0.5, color: "rgba(32, 29, 29, 0.7)", fontSize: 16.8 }}
          >
            Gestion des pièces de véhicules
          </Typography>
        </Box>
       {/* <IconButton onClick={onClose} sx={{ color: "inherit" }}>
          {isMobile ? <ChevronLeft /> : <Menu />}
        </IconButton>*/}
      </Box>

      <Divider sx={{ my: 1, backgroundColor: "rgba(255,255,255,0.1)" }} />

      <List>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItemButton
              onClick={() => (item.subItems ? toggleMenu(item.text) : null)}
              component={!item.subItems ? Link : "div"}
              to={!item.subItems ? item.path : undefined}
              sx={{
                mx: 1,
                borderRadius: 1,
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  transform: "translateX(8px)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
              {item.subItems &&
                (activeMenu === item.text ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>

            {item.subItems && (
              <Collapse
                in={activeMenu === item.text}
                timeout="auto"
                unmountOnExit
              >
                <List component="div" disablePadding>
                  {item.subItems.map((subItem) => (
                    <ListItemButton
                      key={subItem.text}
                      component={Link}
                      to={subItem.path}
                      sx={{
                        pl: 4,
                        mx: 1,
                        borderRadius: 1,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: "inherit" }}>
                        {subItem.icon}
                      </ListItemIcon>
                      <ListItemText primary={subItem.text} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>

      <Divider sx={{ my: 2, backgroundColor: "rgba(255,255,255,0.1)" }} />

      <Box sx={{ p: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Besoin de plus de fonctionnalités ?
        </Typography>
        <Typography
          variant="body2"
          sx={{ mb: 2, color: "rgba(255,255,255,0.7)" }}
        >
          Découvrez notre solution Pro.
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <StarIcon color="primary" />
          <Typography variant="body2" sx={{ ml: 1 }}>
            Version Premium
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};
