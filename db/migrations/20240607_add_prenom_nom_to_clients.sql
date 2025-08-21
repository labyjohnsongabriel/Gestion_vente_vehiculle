-- Ajouter les champs prenom et nom, migrer les données existantes, puis supprimer le champ name

ALTER TABLE clients
  ADD COLUMN prenom VARCHAR(100) NOT NULL AFTER id,
  ADD COLUMN nom VARCHAR(100) NOT NULL AFTER prenom;

-- Si des données existent déjà, migrer le champ name vers prenom et nom (exemple simple, à adapter si besoin)
UPDATE clients SET prenom = SUBSTRING_INDEX(name, ' ', 1), nom = TRIM(SUBSTRING(name, LENGTH(SUBSTRING_INDEX(name, ' ', 1)) + 2));

ALTER TABLE clients DROP COLUMN name;
