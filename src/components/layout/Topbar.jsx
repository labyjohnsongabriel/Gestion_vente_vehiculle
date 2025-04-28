import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Badge,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Typography,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  MailOutline as MailIcon,
  PersonAdd as PersonAddIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useSidebar } from "../Context/SidebarContext.jsx";
import { useCustomTheme } from "../Context/ThemeContext.jsx";

const Topbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const { toggleSidebar } = useSidebar();
  const { toggleTheme, mode } = useCustomTheme();

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleNotificationMenuOpen = (event) =>
    setNotificationAnchorEl(event.currentTarget);
  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationAnchorEl(null);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - 290px)` },
        ml: { sm: `470px` },
        backgroundColor: "background.paper",
        color: "text.primary",
        boxShadow: "none",
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={toggleSidebar}
          sx={{ mr: 2, display: { sm: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Notifications">
            <IconButton onClick={handleNotificationMenuOpen}>
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Messages">
            <IconButton>
              <Badge badgeContent={3} color="error">
                <MailIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Account">
            <IconButton onClick={handleProfileMenuOpen}>
              <Avatar
                alt="User"
                src="https://randomuser.me/api/portraits/men/1.jpg"
                sx={{ width: 40, height: 40 }}
              />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <PersonAddIcon fontSize="small" />
            </ListItemIcon>
            My Profile
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchorEl}
          open={Boolean(notificationAnchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{ sx: { width: 360 } }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Notifications</Typography>
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={handleMenuClose}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  src="https://randomuser.me/api/portraits/women/1.jpg"
                  sx={{ mr: 2 }}
                />
                <Box>
                  <Typography variant="body1">New order received</Typography>
                  <Typography variant="body2" color="text.secondary">
                    2 hours ago
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={handleMenuClose}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  src="https://randomuser.me/api/portraits/men/2.jpg"
                  sx={{ mr: 2 }}
                />
                <Box>
                  <Typography variant="body1">
                    New customer registered
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    1 day ago
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          </Box>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
