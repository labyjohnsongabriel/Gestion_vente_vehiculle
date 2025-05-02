import axios from "axios";
import Swal from "sweetalert2";

const handleLogin = async (email, password) => {
  try {
    const response = await axios.post("http://localhost:5000/api/auth/login", {
      email,
      password,
    });
    const { token, user } = response.data;

    // Stocker le token dans localStorage
    localStorage.setItem("authToken", token);

    // Afficher un message de succès
    Swal.fire("Succès", "Connexion réussie", "success");
  } catch (err) {
    Swal.fire("Erreur", "Email ou mot de passe incorrect", "error");
  }
};
