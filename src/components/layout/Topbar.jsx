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
  Button,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as ProfileIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Circle,
  LocalShipping,
  CheckCircle,
  Engineering,
  Settings as SettingsIcon,
  WorkOutline,
} from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";
import { useSidebar } from "../context/SidebarContext";
import axios from "axios";
import moment from "moment";
import "moment/locale/fr";
import { styled } from "@mui/material/styles";

const getStatusColor = (status) => {
  switch (status) {
    case "online":
      return "#4CAF50";
    case "away":
      return "#FFC107";
    case "busy":
      return "#F44336";
    case "offline":
      return "#9E9E9E";
    default:
      return "#9E9E9E";
  }
};

const PremiumAppBar = styled(AppBar)(({ theme }) => ({
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: theme.palette.common.white,
  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
  backdropFilter: "blur(10px)",
  borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
  borderRadius: 0,
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 6px 25px rgba(0,0,0,0.25)",
  },
}));

const StatusBadge = ({ status }) => {
  return (
    <Box
      sx={{
        width: 14,
        height: 14,
        borderRadius: "50%",
        border: "2px solid #ffffff",
        backgroundColor: getStatusColor(status),
        boxShadow: "0 0 8px rgba(0,0,0,0.3)",
      }}
    />
  );
};

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

const NotificationBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#EF5350",
    color: "#ffffff",
    fontWeight: "bold",
    boxShadow: "0 2px 4px rgba(239, 83, 80, 0.4)",
    padding: "0 6px",
    minWidth: 18,
    height: 18,
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
      checkUserStatus();
    }
  }, [user]);

  const checkUserStatus = () => {
    const lastActivity = localStorage.getItem("lastActivity");
    if (lastActivity) {
      const inactiveTime = Date.now() - parseInt(lastActivity);
      setStatus(inactiveTime > 15 * 60 * 1000 ? "away" : "online");
    }
  };

  const updateActivity = () => {
    localStorage.setItem("lastActivity", Date.now().toString());
    if (status === "away") setStatus("online");
  };

  useEffect(() => {
    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("keydown", updateActivity);
    return () => {
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("keydown", updateActivity);
    };
  }, [status]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/api/notifications");
      setNotifications(res.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      await axios.put(`/api/notifications/${notification.id}/read`);
      setNotifications(
        notifications.map((n) =>
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
      navigateNotification(notification);
      setNotifAnchorEl(null);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const navigateNotification = (notification) => {
    switch (notification.type) {
      case "VEHICLE_PART":
        navigate(`/vehicle-parts/${notification.relatedId}`);
        break;
      case "TASK_ASSIGNED":
        navigate(`/tasks/${notification.relatedId}`);
        break;
      default:
        break;
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put("/api/notifications/read-all");
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    axios.put("/api/users/status", { status: newStatus });
  };

  const getRoleLabel = (role) => {
    const roles = {
      admin: "Administrateur",
      manager: "Gestionnaire",
      technician: "Technicien",
      default: "Employé",
    };
    return roles[role] || roles.default;
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: <Engineering sx={{ color: "white", fontSize: 16 }} />,
      manager: <DashboardIcon sx={{ color: "#FF9800", fontSize: 16 }} />,
      technician: <LocalShipping sx={{ color: "#2196F3", fontSize: 16 }} />,
      default: <PersonIcon sx={{ color: "#5C6BC0", fontSize: 16 }} />,
    };
    return icons[role] || icons.default;
  };

  const renderNotificationContent = (notification) => {
    const icons = {
      VEHICLE_PART: <LocalShipping sx={{ color: "#5C6BC0" }} />,
      TASK_ASSIGNED: <WorkOutline sx={{ color: "#FF9800" }} />,
      SYSTEM: <SettingsIcon sx={{ color: "#673AB7" }} />,
      default: <CheckCircle sx={{ color: "#66BB6A" }} />,
    };

    return (
      <ListItem
        alignItems="flex-start"
        sx={{
          px: 0,
          transition: "all 0.2s ease",
          "&:hover": { transform: "translateX(4px)" },
        }}
      >
        <ListItemAvatar>
          <Avatar
            sx={{
              bgcolor: notification.read ? "#F5F5F5" : "#E8EAF6",
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
              fontWeight={notification.read ? 400 : 600}
              color={notification.read ? "text.secondary" : "text.primary"}
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <PremiumAppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - 280px)` },
        ml: { sm: `280px` },
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ minHeight: "72px !important", px: { xs: 2, sm: 4 } }}>
        <IconButton
          color="inherit"
          onClick={toggleSidebar}
          sx={{
            mr: 2,
            display: { sm: "none" },
            "&:hover": { background: "rgba(255,255,255,0.1)" },
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
                "&:hover": { background: "rgba(255,255,255,0.1)" },
              }}
            >
              <NotificationBadge badgeContent={unreadCount} max={9}>
                <NotificationsIcon />
              </NotificationBadge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Profil" arrow>
            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                p: 0,
                "&:hover": { transform: "scale(1.05)" },
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
                    background:
                      "linear-gradient(135deg, #7986CB 0%, #5C6BC0 100%)",
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
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{ color: "#1A237E" }}
              >
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  sx={{ color: "#5C6BC0", fontSize: 12 }}
                  onClick={markAllAsRead}
                >
                  Tout marquer comme lu
                </Button>
              )}
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <List
              sx={{
                width: "100%",
                maxHeight: 400,
                overflow: "auto",
                "&::-webkit-scrollbar": { width: "4px" },
                "&::-webkit-scrollbar-track": { background: "#f1f1f1" },
                "&::-webkit-scrollbar-thumb": {
                  background: "#c5cae9",
                  borderRadius: "4px",
                },
              }}
            >
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <MenuItem
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      mb: 1,
                      borderRadius: "12px",
                      background: notification.read
                        ? "inherit"
                        : "rgba(92, 107, 192, 0.08)",
                      "&:hover": { background: "rgba(92, 107, 192, 0.12)" },
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
                  background:
                    "linear-gradient(135deg, #7986CB 0%, #5C6BC0 100%)",
                  boxShadow: "0 8px 25px rgba(92, 107, 192, 0.3)",
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
              icon={getRoleIcon(user?.role)}
              label={getRoleLabel(user?.role)}
              size="small"
              sx={{
                px: 1.5,
                py: 0.5,
                background:
                  user?.role === "admin"
                    ? "linear-gradient(135deg, #5C6BC0 0%, #3949AB 100%)"
                    : user?.role === "manager"
                    ? "linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)"
                    : user?.role === "technician"
                    ? "linear-gradient(135deg, #64B5F6 0%, #2196F3 100%)"
                    : "rgba(92, 107, 192, 0.1)",
                color: ["admin", "manager", "technician"].includes(user?.role)
                  ? "white"
                  : "#5C6BC0",
                fontWeight: 600,
                boxShadow: "0 2px 6px rgba(92, 107, 192, 0.2)",
              }}
            />
          </Box>

          <Divider sx={{ my: 1 }} />

          <Box sx={{ px: 3, py: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 1, display: "block" }}
            >
              Définir votre statut
            </Typography>
            <Stack direction="row" spacing={1}>
              {["online", "away", "busy", "offline"].map((stat) => (
                <Tooltip
                  key={stat}
                  title={stat.charAt(0).toUpperCase() + stat.slice(1)}
                >
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor:
                        status === stat
                          ? stat === "online"
                            ? "#E8F5E9"
                            : stat === "away"
                            ? "#FFF8E1"
                            : stat === "busy"
                            ? "#FFEBEE"
                            : "#EEEEEE"
                          : "#F5F5F5",
                      cursor: "pointer",
                      border:
                        status === stat
                          ? `2px solid ${getStatusColor(stat)}`
                          : "none",
                    }}
                    onClick={() => handleStatusChange(stat)}
                  >
                    <Circle
                      sx={{ color: getStatusColor(stat), fontSize: 14 }}
                    />
                  </Avatar>
                </Tooltip>
              ))}
            </Stack>
          </Box>

          <Divider sx={{ my: 1 }} />

          {[
            {
              icon: <ProfileIcon sx={{ color: "#5C6BC0" }} />,
              text: "Mon Profil",
              path: "/profile",
            },
            {
              icon: <SettingsIcon sx={{ color: "#5C6BC0" }} />,
              text: "Paramètres",
              path: "/settings",
            },
            ...(user?.role === "admin" || user?.role === "manager"
              ? [
                  {
                    icon: <DashboardIcon sx={{ color: "#5C6BC0" }} />,
                    text: "Tableau de bord",
                    path: "/admin",
                  },
                ]
              : []),
            {
              icon: <LogoutIcon sx={{ color: "#EF5350" }} />,
              text: "Déconnexion",
              action: logout,
            },
          ].map((item, index) => (
            <MenuItem
              key={index}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else {
                  navigate(item.path);
                }
                setAnchorEl(null);
              }}
              sx={{
                py: 1.5,
                px: 3,
                "&:hover": {
                  background:
                    item.text === "Déconnexion"
                      ? "rgba(239, 83, 80, 0.08)"
                      : "rgba(92, 107, 192, 0.08)",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <Typography variant="body2" fontWeight={500}>
                {item.text}
              </Typography>
            </MenuItem>
          ))}
        </PremiumMenu>
      </Toolbar>
    </PremiumAppBar>
  );
};

export default Topbar;
