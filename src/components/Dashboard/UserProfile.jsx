import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  Divider,
  Tab,
  Tabs,
  TextField,
  Button,
  Chip,
  useTheme,
  styled,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Edit as EditIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Lock as PasswordIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';

// Composants stylisés premium
const PremiumCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
  border: '1px solid rgba(255,255,255,0.3)',
  overflow: 'hidden'
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: '4px solid #5C6BC0',
  boxShadow: '0 4px 20px rgba(92, 107, 192, 0.3)',
  margin: '-60px auto 20px',
  position: 'relative',
  zIndex: 1,
  background: 'linear-gradient(135deg, #7986CB 0%, #5C6BC0 100%)'
}));

const UserProfile = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState({
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.com',
    phone: '+33 6 12 34 56 78',
    address: '15 Rue de la République, Paris',
    birthDate: '15/05/1985',
    password: '********'
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setEditMode(false);
    // Ici vous ajouteriez la logique pour sauvegarder les données
  };

  const handleCancel = () => {
    setEditMode(false);
    // Réinitialiser les données si nécessaire
  };

  return (
    <Box sx={{ p: 4 }}>
      <PremiumCard>
        {/* Bannière de profil */}
        <Box sx={{ 
          height: 150,
          background: 'linear-gradient(135deg, #3a5169 0%, #2a2a4a 100%)'
        }} />
        
        {/* Avatar et infos basiques */}
        <Box sx={{ textAlign: 'center', px: 4 }}>
          <ProfileAvatar>
            {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
          </ProfileAvatar>
          
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {userData.firstName} {userData.lastName}
          </Typography>
          
          <Chip 
            label="Administrateur" 
            color="primary" 
            size="small" 
            icon={<PersonIcon sx={{ fontSize: '1rem' }} />}
            sx={{ 
              mb: 3,
              background: 'linear-gradient(135deg, #5C6BC0 0%, #3949AB 100%)',
              color: 'white'
            }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
            <Button
              variant={editMode ? "contained" : "outlined"}
              color="primary"
              startIcon={editMode ? <CheckIcon /> : <EditIcon />}
              onClick={editMode ? handleSave : handleEditToggle}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                ...(editMode && {
                  background: 'linear-gradient(135deg, #5C6BC0 0%, #3949AB 100%)'
                })
              }}
            >
              {editMode ? 'Enregistrer' : 'Modifier le profil'}
            </Button>
            
            {editMode && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<CloseIcon />}
                onClick={handleCancel}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Annuler
              </Button>
            )}
          </Box>
        </Box>
        
        {/* Onglets */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            centered
            sx={{
              '& .MuiTabs-indicator': {
                background: 'linear-gradient(90deg, #5C6BC0 0%, #3949AB 100%)',
                height: 3
              }
            }}
          >
            <Tab 
              label="Informations" 
              icon={<PersonIcon />} 
              iconPosition="start" 
              sx={{ minHeight: 48, fontWeight: 600 }}
            />
            <Tab 
              label="Sécurité" 
              icon={<PasswordIcon />} 
              iconPosition="start" 
              sx={{ minHeight: 48, fontWeight: 600 }}
            />
            <Tab 
              label="Activité" 
              icon={<CalendarIcon />} 
              iconPosition="start" 
              sx={{ minHeight: 48, fontWeight: 600 }}
            />
          </Tabs>
        </Box>
        
        {/* Contenu des onglets */}
        <CardContent>
          {tabValue === 0 && (
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1A237E' }}>
                  Informations personnelles
                </Typography>
                
                {editMode ? (
                  <Box component="form" sx={{ '& .MuiTextField-root': { mb: 3 } }}>
                    <TextField
                      fullWidth
                      label="Prénom"
                      name="firstName"
                      value={userData.firstName}
                      onChange={handleChange}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Nom"
                      name="lastName"
                      value={userData.lastName}
                      onChange={handleChange}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={userData.email}
                      onChange={handleChange}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Téléphone"
                      name="phone"
                      value={userData.phone}
                      onChange={handleChange}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                ) : (
                  <List sx={{ width: '100%' }}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'rgba(92, 107, 192, 0.1)', color: '#5C6BC0' }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary="Nom complet" 
                        secondary={`${userData.firstName} ${userData.lastName}`} 
                      />
                    </ListItem>
                    
                    <Divider variant="inset" component="li" />
                    
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'rgba(92, 107, 192, 0.1)', color: '#5C6BC0' }}>
                          <EmailIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary="Email" secondary={userData.email} />
                    </ListItem>
                    
                    <Divider variant="inset" component="li" />
                    
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'rgba(92, 107, 192, 0.1)', color: '#5C6BC0' }}>
                          <PhoneIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary="Téléphone" secondary={userData.phone} />
                    </ListItem>
                  </List>
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1A237E' }}>
                  Autres informations
                </Typography>
                
                {editMode ? (
                  <Box component="form" sx={{ '& .MuiTextField-root': { mb: 3 } }}>
                    <TextField
                      fullWidth
                      label="Adresse"
                      name="address"
                      value={userData.address}
                      onChange={handleChange}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Date de naissance"
                      name="birthDate"
                      value={userData.birthDate}
                      onChange={handleChange}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                ) : (
                  <List sx={{ width: '100%' }}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'rgba(92, 107, 192, 0.1)', color: '#5C6BC0' }}>
                          <LocationIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary="Adresse" secondary={userData.address} />
                    </ListItem>
                    
                    <Divider variant="inset" component="li" />
                    
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'rgba(92, 107, 192, 0.1)', color: '#5C6BC0' }}>
                          <CalendarIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary="Date de naissance" secondary={userData.birthDate} />
                    </ListItem>
                  </List>
                )}
              </Grid>
            </Grid>
          )}
          
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1A237E' }}>
                Sécurité du compte
              </Typography>
              
              {editMode ? (
                <Box component="form" sx={{ maxWidth: 500 }}>
                  <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    label="Nouveau mot de passe"
                    name="password"
                    value={userData.password}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PasswordIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    label="Confirmer le mot de passe"
                    variant="outlined"
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PasswordIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              ) : (
                <List sx={{ width: '100%', maxWidth: 500 }}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'rgba(92, 107, 192, 0.1)', color: '#5C6BC0' }}>
                        <PasswordIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Mot de passe" 
                      secondary="************" 
                    />
                    <Button 
                      variant="outlined" 
                      startIcon={<EditIcon />}
                      onClick={handleEditToggle}
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      Modifier
                    </Button>
                  </ListItem>
                </List>
              )}
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Sécurité supplémentaire
                </Typography>
                <Chip 
                  label="Authentification à deux facteurs activée" 
                  color="success" 
                  variant="outlined"
                  icon={<SecurityIcon />}
                  sx={{ mr: 2 }}
                />
                <Chip 
                  label="Dernière connexion: aujourd'hui à 09:30" 
                  color="info" 
                  variant="outlined"
                  sx={{ mr: 2 }}
                />
              </Box>
            </Box>
          )}
          
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1A237E' }}>
                Activité récente
              </Typography>
              
              <List sx={{ width: '100%' }}>
                {[
                  { id: 1, action: 'Connexion au système', date: 'Aujourd\'hui, 09:30', icon: <PersonIcon color="primary" /> },
                  { id: 2, action: 'Modification du profil', date: 'Hier, 14:20', icon: <EditIcon color="primary" /> },
                  { id: 3, action: 'Changement de mot de passe', date: '15/05/2023', icon: <PasswordIcon color="primary" /> },
                  { id: 4, action: 'Accès au tableau de bord', date: '14/05/2023', icon: <CalendarIcon color="primary" /> },
                ].map((item) => (
                  <React.Fragment key={item.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'rgba(92, 107, 192, 0.1)' }}>
                          {item.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={item.action} 
                        secondary={item.date} 
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}
        </CardContent>
      </PremiumCard>
    </Box>
  );
};

export default UserProfile;