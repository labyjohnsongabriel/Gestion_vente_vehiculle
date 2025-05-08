            const User = require("../models/User"); // Assurez-vous que le chemin est correct
const bcrypt = require("bcryptjs");

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, password, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;

    if (password && newPassword) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Mot de passe actuel incorrect" });
      }
      user.password = await bcrypt.hash(newPassword, 12);
    }

    if (req.file) {
      user.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    await user.save();

    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    };

    res.json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
