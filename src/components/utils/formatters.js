/**
 * Utilitaires de formatage de données
 * @module utils/formatters
 */

/**
 * Formate un nombre avec séparateurs de milliers
 * @param {number} num - Nombre à formater
 * @param {number} [decimals=0] - Nombre de décimales
 * @param {string} [locale='fr-FR'] - Locale à utiliser
 * @returns {string} Nombre formaté
 */
export const formatNumber = (num, decimals = 0, locale = "fr-FR") => {
  if (isNaN(num)) return "N/A";

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

/**
 * Formate un nombre en pourcentage
 * @param {number} num - Nombre à formater (ex: 0.85 pour 85%)
 * @param {number} [decimals=1] - Nombre de décimales
 * @returns {string} Pourcentage formaté
 */
export const formatPercent = (num, decimals = 1) => {
  if (isNaN(num)) return "N/A";
  return formatNumber(num * 100, decimals) + "%";
};

/**
 * Formate une date selon le format spécifié
 * @param {string|Date} date - Date à formater
 * @param {string} [format='short'] - Format ('short', 'medium', 'long', 'full' ou pattern custom)
 * @param {string} [locale='fr-FR'] - Locale à utiliser
 * @returns {string} Date formatée
 */
export const formatDate = (date, format = "short", locale = "fr-FR") => {
  if (!date) return "N/A";

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "Date invalide";

  const formatOptions = {
    short: {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    },
    medium: {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
    long: {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
    full: {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  };

  if (typeof format === "string" && formatOptions[format]) {
    return new Intl.DateTimeFormat(locale, formatOptions[format]).format(
      dateObj
    );
  }

  // Format personnalisé
  return new Intl.DateTimeFormat(locale, format).format(dateObj);
};

/**
 * Formate une durée en heures:minutes
 * @param {number} minutes - Durée en minutes
 * @returns {string} Durée formatée (ex: "2h30")
 */
export const formatDuration = (minutes) => {
  if (isNaN(minutes)) return "N/A";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours > 0 ? `${hours}h` : ""}${mins > 0 ? `${mins}m` : ""}`;
};

/**
 * Formate une taille en octets en unités lisible (Ko, Mo, Go)
 * @param {number} bytes - Taille en octets
 * @param {number} [decimals=1] - Nombre de décimales
 * @returns {string} Taille formatée
 */
export const formatFileSize = (bytes, decimals = 1) => {
  if (isNaN(bytes)) return "N/A";
  if (bytes === 0) return "0 Octets";

  const k = 1024;
  const sizes = ["Octets", "Ko", "Mo", "Go", "To"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${
    sizes[i]
  }`;
};

/**
 * Formate une valeur monétaire
 * @param {number} amount - Montant à formater
 * @param {string} [currency='EUR'] - Devise (EUR, USD...)
 * @param {string} [locale='fr-FR'] - Locale à utiliser
 * @returns {string} Montant formaté
 */
export const formatCurrency = (amount, currency = "EUR", locale = "fr-FR") => {
  if (isNaN(amount)) return "N/A";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formate un numéro de téléphone
 * @param {string} phone - Numéro de téléphone
 * @returns {string} Numéro formaté
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return "N/A";

  // Supprime tous les caractères non numériques
  const cleaned = `${phone}`.replace(/\D/g, "");

  // Format français
  if (cleaned.length === 10) {
    return cleaned.replace(
      /(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
      "$1 $2 $3 $4 $5"
    );
  }

  // Format international
  if (cleaned.length > 2) {
    return `+${cleaned.slice(0, 2)} ${cleaned
      .slice(2)
      .replace(/(\d{2})/g, "$1 ")}`.trim();
  }

  return phone;
};

export default {
  formatNumber,
  formatPercent,
  formatDate,
  formatDuration,
  formatFileSize,
  formatCurrency,
  formatPhoneNumber,
};
