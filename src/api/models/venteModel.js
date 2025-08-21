const db = require("../config/db");

const Vente = {
  // Récupérer toutes les ventes avec infos client et pièce
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT v.*, 
        p.name AS piece_nom, 
        c.name AS client_nom
      FROM ventes v
      LEFT JOIN pieces p ON v.piece_id = p.id
      LEFT JOIN clients c ON v.client_id = c.id
      ORDER BY v.date_vente DESC
    `);
    return rows;
  },

  // Récupérer une vente par ID
  getById: async (id) => {
    const [rows] = await db.query(
      `
      SELECT v.*, 
        p.name AS piece_nom, 
        c.name AS client_nom
      FROM ventes v
      LEFT JOIN pieces p ON v.piece_id = p.id
      LEFT JOIN clients c ON v.client_id = c.id
      WHERE v.id = ?
    `,
      [id]
    );
    return rows[0];
  },

  // Créer une vente
  create: async (data) => {
    const {
      piece_id,
      client_id,
      quantite,
      prix_unitaire,
      reduction = 0,
      notes = "",
      status = "completed",
    } = data;

    const prix_total = prix_unitaire * quantite - reduction;

    // Ajout explicite de date_vente (optionnel, sinon TIMESTAMP par défaut)
    const [result] = await db.query(
      `INSERT INTO ventes 
        (piece_id, client_id, quantite, prix_unitaire, reduction, prix_total, date_vente, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [
        piece_id,
        client_id,
        quantite,
        prix_unitaire,
        reduction,
        prix_total,
        status,
        notes,
      ]
    );

    return result.insertId;
  },

  // Mettre à jour une vente
  update: async (id, data) => {
    const {
      piece_id,
      client_id,
      quantite,
      prix_unitaire,
      reduction = 0,
      notes = "",
      status = "completed",
    } = data;
    const prix_total = prix_unitaire * quantite - reduction;
    const [result] = await db.query(
      `UPDATE ventes SET
        piece_id = ?,
        client_id = ?,
        quantite = ?,
        prix_unitaire = ?,
        reduction = ?,
        prix_total = ?,
        status = ?,
        notes = ?
      WHERE id = ?`,
      [
        piece_id,
        client_id,
        quantite,
        prix_unitaire,
        reduction,
        prix_total,
        status,
        notes,
        id,
      ]
    );
    return result.affectedRows > 0;
  },

  // Supprimer une vente
  delete: async (id) => {
    const [result] = await db.query("DELETE FROM ventes WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },

  // Compter les ventes
  count: async () => {
    const [rows] = await db.query("SELECT COUNT(*) AS count FROM ventes");
    return rows[0].count;
  },
};

module.exports = Vente;


{/**const db = require("../config/db");

const Vente = {
  // Récupérer toutes les ventes avec infos client et pièce
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT v.*, 
        p.name AS piece_nom, 
        c.name AS client_nom,
        c.email AS client_email
      FROM ventes v
      LEFT JOIN pieces p ON v.piece_id = p.id
      LEFT JOIN clients c ON v.client_id = c.id
      ORDER BY v.date_vente DESC
    `);
    return rows;
  },

  // Récupérer une vente par ID
  getById: async (id) => {
    const [rows] = await db.query(
      `
      SELECT v.*, 
        p.name AS piece_nom, 
        c.name AS client_nom,
        c.email AS client_email,
        c.telephone AS client_telephone
      FROM ventes v
      LEFT JOIN pieces p ON v.piece_id = p.id
      LEFT JOIN clients c ON v.client_id = c.id
      WHERE v.id = ?
    `,
      [id]
    );
    return rows[0];
  },

  // Créer une vente
  create: async (data) => {
    const {
      piece_id,
      client_id,
      quantite,
      prix_unitaire,
      reduction = 0,
      notes = "",
      status = "completed",
    } = data;

    const prix_total = prix_unitaire * quantite - reduction;

    const [result] = await db.query(
      `INSERT INTO ventes 
        (piece_id, client_id, quantite, prix_unitaire, reduction, prix_total, date_vente, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [
        piece_id,
        client_id,
        quantite,
        prix_unitaire,
        reduction,
        prix_total,
        status,
        notes,
      ]
    );

    // Mettre à jour le stock
    await db.query(`UPDATE pieces SET stock = stock - ? WHERE id = ?`, [
      quantite,
      piece_id,
    ]);

    return result.insertId;
  },

  // Mettre à jour une vente
  update: async (id, data) => {
    const {
      piece_id,
      client_id,
      quantite,
      prix_unitaire,
      reduction = 0,
      notes = "",
      status = "completed",
    } = data;

    const prix_total = prix_unitaire * quantite - reduction;

    const [result] = await db.query(
      `UPDATE ventes SET
        piece_id = ?,
        client_id = ?,
        quantite = ?,
        prix_unitaire = ?,
        reduction = ?,
        prix_total = ?,
        status = ?,
        notes = ?,
        date_modification = NOW()
      WHERE id = ?`,
      [
        piece_id,
        client_id,
        quantite,
        prix_unitaire,
        reduction,
        prix_total,
        status,
        notes,
        id,
      ]
    );

    return result.affectedRows > 0;
  },

  // Supprimer une vente
  delete: async (id) => {
    const [result] = await db.query("DELETE FROM ventes WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },

  // Compter toutes les ventes
  count: async () => {
    const [rows] = await db.query("SELECT COUNT(*) AS count FROM ventes");
    return rows[0].count;
  },

  // Compter les ventes du mois en cours
  countThisMonth: async () => {
    const [rows] = await db.query(`
      SELECT COUNT(*) AS count 
      FROM ventes 
      WHERE MONTH(date_vente) = MONTH(CURRENT_DATE()) 
      AND YEAR(date_vente) = YEAR(CURRENT_DATE())
    `);
    return rows[0].count;
  },

  // Compter les ventes du mois dernier
  countLastMonth: async () => {
    const [rows] = await db.query(`
      SELECT COUNT(*) AS count 
      FROM ventes 
      WHERE MONTH(date_vente) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH)) 
      AND YEAR(date_vente) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
    `);
    return rows[0].count;
  },

  // Chiffre d'affaires total
  chiffreAffaires: async () => {
    const [rows] = await db.query(`
      SELECT COALESCE(SUM(prix_total), 0) AS total 
      FROM ventes 
      WHERE status = 'completed'
    `);
    return rows[0].total;
  },

  // Statistiques mensuelles
  statsMensuelles: async (year = null) => {
    const query = `
      SELECT 
        YEAR(date_vente) AS annee,
        MONTH(date_vente) AS mois,
        COUNT(*) AS nombre_ventes,
        SUM(prix_total) AS chiffre_affaires,
        AVG(prix_total) AS moyenne_vente
      FROM ventes
      WHERE status = 'completed'
      ${year ? "AND YEAR(date_vente) = ?" : ""}
      GROUP BY YEAR(date_vente), MONTH(date_vente)
      ORDER BY annee DESC, mois DESC
    `;

    const [rows] = year ? await db.query(query, [year]) : await db.query(query);

    return rows;
  },

  // Statistiques par jour
  statsParJour: async (days = 30) => {
    const [rows] = await db.query(
      `
      SELECT 
        DATE(date_vente) AS date,
        COUNT(*) AS nombre_ventes,
        SUM(prix_total) AS chiffre_affaires
      FROM ventes
      WHERE date_vente >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY)
      AND status = 'completed'
      GROUP BY DATE(date_vente)
      ORDER BY date DESC
    `,
      [days]
    );

    return rows;
  },

  // Top pièces vendues
  topPieces: async (limit = 10) => {
    const [rows] = await db.query(
      `
      SELECT 
        p.name AS piece_nom,
        COUNT(v.id) AS nombre_ventes,
        SUM(v.quantite) AS quantite_vendue,
        SUM(v.prix_total) AS chiffre_affaires
      FROM ventes v
      LEFT JOIN pieces p ON v.piece_id = p.id
      WHERE v.status = 'completed'
      GROUP BY v.piece_id, p.name
      ORDER BY chiffre_affaires DESC
      LIMIT ?
    `,
      [limit]
    );

    return rows;
  },

  // Top clients
  topClients: async (limit = 10) => {
    const [rows] = await db.query(
      `
      SELECT 
        c.name AS client_nom,
        c.email AS client_email,
        COUNT(v.id) AS nombre_achats,
        SUM(v.prix_total) AS montant_total
      FROM ventes v
      LEFT JOIN clients c ON v.client_id = c.id
      WHERE v.status = 'completed'
      GROUP BY v.client_id, c.name, c.email
      ORDER BY montant_total DESC
      LIMIT ?
    `,
      [limit]
    );

    return rows;
  },
};

module.exports = Vente;
 */}