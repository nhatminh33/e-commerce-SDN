const { formidable } = require('formidable');
const { responseReturn } = require("../../utiles/response");
const cloudinaryService = require('../../utiles/cloudinaryService');
const productModel = require('../../models/productModel');

const add_product = async (req, res) => {
    const { sellerId } = req.params;
    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return responseReturn(res, 400, { error: err.message });
        }

        let { name, categoryId, description, stock, price, discount } = fields;
        let { images } = files;
        name = name[0].trim()
        const slug = name.split(' ').join('-').toLowerCase();

        try {
            let allImageUrl = [];

            if (!Array.isArray(images)) {
                images = [images];
            }

            for (let i = 0; i < images.length; i++) {
                const result = await cloudinaryService.uploader.upload(images[i].filepath, { folder: 'products' });
                allImageUrl.push(result.url);
            }

            await productModel.create({
                sellerId,
                name,
                slug,
                categoryId,
                description: description[0].trim(),
                stock: parseInt(stock),
                price: parseInt(price),
                discount: parseInt(discount),
                images: allImageUrl,
            })
            responseReturn(res, 201, { message: 'Product added successfully' })
        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    });
}

const get_products = async (req, res) => {
    try {
        const { page: pageInput, searchValue, perPage: perPageInput } = req.body || {};

        const page = Math.max(1, Number(pageInput) || 1);
        const perPage = Math.max(1, Number(perPageInput) || 10);
        const skipPage = (page - 1) * perPage;

        const query = searchValue
            ? { name: { $regex: searchValue, $options: 'i' } }
            : {};

        const [products, totalProduts] = await Promise.all([
            productModel
                .find(query)
                .populate('categoryId')
                .skip(skipPage)
                .limit(perPage)
                .sort({ createdAt: -1 })
                .lean(),
            productModel.countDocuments(query)
        ]);

        const pages = Math.ceil(totalProduts / perPage);

        responseReturn(res, 200, { products, totalProduts, pages });
    } catch (error) {
        console.error('Get categories error:', error);
        responseReturn(res, 500, { error: `Failed to retrieve categories: ${error.message}` });
    }
};

const get_product = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productModel.findById(id).populate('categoryId')
        responseReturn(res, 200, { product })
    } catch (error) {
        responseReturn(res, 500, { error: error.message });
    }
}

const update_product = async (req, res) => {
    const { id } = req.params;
    let { name, description, stock, price, discount, brand, sellerId } = req.body;
    
    name = name.trim()
    const slug = name.split(' ').join('-')

    try {
        await productModel.findByIdAndUpdate(id, {
            name, description, stock, price, discount, brand, slug, sellerId
        })
        const product = await productModel.findById(id)
        responseReturn(res, 200, { product, message: 'Product Updated Successfully' })
    } catch (error) {
        responseReturn(res, 500, { error: error.message })
    }
}

const update_product_image = async (req, res) => {
    const { id } = req.params;
    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return responseReturn(res, 400, { error: err.message });
        }

        const productData = await productModel.findById(id)

        if (!productData) {
            return responseReturn(res, 404, { error: 'Product not found' });
        }

        let { images } = files;

        try {
            let allImageUrl = [];

            if (!Array.isArray(images)) {
                images = [images];
            }

            for (let i = 0; i < images.length; i++) {
                const result = await cloudinaryService.uploader.upload(images[i].filepath, { folder: 'products' });

                if (!result) {
                    return responseReturn(res, 500, { error: 'Image upload failed' });
                }

                allImageUrl.push(result.url);
            }

            productData.images.map(async image => {
                const publicId = image.split('/').pop().split('.')[0];
                await cloudinaryService.uploader.destroy(`products/${publicId}`);
            })

            await productModel.findByIdAndUpdate(id, {
                images: allImageUrl,
            })
            responseReturn(res, 201, { message: 'Product updated successfully' })
        } catch (error) {
            responseReturn(res, 500, { product, error: error.message })
        }
    });
}

const delete_product = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await productModel.findByIdAndDelete(id);
        if (!product) {
            return responseReturn(res, 404, { error: 'Product not found' });
        }
        responseReturn(res, 200, { message: 'Product deleted successfully' });
    } catch (error) {
        responseReturn(res, 500, { error: error.message });
    }
}

module.exports = { add_product, get_products, get_product, update_product, update_product_image, delete_product }