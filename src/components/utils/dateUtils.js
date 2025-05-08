/**
 * Formate une date au format français
 * @param {string|Date} date - Date à formater
 * @returns {string} Date formatée (ex: "12 janvier 2023")
 */
export const formatDate = (date) => {
  if (!date) return "Non spécifié";

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  try {
    return new Date(date).toLocaleDateString("fr-FR", options);
  } catch (error) {
    console.error("Erreur de formatage de date:", error);
    return "Date invalide";
  }
};

/**
 * Calcule l'âge à partir d'une date
 * @param {string} dateString - Date de naissance
 * @returns {number} Âge en années
 */
export const calculateAge = (dateString) => {
  const birthDate = new Date(dateString);
  const diff = Date.now() - birthDate.getTime();
  return Math.abs(new Date(diff).getUTCFullYear() - 1970);
};

export default {
  formatDate,
  calculateAge,
};
