const db = require("../config/db");

// ✅ Récupérer tous les clients
exports.getAllClients = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, phone, address FROM clients"
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
      "SELECT id, name, email, phone, address FROM clients WHERE id = ?",
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
  const { name, email, phone, address } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Le nom et l'e-mail sont requis." });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO clients (name, email, phone, address) VALUES (?, ?, ?, ?)",
      [name, email, phone, address]
    );
    res.status(201).json({
      message: "Client créé avec succès.",
      client: { id: result.insertId, name, email, phone, address },
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
  const { name, email, phone, address } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Le nom et l'e-mail sont requis." });
  }

  try {
    const [result] = await db.query(
      "UPDATE clients SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?",
      [name, email, phone, address, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Client non trouvé." });
    }

    res.status(200).json({ message: "Client mis à jour avec succès." });
  } catch (err) {
    console.error("[updateClient] Erreur:", err.message);
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
    console.log("[getClientCount] Résultat de la requête :", rows);

    const count = rows[0].count;

    if (count === 0) {
      return res.status(404).json({ message: "Aucun client trouvé." });
    }

    return res.status(200).json({ count });
  } catch (err) {
    console.error("[getClientCount] Erreur:", err.message);
    return res.status(500).json({
      error: "Erreur serveur lors du comptage des clients.",
    });
  }
};
