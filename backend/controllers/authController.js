const adminModel = require('../models/adminModel');
const bcrpty = require('bcrypt');
const sellerModel = require('../models/sellerModel');
const sellerCustomerModel = require('../models/chat/sellerCustomerModel');
const { createToken } = require('../utiles/tokenCreate');
const cloudinaryService = require('../utiles/cloudinaryService');
const { responseReturn } = require('../utiles/response');

const admin_login = async (req, res) => {
    const { email, password } = req.body
    try {
        const admin = await adminModel.findOne({ email }).select('+password')
        // console.log(admin)
        if (admin) {
            const match = await bcrpty.compare(password, admin.password)
            // console.log(match)
            if (match) {
                const token = await createToken({
                    id: admin.id,
                    role: admin.role
                })
                res.cookie('accessToken', token, {
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                })
                responseReturn(res, 200, { token, message: "Login Success" })
            } else {
                responseReturn(res, 404, { error: "Password Wrong" })
            }




        } else {
            responseReturn(res, 404, { error: "Email not Found" })
        }

    } catch (error) {
        responseReturn(res, 500, { error: error.message })
    }

}


const seller_login = async (req, res) => {
    const { email, password } = req.body
    try {
        const seller = await sellerModel.findOne({ email }).select('+password')
        // console.log(admin)
        if (seller) {
            const match = await bcrpty.compare(password, seller.password)
            // console.log(match)
            if (match) {
                const token = await createToken({
                    id: seller.id,
                    role: seller.role
                })
                res.cookie('accessToken', token, {
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                })
                responseReturn(res, 200, { token, message: "Login Success" })
            } else {
                responseReturn(res, 404, { error: "Password Wrong" })
            }


        } else {
            responseReturn(res, 404, { error: "Email not Found" })
        }

    } catch (error) {
        responseReturn(res, 500, { error: error.message })
    }

}

const  logout = async (req, res) => {
    try {
        res.cookie('accessToken',null,{
            expires : new Date(Date.now()),
            httpOnly: true
        })
        responseReturn(res, 200,{ message : 'logout Success' })
    } catch (error) {
        responseReturn(res, 500,{ error : error.message })
    }
 }

const get_user = async (req, res) => {
    try {
        const { id, role } = req.body

        if (role === 'admin') {
            const admin = await adminModel.findById(id)
            if (!admin) return res.status(404).json({ message: 'User not found' })
            return res.status(200).json({ userInfo: admin })
        } else if (role === 'seller') {
            const seller = await sellerModel.findById(id)
            if (!seller) return res.status(404).json({ message: 'User not found' })
            return res.status(200).json({ userInfo: seller })
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const profile_image_upload = async (req, res) => {
    const { id } = req
    const form = formidable({ multiples: true })
    form.parse(req, async (err, _, files) => {
        const { image } = files

        try {
            const result = await cloudinaryService.uploader.upload(image.filepath, { folder: 'profile' })
            if (result) {
                await sellerModel.findByIdAndUpdate(id, {
                    image: result.url
                })
                const userInfo = await sellerModel.findById(id)
                responseReturn(res, 201, { message: 'Profile Image Upload Successfully', userInfo })
            } else {
                responseReturn(res, 404, { error: 'Image Upload Failed' })
            }

        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }


    })
}

module.exports = { seller_login, admin_login, logout, get_user, profile_image_upload };