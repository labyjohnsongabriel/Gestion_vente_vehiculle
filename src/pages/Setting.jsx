import {
  Switch,
  FormControlLabel,
  Box,
  Typography,
  RadioGroup,
  Radio,
  FormLabel,
  FormControl,
} from "@mui/material";
import { useUserPreferences } from "./UserPreferencesContext";

const SettingsPanel = () => {
  const { preferences, updatePreferences } = useUserPreferences();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Préférences
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={preferences.darkMode}
            onChange={(e) => updatePreferences({ darkMode: e.target.checked })}
          />
        }
        label="Mode sombre"
        sx={{ mb: 2, display: "block" }}
      />

      <FormControlLabel
        control={
          <Switch
            checked={preferences.denseLayout}
            onChange={(e) =>
              updatePreferences({ denseLayout: e.target.checked })
            }
          />
        }
        label="Affichage compact"
        sx={{ mb: 2, display: "block" }}
      />

      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <FormLabel component="legend">Taille de texte</FormLabel>
        <RadioGroup
          value={preferences.fontSize}
          onChange={(e) => updatePreferences({ fontSize: e.target.value })}
        >
          <FormControlLabel value="small" control={<Radio />} label="Petit" />
          <FormControlLabel value="normal" control={<Radio />} label="Normal" />
          <FormControlLabel value="large" control={<Radio />} label="Grand" />
        </RadioGroup>
      </FormControl>
    </Box>
  );
};
