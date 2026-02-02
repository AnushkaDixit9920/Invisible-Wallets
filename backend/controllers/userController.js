const User = require("../models/User");

// Create user
const createUser = async (req, res) => {
  try {
    const { walletAddress, name } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ message: "Wallet address required" });
    }

    const existingUser = await User.findOne({ walletAddress });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ walletAddress, name });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by wallet
const getUser = async (req, res) => {
  try {
    const user = await User.findOne({
      walletAddress: req.params.walletAddress,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createUser, getUser };