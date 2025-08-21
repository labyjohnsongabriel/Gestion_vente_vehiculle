-- Table des clients
CREATE TABLE clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(150),
  telephone VARCHAR(30),
  adresse VARCHAR(255)
);

-- Table des pièces (produits)
CREATE TABLE pieces (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reference VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT DEFAULT 0,
  categorie VARCHAR(100),
  fournisseur VARCHAR(100),
  image VARCHAR(255)
);

-- Table des ventes
CREATE TABLE ventes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  piece_id INT NOT NULL,
  client_id INT NOT NULL,
  quantite INT NOT NULL,
  prix_unitaire DECIMAL(10,2) NOT NULL,
  reduction DECIMAL(10,2) DEFAULT 0,
  prix_total DECIMAL(10,2) NOT NULL,
  date_vente TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'completed', 'cancelled') DEFAULT 'completed',
  notes TEXT,
  CONSTRAINT fk_ventes_piece 
      FOREIGN KEY (piece_id) REFERENCES pieces(id) ON DELETE CASCADE,
  CONSTRAINT fk_ventes_client 
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Table des commandes (si besoin)
CREATE TABLE commandes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  date_commande DATE NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Table des factures (si besoin)
CREATE TABLE factures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  commande_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  date_facture DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'issued',
  FOREIGN KEY (commande_id) REFERENCES commandes(id)
);
