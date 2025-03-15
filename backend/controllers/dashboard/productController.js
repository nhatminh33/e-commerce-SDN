const { formidable } = require('formidable');
import { get_product } from './../../../dashboard/src/store/Reducers/productReducer';
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
        const { 
            page: pageInput, 
            searchValue, 
            perPage: perPageInput,
            categoryId,
            minPrice,
            maxPrice,
            minDiscount,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.body || {};

        const page = Math.max(1, Number(pageInput) || 1);
        const perPage = Math.max(1, Number(perPageInput) || 10);
        const skipPage = (page - 1) * perPage;

        // Xây dựng query filter
        let query = {};

        // Tìm kiếm theo tên
        if (searchValue) {
            query.name = { $regex: searchValue, $options: 'i' };
        }

        // Lọc theo danh mục
        if (categoryId) {
            query.categoryId = categoryId;
        }


        // Lọc theo khoảng giá
        if (minPrice !== undefined || maxPrice !== undefined) {
            query.price = {};
            if (minPrice !== undefined) {
                query.price.$gte = Number(minPrice);
            }
            if (maxPrice !== undefined) {
                query.price.$lte = Number(maxPrice);
            }
        }

        // Lọc theo giảm giá tối thiểu
        if (minDiscount !== undefined) {
            query.discount = { $gte: Number(minDiscount) };
        }

        // Xác định thứ tự sắp xếp
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const [products, totalProduts] = await Promise.all([
            productModel
                .find(query)
                .populate('categoryId')
                .skip(skipPage)
                .limit(perPage)
                .sort(sort)
                .lean(),
            productModel.countDocuments(query)
        ]);

        const pages = Math.ceil(totalProduts / perPage);

        responseReturn(res, 200, { 
            products, 
            totalProduts, 
            pages,
            currentPage: page,
            perPage
        });
    } catch (error) {
        console.error('Get products error:', error);
        responseReturn(res, 500, { error: `Failed to retrieve products: ${error.message}` });
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

const seller_manage_products = async (req, res) => {
    try {
        const sellerId = req.id;
        const { page = 1, perPage = 10, searchValue = '', categoryId = '', sortBy = ['createdAt'], sortOrder = 'desc' } = req.query;
        console.log("sellerId", req.id);
    
        // Xây dựng query tìm kiếm
        const query = { sellerId };

        // Tìm kiếm theo tên sản phẩm
        if (searchValue) {
            query.name = { $regex: searchValue, $options: 'i' };
        }

        // Lọc theo danh mục
        if (categoryId) {
            query.categoryId = categoryId;
        }

        // Tính toán phân trang
        const skip = (parseInt(page) - 1) * parseInt(perPage);
        const limit = parseInt(perPage);

        // Lấy danh sách sản phẩm
        let products = await productModel.find(query)
            .populate('categoryId')
            .skip(skip)
            .limit(limit)
            .lean();

        // Đếm tổng số sản phẩm thỏa mãn điều kiện
        const totalProducts = await productModel.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        // Lấy thông tin doanh thu từ mỗi sản phẩm
        const orderInfo = await Promise.all(products.map(async (product) => {
            // Tính tổng doanh thu từ các đơn hàng đã hoàn thành
            const orders = await require('../../models/orderModel').find({
                'products.productId': product._id,
                'delivery_status': 'delivered',
                'payment_status': 'paid'
            });

            // Tính tổng doanh thu
            let totalRevenue = 0;
            orders.forEach(order => {
                order.products.forEach(item => {
                    if (item.productId.toString() === product._id.toString()) {
                        totalRevenue += item.subTotal;
                    }
                });
            });

            return {
                productId: product._id,
                totalRevenue
            };
        }));

        // Kết hợp thông tin doanh thu vào sản phẩm
        products = products.map(product => {
            const revenue = orderInfo.find(item => item.productId.toString() === product._id.toString());
            return {
                ...product,
                totalRevenue: revenue ? revenue.totalRevenue : 0
            };
        });

        // Xử lý sortBy là một mảng
        const sortByArray = Array.isArray(sortBy) ? sortBy : [sortBy];
        const sortOrderValue = sortOrder === 'asc' ? 1 : -1;

        // Sắp xếp theo nhiều tiêu chí
        products.sort((a, b) => {
            // Xử lý từng tiêu chí sắp xếp theo thứ tự ưu tiên
            for (const criterion of sortByArray) {
                let compareResult = 0;
                
                switch (criterion) {
                    case 'totalRevenue':
                        compareResult = (a.totalRevenue - b.totalRevenue) * sortOrderValue;
                        break;
                    case 'discount':
                        compareResult = (a.discount - b.discount) * sortOrderValue;
                        break;
                    case 'stock':
                        compareResult = (a.stock - b.stock) * sortOrderValue;
                        break;
                    case 'rating':
                        compareResult = (a.rating - b.rating) * sortOrderValue;
                        break;
                    case 'price':
                        compareResult = (a.price - b.price) * sortOrderValue;
                        break;
                    case 'createdAt':
                        compareResult = (new Date(a.createdAt) - new Date(b.createdAt)) * sortOrderValue;
                        break;
                }
                
                // Nếu có sự khác biệt theo tiêu chí này, trả về kết quả và không xét tiêu chí tiếp theo
                if (compareResult !== 0) {
                    return compareResult;
                }
            }
            
            // Nếu tất cả các tiêu chí đều bằng nhau, giữ nguyên vị trí
            return 0;
        });

        responseReturn(res, 200, {
            products,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalProducts,
                perPage: parseInt(perPage)
            }
        });
    } catch (error) {
        console.error('Seller manage products error:', error);
        responseReturn(res, 500, { error: error.message });
    }
};

module.exports = { add_product, get_products, get_product, update_product, update_product_image, delete_product, seller_manage_products }