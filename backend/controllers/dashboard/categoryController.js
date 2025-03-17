const categoryModel = require("../../models/categoryModel")
const cloudinaryService = require("../../utiles/cloudinaryService")
const { responseReturn } = require("../../utiles/response")
const { formidable } = require('formidable');

const add_category = async (req, res) => {
    const form = formidable();

    try {
        const [fields, files] = await form.parse(req);

        const { name } = fields;
        const { image } = files;

        if (!name || !name[0] || !image || !image[0]) {
            return responseReturn(res, 400, { error: 'Name and image are required' });
        }

        const trimmedName = name[0].trim();
        const slug = trimmedName.split(' ').join('-');

        const result = await cloudinaryService.uploader.upload(image[0].filepath, { folder: 'categories' });

        if (!result) {
            return responseReturn(res, 500, { error: 'Image upload failed' });
        }

        const category = await categoryModel.create({
            name: trimmedName,
            slug,
            image: result.url
        });

        responseReturn(res, 201, { category, message: 'Category added successfully' });
    } catch (error) {
        console.error('Add category error:', error);
        responseReturn(res, 500, { error: `Failed to add category: ${error.message}` });
    }
};

const get_categories = async (req, res) => {
    try {
        const { page, searchValue, perPage } = req.query;

        const pageNumber = parseInt(page) || 1;
        const itemPerPage = parseInt(perPage) || 10;
        const skip = (pageNumber - 1) * itemPerPage;

        let query = {};
        
        if (searchValue && searchValue !== 'undefined' && searchValue !== '') {
            query.name = new RegExp(searchValue, 'i');
        }

        const [categorys, totalCategory] = await Promise.all([
            categoryModel.find(query)
                .skip(skip)
                .limit(itemPerPage)
                .sort({ createdAt: -1 })
                .lean(),
            categoryModel.countDocuments(query)
        ]);

        const pages = Math.ceil(totalCategory / itemPerPage);

        responseReturn(res, 200, {
            categorys,
            totalCategory,
            pages
        });

    } catch (error) {
        console.error('Get categories error:', error);
        responseReturn(res, 500, { error: 'Internal server error' });
    }
};

const get_category = async (req, res) => {
    try {
        const { id } = req.params
        const category = await categoryModel.findById(id)
        responseReturn(res, 200, { category })
    } catch (error) {
        responseReturn(res, 500, { error: error.message })
    }
}

const update_category = async (req, res) => {
    const form = formidable()
    form.parse(req, async (err, fields, files) => {
        if (err) {
            responseReturn(res, 404, { error: 'something went wrong' })
        } else {
            const { id } = req.params;
            const { name } = fields;
            const { image } = files;

            if (!name || !name[0] || !image || !image[0]) {
                return responseReturn(res, 400, { error: 'Name and image are required' });
            }

            const categoryData = await categoryModel.findById(id)

            if (!categoryData) {
                return responseReturn(res, 404, { error: 'Category not found' });
            }

            try {
                const trimmedName = name[0].trim();
                const slug = trimmedName.split(' ').join('-');


                const result = await cloudinaryService.uploader.upload(image[0].filepath, { folder: 'categories' });

                if (!result) {
                    return responseReturn(res, 500, { error: 'Image upload failed' });
                }

                await cloudinaryService.uploader.destroy(categoryData.image);

                const updateData = {
                    trimmedName,
                    slug,
                }

                if (categoryData.image) {
                    const publicId = categoryData.image.split('/').pop().split('.')[0];
                    await cloudinaryService.uploader.destroy(`categories/${publicId}`);
                }

                updateData.image = result.url;

                const category = await categoryModel.findByIdAndUpdate(id, updateData, { new: true });
                responseReturn(res, 200, { category, message: 'Category updated successfully' })

            } catch (error) {
                responseReturn(res, 500, { error: error.message })
            }

        }

    })
}

const delete_category = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const deleteCategory = await categoryModel.findByIdAndDelete(categoryId);

        if (!deleteCategory) {
            console.log(`Cateogry with id ${categoryId} not found`);
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json({ message: 'Category deleted successfully' });

    } catch (error) {
        console.log(`Error delete category with id ${categoryId}:`, error);
        res.status(500).json({ message: error.message });
    }

}

module.exports = {
    add_category,
    get_categories,
    get_category,
    update_category,
    delete_category
}