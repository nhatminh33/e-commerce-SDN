const { formidable } = require('formidable');
const { responseReturn } = require('../utiles/response');
const cloudinaryService = require('../utiles/cloudinaryService');
const productModel = require('../models/productModel');
const bannerModel = require('../models/bannerModel');

const add_banner = async (req, res) => {
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return responseReturn(res, 400, { error: err.message });
        }

        let { productId, link } = fields;
        let { banner } = files;
        productId = productId[0];
        link = link[0];
        banner = banner[0];

        if (!banner) {
            return responseReturn(res, 400, { error: 'Banner image is required' });
        }

        try {
            // Check if product exists
            const productExists = await productModel.findById(productId);
            if (!productExists) {
                return responseReturn(res, 400, { error: 'Product does not exist' });
            }

            // Upload banner image to Cloudinary
            const result = await cloudinaryService.uploader.upload(banner.filepath, { folder: 'banners' });

            if (!result) {
                return responseReturn(res, 500, { error: 'Image upload failed' });
            }

            const newBanner = await bannerModel.create({
                productId,
                banner: result.url,
                link
            });

            responseReturn(res, 201, { message: 'Banner added successfully', banner: newBanner });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    });
};

const get_banners = async (req, res) => {
    try {
        const { page: pageInput, searchValue, perPage: perPageInput } = req.body || {};

        const page = Math.max(1, Number(pageInput) || 1);
        const perPage = Math.max(1, Number(perPageInput) || 10);
        const skipPage = (page - 1) * perPage;

        const query = searchValue
            ? { link: { $regex: searchValue, $options: 'i' } }
            : {};

        const [banners, total] = await Promise.all([
            bannerModel
                .find(query)
                .populate('productId', 'name')
                .skip(skipPage)
                .limit(perPage)
                .sort({ createdAt: -1 })
                .lean(),
            bannerModel.countDocuments(query)
        ]);

        const pages = Math.ceil(total / perPage);

        responseReturn(res, 200, { banners, total, pages });
    } catch (error) {
        console.error('Get banners error:', error);
        responseReturn(res, 500, { error: `Failed to retrieve banners: ${error.message}` });
    }
};

const get_banner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await bannerModel.findById(id).populate('productId', 'name');
        if (!banner) {
            return responseReturn(res, 404, { error: 'Banner not found' });
        }
        responseReturn(res, 200, { banner });
    } catch (error) {
        responseReturn(res, 500, { error: error.message });
    }
};

const update_banner = async (req, res) => {
    const { id } = req.params;
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return responseReturn(res, 400, { error: err.message });
        }

        let { productId, link } = fields;
        let { banner } = files;

        productId = productId[0];
        link = link[0];
        banner = banner[0];

        try {
            const existingBanner = await bannerModel.findById(id);
            if (!existingBanner) {
                return responseReturn(res, 404, { error: 'Banner not found' });
            }

            if (productId) {
                const productExists = await productModel.findById(productId);
                if (!productExists) {
                    return responseReturn(res, 400, { error: 'Product does not exist' });
                }
            }

            let imageUrl = existingBanner.banner;
            if (banner) {
                // Delete old image
                const publicId = existingBanner.banner.split('/').pop().split('.')[0];
                await cloudinaryService.uploader.destroy(`banners/${publicId}`);

                // Upload new banner image
                const result = await cloudinaryService.uploader.upload(banner.filepath, { folder: 'banners' });

                if (!result) {
                    return responseReturn(res, 500, { error: 'Image upload failed' });
                }

                imageUrl = result.url;
            }

            existingBanner.productId = productId || existingBanner.productId;
            existingBanner.banner = imageUrl;
            existingBanner.link = link || existingBanner.link;

            await existingBanner.save();
            responseReturn(res, 200, { message: 'Banner updated successfully', banner: existingBanner });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    });
};

const delete_banner = async (req, res) => {
    const { id } = req.params;
    try {
        const banner = await bannerModel.findByIdAndDelete(id);

        if (!banner) {
            return responseReturn(res, 404, { error: 'Banner not found' });
        }

        // Delete banner image from Cloudinary
        const publicId = banner.banner.split('/').pop().split('.')[0];
        await cloudinaryService.uploader.destroy(`banners/${publicId}`);

        responseReturn(res, 200, { message: 'Banner deleted successfully' });
    } catch (error) {
        responseReturn(res, 500, { error: error.message });
    }
};

module.exports = { add_banner, get_banners, get_banner, update_banner, delete_banner };
