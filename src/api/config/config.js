module.exports = {
  // Configuration de l'entreprise
  companyName: "AutoParts Pro",
  companyAddress: "123 Rue des Garagistes",
  companyPostalCode: "75000",
  companyCity: "Paris",
  companyPhone: "+33 1 23 45 67 89",
  companyEmail: "contact@autopartspro.fr",
  companySiret: "123 456 789 00010",
  companyTVA: "FR00123456789",

  // Coordonnées bancaires
  bankDetails: "IBAN: FR76 3000 4000 5000 6000 7000 123 / BIC: SOGEFRPP",
  companyIBAN: "FR7630004000500060007000123",
  companyBIC: "SOGEFRPP",

  // Configuration de la base de données
  database: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "autoparts_user",
    password: process.env.DB_PASSWORD || "securepassword",
    database: process.env.DB_NAME || "autoparts_db",
  },

  // Autres configurations
  invoicePrefix: "FAC",
  defaultCurrency: "EUR",
  tvaRate: 0.2, // 20%
};
