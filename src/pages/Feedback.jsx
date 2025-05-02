import { useFeedback } from "../components/context/FeedBackContext";
import { Button } from "@mui/material";


const Feedback = () => {
  const { showFeedback } = useFeedback();

  return (
    <div style={{ padding: "2rem" }}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => showFeedback("Opération réussie !", "success")}
      >
        Montrer un succès
      </Button>

      <Button
        variant="outlined"
        color="error"
        onClick={() => showFeedback("Erreur lors du traitement", "error")}
        style={{ marginLeft: "1rem" }}
      >
        Montrer une erreur
      </Button>
    </div>
  );
};

export default Feedback;
