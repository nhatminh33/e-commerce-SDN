
const authenticateToken = require("./authenticateToken");
const userModel = require("../models/userModel");

const   systemMiddleware = async (req, res, next) => {
    authenticateToken(req, res, async () => {
        try {
            const allowedRoles = ["admin", "seller"];
            if (!allowedRoles.includes(req.role)) {
                return res.status(403).json({ message: "Access denied, only admin or seller allowed" });
            }

            const user = await userModel.findById(req.id).select("_id role");
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            next();
        } catch (error) {
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    });
};

module.exports = systemMiddleware;
