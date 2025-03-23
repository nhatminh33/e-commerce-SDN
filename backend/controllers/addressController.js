const addressModel = require('../models/addressModel');
const { responseReturn } = require('../utiles/response');

// Get all addresses for a user
const get_addresses = async (req, res) => {
    try {
        const addresses = await addressModel.find({ userId: req.id });
        return responseReturn(res, 200, { addresses });
    } catch (error) {
        return responseReturn(res, 500, { error: error.message });
    }
};

// Add new address
const add_address = async (req, res) => {
    const { 
        receiverName,
        phoneNumber,
        province,
        district,
        ward,
        streetAddress,
        isDefault
    } = req.body;

    try {
        console.log('receiverName,phoneNumber,province,district,ward,streetAddress', receiverName,phoneNumber,province,district,ward,streetAddress);
        
        // Validate required fields
        if (!receiverName || !phoneNumber || !province || !district || !ward || !streetAddress) {
            return responseReturn(res, 400, { error: "All fields are required!" });
        }

        // Validate phone number
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return responseReturn(res, 400, { 
                error: "Invalid phone number! Phone number must be 10 digits." 
            });
        }

        // Create new address
        const address = await addressModel.create({
            userId: req.id,
            receiverName,
            phoneNumber,
            province,
            district,
            ward,
            streetAddress,
            isDefault: isDefault || false
        });

        return responseReturn(res, 201, { 
            message: "Address added successfully",
            address 
        });
    } catch (error) {
        return responseReturn(res, 500, { error: error.message });
    }
};

// Update address
const update_address = async (req, res) => {
    const { addressId } = req.params;
    const updateData = req.body;

    try {
        // Check if address exists and belongs to user
        const address = await addressModel.findOne({ 
            _id: addressId,
            userId: req.id 
        });

        if (!address) {
            return responseReturn(res, 404, { error: "Address not found" });
        }

        // Validate phone number if provided
        if (updateData.phoneNumber) {
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(updateData.phoneNumber)) {
                return responseReturn(res, 400, { 
                    error: "Invalid phone number! Phone number must be 10 digits." 
                });
            }
        }

        // Update address
        const updatedAddress = await addressModel.findByIdAndUpdate(
            addressId,
            updateData,
            { new: true }
        );

        return responseReturn(res, 200, { 
            message: "Address updated successfully",
            address: updatedAddress 
        });
    } catch (error) {
        return responseReturn(res, 500, { error: error.message });
    }
};

// Delete address
const delete_address = async (req, res) => {
    const { addressId } = req.params;

    try {
        // Check if address exists and belongs to user
        const address = await addressModel.findOne({ 
            _id: addressId,
            userId: req.id 
        });

        if (!address) {
            return responseReturn(res, 404, { error: "Address not found" });
        }

        await addressModel.findByIdAndDelete(addressId);

        return responseReturn(res, 200, { message: "Address deleted successfully" });
    } catch (error) {
        return responseReturn(res, 500, { error: error.message });
    }
};

// Set default address
const set_default_address = async (req, res) => {
    const { addressId } = req.params;

    try {
        // Check if address exists and belongs to user
        const address = await addressModel.findOne({ 
            _id: addressId,
            userId: req.id 
        });

        if (!address) {
            return responseReturn(res, 404, { error: "Address not found" });
        }

        // Remove default from all other addresses
        await addressModel.updateMany(
            { userId: req.id },
            { isDefault: false }
        );

        // Set new default address
        const updatedAddress = await addressModel.findByIdAndUpdate(
            addressId,
            { isDefault: true },
            { new: true }
        );

        return responseReturn(res, 200, { 
            message: "Default address updated successfully",
            address: updatedAddress 
        });
    } catch (error) {
        return responseReturn(res, 500, { error: error.message });
    }
};

module.exports = {
    get_addresses,
    add_address,
    update_address,
    delete_address,
    set_default_address
}; 