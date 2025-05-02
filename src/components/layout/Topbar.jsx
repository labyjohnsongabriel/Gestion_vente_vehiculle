import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
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
  Chip,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as ProfileIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Circle,
  LocalShipping,
  CheckCircle,
  Engineering,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";
import { useSidebar } from "../context/SidebarContext";
import axios from "axios";
import moment from "moment";
import "moment/locale/fr";
import { styled } from "@mui/material/styles";

const PremiumAppBar = styled(AppBar)(({ theme }) => ({
  background: "linear-gradient(135deg, #3a5169 0%, #2a2a4a 100%)",
  color: theme.palette.common.white,
  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
  backdropFilter: "blur(10px)",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 6px 25px rgba(0,0,0,0.25)",
  },
}));

const StatusBadge = styled(Circle)(({ status }) => ({
  position: "absolute",
  bottom: 2,
  right: 2,
  width: 14,
  height: 14,
  borderRadius: "50%",
  border: "2px solid #ffffff",
  backgroundColor:
    status === "online"
      ? "#4CAF50"
      : status === "away"
      ? "#FFC107"
      : "#F44336",
  boxShadow: "0 0 8px rgba(0,0,0,0.3)",
}));

const PremiumMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    width: 320,
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
    background: "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)",
    "&:before": {
      content: '""',
      display: "block",
      position: "absolute",
      top: -8,
      right: 20,
      width: 16,
      height: 16,
      background: "#ffffff",
      transform: "rotate(45deg)",
      zIndex: 0,
    },
  },
}));

const Topbar = () => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [status, setStatus] = useState("online");
  const [notifications, setNotifications] = useState([]);
  const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/api/notifications");
      setNotifications(res.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      await axios.put(`/api/notifications/${notification._id}/read`);
      setNotifications(
        notifications.map((n) =>
          n._id === notification._id ? { ...n, read: true } : n
        )
      );

      if (notification.type === "VEHICLE_PART") {
        navigate(`/vehicle-parts/${notification.relatedId}`);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const renderNotificationContent = (notification) => {
    const icons = {
      VEHICLE_PART: <LocalShipping sx={{ color: "#5C6BC0" }} />,
      default: <CheckCircle sx={{ color: "#66BB6A" }} />,
    };

    return (
      <ListItem
        alignItems="flex-start"
        sx={{
          px: 0,
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateX(4px)",
          },
        }}
      >
        <ListItemAvatar>
          <Avatar
            sx={{
              bgcolor: notification.type === "VEHICLE_PART" ? "#E8EAF6" : "#E8F5E9",
              width: 40,
              height: 40,
            }}
          >
            {icons[notification.type] || icons.default}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography
              variant="subtitle2"
              fontWeight={500}
              color="text.primary"
            >
              {notification.message}
            </Typography>
          }
          secondary={
            <Typography variant="caption" color="text.secondary">
              {moment(notification.createdAt).fromNow()}
            </Typography>
          }
          sx={{ my: 0 }}
        />
      </ListItem>
    );
  };

  return (
    <PremiumAppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - 280px)` },
        ml: { sm: `280px` },
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          minHeight: "72px !important",
          px: { xs: 2, sm: 4 },
        }}
      >
        <IconButton
          color="inherit"
          onClick={toggleSidebar}
          sx={{
            mr: 2,
            display: { sm: "none" },
            "&:hover": {
              background: "rgba(255,255,255,0.1)",
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Notifications" arrow>
            <IconButton
              onClick={(e) => setNotifAnchorEl(e.currentTarget)}
              sx={{
                color: "inherit",
                "&:hover": {
                  background: "rgba(255,255,255,0.1)",
                },
              }}
            >
              <Badge
                badgeContent={notifications.filter((n) => !n.read).length}
                color="error"
                overlap="circular"
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Profil" arrow>
            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                p: 0,
                "&:hover": {
                  transform: "scale(1.05)",
                },
                transition: "transform 0.2s ease",
              }}
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={<StatusBadge status={status} />}
              >
                <Avatar
                  alt={`${user?.firstName} ${user?.lastName}`}
                  src={user?.avatar}
                  sx={{
                    width: 42,
                    height: 42,
                    border: "2px solid rgba(255,255,255,0.3)",
                    background: "linear-gradient(135deg, #7986CB 0%, #5C6BC0 100%)",
                  }}
                >
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </Avatar>
              </Badge>
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Menu Notifications */}
        <PremiumMenu
          anchorEl={notifAnchorEl}
          open={Boolean(notifAnchorEl)}
          onClose={() => setNotifAnchorEl(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box sx={{ p: 2 }}>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{ mb: 1, color: "#1A237E" }}
            >
              Notifications
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List
              sx={{
                width: "100%",
                maxHeight: 400,
                overflow: "auto",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
              }}
            >
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <MenuItem
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      mb: 1,
                      borderRadius: "12px",
                      background: notification.read
                        ? "inherit"
                        : "rgba(92, 107, 192, 0.08)",
                      "&:hover": {
                        background: "rgba(92, 107, 192, 0.12)",
                      },
                    }}
                  >
                    {renderNotificationContent(notification)}
                  </MenuItem>
                ))
              ) : (
                <Typography
                  variant="body2"
                  sx={{ p: 2, textAlign: "center", color: "text.secondary" }}
                >
                  Aucune nouvelle notification
                </Typography>
              )}
            </List>
          </Box>
        </PremiumMenu>

        {/* Menu Profil */}
        <PremiumMenu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              badgeContent={<StatusBadge status={status} />}
            >
              <Avatar
                src={user?.avatar}
                sx={{
                  width: 88,
                  height: 88,
                  mx: "auto",
                  mb: 2,
                  border: "4px solid #5C6BC0",
                  background: "linear-gradient(135deg, #7986CB 0%, #5C6BC0 100%)",
                }}
              >
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </Avatar>
            </Badge>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ color: "#1A237E", mb: 0.5 }}
            >
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="body2" sx={{ color: "#5C6BC0", mb: 2 }}>
              {user?.email}
            </Typography>
            <Chip
              icon={
                user?.role === "admin" ? (
                  <Engineering sx={{ color: "white", fontSize: 16 }} />
                ) : (
                  <PersonIcon sx={{ color: "#5C6BC0", fontSize: 16 }} />
                )
              }
              label={user?.role === "admin" ? "Administrateur" : "Employé"}
              size="small"
              sx={{
                px: 1.5,
                py: 0.5,
                background:
                  user?.role === "admin"
                    ? "linear-gradient(135deg, #5C6BC0 0%, #3949AB 100%)"
                    : "rgba(92, 107, 192, 0.1)",
                color: user?.role === "admin" ? "white" : "#5C6BC0",
                fontWeight: 600,
                boxShadow: "0 2px 6px rgba(92, 107, 192, 0.2)",
              }}
            />
          </Box>

          <Divider sx={{ my: 1 }} />

          <MenuItem
            onClick={() => navigate("/profile")}
            sx={{
              py: 1.5,
              px: 3,
              "&:hover": {
                background: "rgba(92, 107, 192, 0.08)",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <ProfileIcon sx={{ color: "#5C6BC0" }} />
            </ListItemIcon>
            <Typography variant="body2" fontWeight={500}>
              Mon Profil
            </Typography>
          </MenuItem>

          {user?.role === "admin" && (
            <MenuItem
              onClick={() => navigate("/admin/dashboard")}
              sx={{
                py: 1.5,
                px: 3,
                "&:hover": {
                  background: "rgba(92, 107, 192, 0.08)",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <DashboardIcon sx={{ color: "#5C6BC0" }} />
              </ListItemIcon>
              <Typography variant="body2" fontWeight={500}>
                Tableau de bord
              </Typography>
            </MenuItem>
          )}

          <Divider sx={{ my: 1 }} />

          <MenuItem
            onClick={logout}
            sx={{
              py: 1.5,
              px: 3,
              "&:hover": {
                background: "rgba(239, 83, 80, 0.08)",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogoutIcon sx={{ color: "#EF5350" }} />
            </ListItemIcon>
            <Typography variant="body2" fontWeight={500}>
              Déconnexion
            </Typography>
          </MenuItem>
        </PremiumMenu>
      </Toolbar>
    </PremiumAppBar>
  );
};

export default Topbar;