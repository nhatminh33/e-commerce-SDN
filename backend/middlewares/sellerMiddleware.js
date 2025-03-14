const authenticateToken = require("./authenticateToken");
const userModel = require("../models/userModel");

const sellerMiddleware = async (req, res, next) => {
  authenticateToken(req, res, async () => {
    if (req.role !== 'seller') {
      return res.status(403).json({ message: 'Access denied, only seller allowed' });
    }

    const user = await userModel.findById(req.id).select("id role");
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    next();
  });
};

module.exports = sellerMiddleware;
