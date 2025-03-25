const { formidable } = require('formidable');
const { responseReturn } = require("../../utiles/response");
const cloudinaryService = require('../../utiles/cloudinaryService');
const productModel = require('../../models/productModel');
const categoryModel = require('../../models/categoryModel');

const add_product = async (req, res) => {
    const { sellerId } = req.params;
    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return responseReturn(res, 400, { error: err.message });
        }

        let { name, categoryId, description, stock, price, discount, costPrice } = fields;
        let { images } = files;
        
        // Validate fields
        if (!name || !name[0]) {
            return responseReturn(res, 400, { error: 'Product name is required' });
        }
        
        if (!categoryId || !categoryId[0]) {
            return responseReturn(res, 400, { error: 'Category is required' });
        }
        
        if (!stock || isNaN(parseInt(stock))) {
            return responseReturn(res, 400, { error: 'Invalid stock value' });
        }
        
        if (!price || isNaN(parseInt(price))) {
            return responseReturn(res, 400, { error: 'Invalid price value' });
        }
        
        if (!description || !description[0]) {
            return responseReturn(res, 400, { error: 'Product description is required' });
        }

        if (!images || !Array.isArray(images) && !images.filepath) {
            return responseReturn(res, 400, { error: 'Product images are required' });
        }

        name = name[0].trim();
        const slug = name.split(' ').join('-').toLowerCase();

        try {
            // Check if category exists
            const category = await categoryModel.findById(categoryId[0]);
            if (!category) {
                return responseReturn(res, 404, { error: 'Category not found' });
            }

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
                categoryId: categoryId[0],
                description: description[0].trim(),
                stock: parseInt(stock),
                price: parseInt(price),
                discount: parseInt(discount) || 0,
                costPrice: parseInt(costPrice) || 0,
                images: allImageUrl,
            });
            responseReturn(res, 201, { message: 'Product added successfully' });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    });
};

const get_products = async (req, res) => {
    try {
        const { 
            page = 1, 
            searchValue = '', 
            perPage = 10, 
            sellerId = '',
            categoryId = '',
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = req.query || {};
        console.log('req.query', req.query);
        

        const pageNumber = Math.max(1, Number(page));
        const itemsPerPage = Math.max(1, Number(perPage));
        const skipItems = (pageNumber - 1) * itemsPerPage;

        // Build query filter
        let query = {};
        
        // Search by name
        if (searchValue) {
            query.name = { $regex: searchValue, $options: 'i' };
        }

        // Filter by seller
        if (sellerId) {
            query.sellerId = sellerId;
        }

        // Filter by category
        if (categoryId) {
            query.categoryId = categoryId;
        }


        // Determine sort order
        const sort = {};
        
        // Support sorting by multiple fields
        const sortFields = Array.isArray(sortBy) ? sortBy : [sortBy];
        const sortDirections = Array.isArray(sortOrder) ? sortOrder : [sortOrder];
        
        sortFields.forEach((field, index) => {
            const direction = sortDirections[index] || sortDirections[0];
            sort[field] = direction === 'asc' ? 1 : -1;
        });

        const [products, totalProduts] = await Promise.all([
            productModel
                .find(query)
                .populate('categoryId')
                .skip(skipItems)
                .limit(itemsPerPage)
                .sort(sort)
                .lean(),
            productModel.countDocuments(query)
        ]);

        const pages = Math.ceil(totalProduts / itemsPerPage);

        responseReturn(res, 200, { 
            products, 
            totalProduts, 
            pages,
            currentPage: pageNumber,
            perPage: itemsPerPage
        });
    } catch (error) {
        console.error('Get products error:', error);
        responseReturn(res, 500, { error: `Failed to retrieve products: ${error.message}` });
    }
};

const get_product = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productModel.findById(id).populate('categoryId').populate('sellerId', 'name email image');
        
        if (!product) {
            return responseReturn(res, 404, { error: 'Product not found' });
        }
        
        responseReturn(res, 200, { product });
    } catch (error) {
        responseReturn(res, 500, { error: error.message });
    }
};

const update_product = async (req, res) => {
    try {
        const { productId, name, description, stock, price, discount, categoryId, sellerId, costPrice } = req.body;
        
        if (!productId) {
            return responseReturn(res, 400, { error: 'Product ID is required' });
        }

        // Find the product
        const product = await productModel.findById(productId);
        
        if (!product) {
            return responseReturn(res, 404, { error: 'Product not found' });
        }
        
        // Check access rights (only product seller can update)
        if (product.sellerId.toString() !== sellerId) {
            return responseReturn(res, 403, { error: 'You do not have permission to update this product' });
        }

        const slug = name.trim().split(' ').join('-').toLowerCase();

        // Update product
        await productModel.findByIdAndUpdate(productId, {
            name: name.trim(),
            description,
            stock,
            price,
            discount: discount || 0,
            slug,
            categoryId,
            costPrice: costPrice || 0
        });

        const updatedProduct = await productModel.findById(productId).populate('categoryId');
        responseReturn(res, 200, { product: updatedProduct, message: 'Product updated successfully' });
    } catch (error) {
        responseReturn(res, 500, { error: error.message });
    }
};

const product_image_update = async(req,res) => {
    const form = formidable({ 
        multiples: false,
    });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return responseReturn(res, 400, { error: err.message });
        }

        const {oldImage, productId} = fields;
        const newImage = files.newImage;

        
        if (!oldImage || !oldImage[0]) {
            return responseReturn(res, 400, { error: 'Old image URL is required' });
        }

        if (!productId || !productId[0]) {
            return responseReturn(res, 400, { error: 'Product ID is required' });
        }

        if (!newImage || !newImage[0]) {
            return responseReturn(res, 400, { error: 'New image file is required' });
        }

        try {
            const result = await cloudinaryService.uploader.upload(newImage[0].filepath, { 
                folder: 'products',
            });

            if (result) {
                const product = await productModel.findById(productId[0]);
                if (!product) {
                    return responseReturn(res, 404, { error: 'Product not found' });
                }

                // Find and replace old image URL with new one
                const index = product.images.findIndex(img => img === oldImage[0]);
                if (index === -1) {
                    return responseReturn(res, 400, { error: 'Old image not found in product images' });
                }

                // Update the image URL
                product.images[index] = result.url;
                await product.save();

                responseReturn(res, 200, {
                    product,
                    message: 'Product Image Updated Successfully'
                });
            }
        } catch (error) {
            console.error('Image update error:', error);
            responseReturn(res, 500, { error: error.message });
        }
    });
}

const delete_product = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await productModel.findById(id);
        
        if (!product) {
            return responseReturn(res, 404, { error: 'Product not found' });
        }

        // Delete all images from Cloudinary
        try {
            for (const image of product.images) {
                const publicId = image.split('/').pop().split('.')[0];
                await cloudinaryService.uploader.destroy(`products/${publicId}`);
            }
        } catch (error) {
            console.error('Error deleting images:', error);
            // Continue even if there's an error deleting images
        }

        await productModel.findByIdAndDelete(id);
        responseReturn(res, 200, { message: 'Product deleted successfully', productId: id });
    } catch (error) {
        responseReturn(res, 500, { error: error.message });
    }
};

const seller_manage_products = async (req, res) => {
    try {
        const sellerId = req.id;
        const { page = 1, perPage = 10, searchValue = '', categoryId = '', sortBy = ['createdAt'], sortOrder = 'desc' } = req.query;
    
        // Build search query
        const query = { sellerId };

        // Search by product name
        if (searchValue) {
            query.name = { $regex: searchValue, $options: 'i' };
        }

        // Filter by category
        if (categoryId) {
            query.categoryId = categoryId;
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(perPage);
        const limit = parseInt(perPage);

        // Get product list
        let products = await productModel.find(query)
            .populate('categoryId')
            .skip(skip)
            .limit(limit)
            .lean();

        // Count total products matching criteria
        const totalProducts = await productModel.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        // Get revenue information for each product
        const orderInfo = await Promise.all(products.map(async (product) => {
            // Calculate total revenue from completed orders
            const orders = await require('../../models/orderModel').find({
                'products.productId': product._id,
                'delivery_status': 'delivered',
                'payment_status': 'paid'
            });

            // Calculate total revenue
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

        // Combine revenue information with products
        products = products.map(product => {
            const revenue = orderInfo.find(item => item.productId.toString() === product._id.toString());
            return {
                ...product,
                totalRevenue: revenue ? revenue.totalRevenue : 0
            };
        });

        // Handle sortBy as an array
        const sortByArray = Array.isArray(sortBy) ? sortBy : [sortBy];
        const sortOrderValue = sortOrder === 'asc' ? 1 : -1;

        // Sort by multiple criteria
        products.sort((a, b) => {
            // Process each sort criterion by priority
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
                
                // If there's a difference by this criterion, return result and don't check next criterion
                if (compareResult !== 0) {
                    return compareResult;
                }
            }
            
            // If all criteria are equal, maintain position
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

/**
 * Lấy tất cả sản phẩm cho admin với các tùy chọn tìm kiếm và phân trang
 */
const get_admin_products = async (req, res) => {
    try {
        const { 
            page = 1, 
            searchValue = '', 
            perPage = 10,
            categoryId = '',
            sellerId = '',
            minPrice = '',
            maxPrice = '',
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const pageNumber = parseInt(page);
        const itemsPerPage = parseInt(perPage);
        const skip = (pageNumber - 1) * itemsPerPage;

        // Xây dựng query
        let query = {};
        
        // Tìm kiếm theo tên sản phẩm
        if (searchValue) {
            query.name = { $regex: searchValue, $options: 'i' };
        }
        
        // Lọc theo danh mục
        if (categoryId) {
            query.categoryId = categoryId;
        }
        
        // Lọc theo người bán
        if (sellerId) {
            query.sellerId = sellerId;
        }
        
        // Lọc theo khoảng giá
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) {
                query.price.$gte = Number(minPrice);
            }
            if (maxPrice) {
                query.price.$lte = Number(maxPrice);
            }
        }

        // Xác định cách sắp xếp
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Lấy danh sách sản phẩm và tổng số lượng
        const [products, totalProducts] = await Promise.all([
            productModel.find(query)
                .populate('categoryId', 'name')
                .populate('sellerId', 'name email shopInfo')
                .skip(skip)
                .limit(itemsPerPage)
                .sort(sort)
                .lean(),
            productModel.countDocuments(query)
        ]);

        // Thêm thông tin về tổng số lượng đã bán cho mỗi sản phẩm
        const enhancedProducts = await Promise.all(products.map(async (product) => {
            // Có thể thêm thông tin bổ sung nếu cần
            return {
                ...product,
                categoryName: product.categoryId ? product.categoryId.name : 'Unknown',
                sellerName: product.sellerId ? (product.sellerId.shopInfo?.shopName || product.sellerId.name) : 'Unknown'
            };
        }));

        // Tính toán số trang
        const pages = Math.ceil(totalProducts / itemsPerPage);

        responseReturn(res, 200, {
            products: enhancedProducts,
            totalProducts,
            currentPage: pageNumber,
            perPage: itemsPerPage,
            totalPages: pages
        });
    } catch (error) {
        console.error('Get admin products error:', error);
        responseReturn(res, 500, { error: error.message });
    }
};

/**
 * Admin cập nhật sản phẩm
 */
const admin_update_product = async (req, res) => {
    try {
        const { productId, name, description, stock, price, discount, categoryId, costPrice } = req.body;
        
        if (!productId) {
            return responseReturn(res, 400, { error: 'Product ID is required' });
        }

        // Tìm sản phẩm
        const product = await productModel.findById(productId);
        
        if (!product) {
            return responseReturn(res, 404, { error: 'Product not found' });
        }

        const slug = name.trim().split(' ').join('-').toLowerCase();

        // Cập nhật sản phẩm
        await productModel.findByIdAndUpdate(productId, {
            name: name.trim(),
            description,
            stock,
            price,
            discount: discount || 0,
            slug,
            categoryId,
            costPrice: costPrice || 0
        });

        const updatedProduct = await productModel.findById(productId)
            .populate('categoryId', 'name')
            .populate('sellerId', 'name email shopInfo');
            
        responseReturn(res, 200, { 
            product: updatedProduct, 
            message: 'Product updated successfully' 
        });
    } catch (error) {
        responseReturn(res, 500, { error: error.message });
    }
};

/**
 * Admin xóa sản phẩm
 */
const admin_delete_product = async (req, res) => {
    try {
        const { productId } = req.params;
        
        if (!productId) {
            return responseReturn(res, 400, { error: 'Product ID is required' });
        }
        
        const product = await productModel.findById(productId);
        
        if (!product) {
            return responseReturn(res, 404, { error: 'Product not found' });
        }
        
        // Xóa ảnh trên Cloudinary nếu cần
        const images = product.images;
        for (let i = 0; i < images.length; i++) {
            const imageUrl = images[i];
            // Lấy publicId từ URL
            const splitUrl = imageUrl.split('/');
            const foldersAndFile = splitUrl.slice(splitUrl.indexOf('products')).join('/');
            const publicId = foldersAndFile.split('.')[0];
            
            // Xóa ảnh từ Cloudinary
            try {
                await cloudinaryService.uploader.destroy(publicId);
            } catch (error) {
                console.error(`Failed to delete image ${imageUrl} from Cloudinary:`, error);
            }
        }
        
        // Xóa sản phẩm từ database
        await productModel.findByIdAndDelete(productId);
        
        responseReturn(res, 200, { 
            message: 'Product deleted successfully',
            productId
        });
    } catch (error) {
        responseReturn(res, 500, { error: error.message });
    }
};

module.exports = {
    add_product,
    get_products,
    get_product,
    update_product,
    product_image_update,
    delete_product,
    seller_manage_products,
    get_admin_products,
    admin_update_product,
    admin_delete_product
}