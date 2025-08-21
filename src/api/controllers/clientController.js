const db = require("../config/db");
const path = require("path");
const fs = require("fs");

// ✅ Récupérer tous les clients
exports.getAllClients = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, phone, address, status, image, createdAt, updatedAt FROM clients"
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("[getAllClients] Erreur:", err.message);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la récupération des clients." });
  }
};

// ✅ Récupérer un client par ID
exports.getClientById = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, phone, address, status, image, createdAt, updatedAt FROM clients WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Client non trouvé." });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("[getClientById] Erreur:", err.message);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la récupération du client." });
  }
};

// ✅ Créer un nouveau client
exports.createClient = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: "Requête invalide : corps manquant" });
  }

  // Ce log doit apparaître dans la console backend à chaque création
  console.log("Reçu pour création client:", req.body);

  const {
    name,
    email,
    phone,
    address,
    status = "active",
    image = null,
  } = req.body;

  if (!name || !email || !phone || !address) {
    return res.status(400).json({ error: "Champs requis manquants" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO clients (name, email, phone, address, status, image) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, phone, address, status, image]
    );
    res.status(201).json({
      message: "Client créé avec succès.",
      client: {
        id: result.insertId,
        name,
        email,
        phone,
        address,
        status,
        image,
      },
    });
  } catch (err) {
    console.error("[createClient] Erreur:", err.message);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la création du client." });
  }
};

// ✅ Mettre à jour un client
exports.updateClient = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: "Requête invalide : corps manquant" });
  }

  const { name, email, phone, address, status, image } = req.body;

  const fields = [];
  const values = [];

  if (name !== undefined) {
    fields.push("name = ?");
    values.push(name);
  }
  if (email !== undefined) {
    fields.push("email = ?");
    values.push(email);
  }
  if (phone !== undefined) {
    fields.push("phone = ?");
    values.push(phone);
  }
  if (address !== undefined) {
    fields.push("address = ?");
    values.push(address);
  }
  if (status !== undefined) {
    fields.push("status = ?");
    values.push(status);
  }
  if (
    image !== undefined &&
    image !== null &&
    typeof image === "string" &&
    image.trim() !== ""
  ) {
    fields.push("image = ?");
    values.push(image);
  }

  // Si aucun champ à mettre à jour, retourner une erreur
  if (fields.length === 0) {
    return res.status(400).json({ error: "Aucune donnée à mettre à jour" });
  }

  // Ajoutez updatedAt à la fin, sans virgule superflue
  fields.push("updatedAt = NOW()");
  const sql = `UPDATE clients SET ${fields.join(", ")} WHERE id = ?`;
  values.push(req.params.id);

  try {
    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Client non trouvé." });
    }

    res.status(200).json({ message: "Client mis à jour avec succès." });
  } catch (err) {
    console.error("[updateClient] Erreur:", err.message, sql, values);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la mise à jour du client." });
  }
};

// ✅ Supprimer un client
exports.deleteClient = async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM clients WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Client non trouvé." });
    }

    res.status(200).json({ message: "Client supprimé avec succès." });
  } catch (err) {
    console.error("[deleteClient] Erreur:", err.message);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la suppression du client." });
  }
};

// ✅ Compter les clients
exports.getClientCount = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT COUNT(*) AS count FROM clients");
    res.status(200).json({ count: rows[0].count });
  } catch (err) {
    console.error("[getClientCount] Erreur :", err.message);
    res
      .status(500)
      .json({ error: "Erreur serveur lors du comptage des clients." });
  }
};

// ✅ Upload d'image pour un client
exports.uploadClientImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier envoyé." });
  }
  const clientId = req.params.id;
  const imagePath = `/uploads/clients/${req.file.filename}`;
  try {
    // Met à jour le champ image du client dans la base
    const [result] = await db.query(
      "UPDATE clients SET image = ?, updatedAt = NOW() WHERE id = ?",
      [imagePath, clientId]
    );
    if (result.affectedRows === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: "Client non trouvé." });
    }
    res.status(200).json({ message: "Image uploadée", image: imagePath });
  } catch (err) {
    console.error("[uploadClientImage] Erreur:", err.message);
    res.status(500).json({ error: "Erreur lors de l'upload de l'image." });
  }
};
