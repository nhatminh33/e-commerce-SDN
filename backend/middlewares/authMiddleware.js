const jwt = require('jsonwebtoken');

const authMiddleware = async(req, res, next) =>{
    const accessToken = req.cookies.accessToken || req.headers['authorization']?.split(' ')[1];
    
    if (!accessToken) {
        return res.status(409).json({ error : 'Please Login First'})
    } else {
        try {
            const deCodeToken = await jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)
            req.role = deCodeToken.role
            req.id = deCodeToken.id
            next()            
        } catch (error) {
            return res.status(409).json({ error : 'Please Login'})
        }        
    }
}

module.exports = authMiddleware