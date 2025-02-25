const authenticateToken = require("./authenticateToken");

const systemMiddleware = async (req, res, next) => {
    authenticateToken(req, res, async () => {
        const allowedRoles = ['admin', 'seller'];
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied, only admin or seller allowed' });
        }
        const model = req.user.role === 'admin' ? adminModel : sellerModel;
        const user = await model.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        req.user = { id: user._id, role: user.role };
        next();
    });
};

module.exports = systemMiddleware;