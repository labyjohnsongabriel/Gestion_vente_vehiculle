const mysql = require("mysql2");

// Connexion MySQL avec support de plusieurs requêtes
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "gestion_pieces",
  multipleStatements: true // 💥 Important pour exécuter plusieurs requêtes en une fois
});

// Connexion
connection.connect((err) => {
  if (err) {
    console.error("❌ Erreur de connexion à la base de données :", err);
    return;
  }
  console.log("✅ Connexion MySQL réussie.");

  // Création des tables
  const createTables = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100) UNIQUE,
      password VARCHAR(255),
      role ENUM('admin', 'employee') DEFAULT 'employee',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS fournisseurs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nom VARCHAR(100) NOT NULL,
      adresse VARCHAR(255),
      telephone VARCHAR(20),
      email VARCHAR(100),
      date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100),
      phone VARCHAR(20),
      address TEXT
    );

    CREATE TABLE IF NOT EXISTS vehicules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      marque VARCHAR(50) NOT NULL,
      modele VARCHAR(50) NOT NULL,
      immatriculation VARCHAR(20) NOT NULL UNIQUE,
      annee INT NOT NULL,
      kilometrage INT NOT NULL,
      date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pieces (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      description TEXT,
      price DECIMAL(10,2),
      image VARCHAR(255),
      category_id INT,
      fournisseur_id INT,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id)
    );

    CREATE TABLE IF NOT EXISTS stocks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      piece_id INT,
      quantity INT,
      FOREIGN KEY (piece_id) REFERENCES pieces(id)
    );

    CREATE TABLE IF NOT EXISTS commandes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      client_id INT,
      user_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS details_commande (
      id INT AUTO_INCREMENT PRIMARY KEY,
      commande_id INT,
      piece_id INT,
      quantity INT,
      price DECIMAL(10,2),
      FOREIGN KEY (commande_id) REFERENCES commandes(id),
      FOREIGN KEY (piece_id) REFERENCES pieces(id)
    );

    CREATE TABLE IF NOT EXISTS factures (
      id INT AUTO_INCREMENT PRIMARY KEY,
      commande_id INT,
      total DECIMAL(10,2),
      date_facture TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (commande_id) REFERENCES commandes(id)
    );

    CREATE TABLE IF NOT EXISTS pieces_vehicules (
      piece_id INT,
      vehicule_id INT,
      PRIMARY KEY (piece_id, vehicule_id),
      FOREIGN KEY (piece_id) REFERENCES pieces(id),
      FOREIGN KEY (vehicule_id) REFERENCES vehicules(id)
    );
  `;

  // Exécution des requêtes
  connection.query(createTables, (err) => {
    if (err) {
      console.error("❌ Erreur lors de la création des tables :", err);
    } else {
      console.log("✅ Toutes les tables ont été créées avec succès.");
    }
  });
});

module.exports = connection;
