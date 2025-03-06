const jwt = require('jsonwebtoken')

const createAccessToken = async(data) => {
    const token = await jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '7d'
    })
    return token
}

const createRefreshToken = async(data) => {
    const token = await jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '30d'
    })
    return token
}

const verifyRefreshToken = async(token) => {
    try {
        const decoded = await jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
        return {
            valid: true,
            data: decoded
        }
    } catch (error) {
        return {
            valid: false,
            error: error.message
        }
    }
}

module.exports = {
    createAccessToken,
    createRefreshToken,
    verifyRefreshToken
}