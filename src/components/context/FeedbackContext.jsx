// src/context/FeedbackContext.jsx
import { useState, createContext, useContext } from "react";
import { Snackbar, Alert, Slide } from "@mui/material";
import "../../styles/Feddback.css";

const FeedbackContext = createContext();

export const FeedbackProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("success");

  const showFeedback = (msg, sev = "success") => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  return (
    <FeedbackContext.Provider value={{ showFeedback }}>
      {children}
      <Snackbar
        open={open}
        onClose={handleClose}
        autoHideDuration={5000}
        TransitionComponent={Slide}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        className="feedback-snackbar"
      >
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          className="feedback-alert"
        >
          {message}
        </Alert>
      </Snackbar>
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => useContext(FeedbackContext);
