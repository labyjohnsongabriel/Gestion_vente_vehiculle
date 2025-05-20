const mysql = require("mysql2/promise");

// Pool de connexions MySQL
const connection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "gestion_pieces",
  multipleStatements: true,
});

// Fonction de création des tables
async function createTables() {
  const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      firstName VARCHAR(100),
      lastName VARCHAR(100),
      email VARCHAR(100) UNIQUE,
      password VARCHAR(255),
      role ENUM('admin', 'employee') DEFAULT 'employee',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    \-- User settings table
CREATE TABLE IF NOT EXISTS user\_settings (
id INT AUTO\_INCREMENT PRIMARY KEY,
user\_id INT NOT NULL,
dark\_mode BOOLEAN DEFAULT FALSE,
notifications\_enabled BOOLEAN DEFAULT TRUE,
font\_size ENUM('small', 'medium', 'large') DEFAULT 'medium',
language VARCHAR(10) DEFAULT 'fr',
dashboard\_layout ENUM('default', 'compact', 'extended') DEFAULT 'default',
timezone VARCHAR(50) DEFAULT 'Europe/Paris',
system\_alerts BOOLEAN DEFAULT TRUE,
update\_notifications BOOLEAN DEFAULT TRUE,
message\_notifications BOOLEAN DEFAULT TRUE,
email\_notifications BOOLEAN DEFAULT TRUE,
push\_notifications BOOLEAN DEFAULT TRUE,
sms\_notifications BOOLEAN DEFAULT FALSE,
developer\_mode BOOLEAN DEFAULT FALSE,
advanced\_stats BOOLEAN DEFAULT FALSE,
show\_tutorials BOOLEAN DEFAULT TRUE,
FOREIGN KEY (user\_id) REFERENCES users(id) ON DELETE CASCADE,
UNIQUE KEY (user\_id)
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
      status ENUM('disponible', 'indisponible') DEFAULT 'disponible',
      type ENUM('personnel', 'commercial') DEFAULT 'personnel',
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

  try {
    await connection.query(createTablesQuery);
    console.log("✅ Toutes les tables ont été créées avec succès.");
  } catch (err) {
    console.error("❌ Erreur lors de la création des tables :", err);
  }
}

createTables();

module.exports = connection;
