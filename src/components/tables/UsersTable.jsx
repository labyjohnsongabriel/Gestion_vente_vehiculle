import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Typography,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import UserFormModal from "./UserFormModal ";

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/users");
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const results = users.filter(
      (user) =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleEdit = () => {
    setOpenModal(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/users/${selectedUser._id}`);
      setUsers(users.filter((user) => user._id !== selectedUser._id));
      handleMenuClose();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setOpenModal(true);
  };

  const handleSubmit = async (userData) => {
    try {
      if (selectedUser) {
        // Update existing user
        const response = await axios.put(
          `/api/users/${selectedUser._id}`,
          userData
        );
        setUsers(
          users.map((user) =>
            user._id === selectedUser._id ? response.data : user
          )
        );
      } else {
        // Create new user
        const response = await axios.post("/api/users", userData);
        setUsers([...users, response.data]);
      }
      setOpenModal(false);
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <TextField
          variant="outlined"
          size="small"
          placeholder="Rechercher utilisateurs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />

        {currentUser?.role === "admin" && (
          <Tooltip title="Ajouter un utilisateur">
            <IconButton color="primary" onClick={handleAddUser} sx={{ ml: 2 }}>
              <PersonAddIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="users table">
          <TableHead>
            <TableRow>
              <TableCell>Photo</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rôle</TableCell>
              <TableCell>Date d'inscription</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell>
                    <Avatar
                      src={user.avatar}
                      alt={`${user.firstName} ${user.lastName}`}
                      sx={{ width: 40, height: 40 }}
                    />
                  </TableCell>
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: "inline-block",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor:
                          user.role === "admin"
                            ? "primary.light"
                            : user.role === "professional"
                            ? "secondary.light"
                            : "grey.200",
                        color:
                          user.role === "admin"
                            ? "primary.contrastText"
                            : user.role === "professional"
                            ? "secondary.contrastText"
                            : "text.primary",
                      }}
                    >
                      {user.role}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    {currentUser?.role === "admin" && (
                      <>
                        <Tooltip title="Modifier">
                          <IconButton
                            onClick={() => {
                              setSelectedUser(user);
                              setOpenModal(true);
                            }}
                          >
                            <EditIcon color="primary" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Plus d'options">
                          <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                            <MoreVertIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" color="textSecondary">
                    Aucun utilisateur trouvé
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} /> Modifier
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon color="error" sx={{ mr: 1 }} /> Supprimer
        </MenuItem>
      </Menu>

      <UserFormModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        user={selectedUser}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default UsersTable;
