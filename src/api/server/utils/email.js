const nodemailer = require("nodemailer");

// Créer un transporteur avec les variables d'environnement ou valeurs directes (pour tester)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',       
  port: process.env.EMAIL_PORT || 587,                    // Port SMTP pour TLS
  secure: false,                                          // Utiliser TLS, car on utilise le port 587
  auth: {
    user: process.env.EMAIL_USERNAME || 'johnsonlabygabriel@gmail.com',  // Utilisateur (email d'envoi)
    pass: process.env.EMAIL_PASSWORD || 'J_100612',     // Mot de passe ou mot de passe d'application
  },
});

// Fonction pour envoyer un email
const sendEmail = async (options) => {
  const mailOptions = {
    from: `"No Reply" <${
      process.env.EMAIL_USERNAME || "johnsonlabygabriel@gmail.com"
    }>`, // Adresse de l'expéditeur
    to: options.email, // L'email du destinataire
    subject: options.subject, // Sujet de l'email
    text: options.message, // Corps du message en texte brut
    // html: options.html,                                                      // Optionnel si tu souhaites un format HTML
  };

  try {
    // Envoi de l'email
    await transporter.sendMail(mailOptions);
    console.log("✅ Email envoyé avec succès");
  } catch (error) {
    // Si une erreur se produit lors de l'envoi de l'email
    console.error("❌ Erreur lors de l'envoi de l'email:", error);
    throw error;
  }
};

module.exports = sendEmail;

