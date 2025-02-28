const categoryModel = require("../../models/categoryModel")
const cloudinaryService = require("../../utiles/cloudinaryService")
const { responseReturn } = require("../../utiles/response")
const { formidable } = require('formidable');

const add_category = async (req, res) => {
    const form = formidable();

    try {
        // Parse form data với Promise
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
        const { page: pageInput, searchValue, perPage: perPageInput } = req.body || {};
        
        const page = Math.max(1, Number(pageInput) || 1);
        const perPage = Math.max(1, Number(perPageInput) || 10);
        const skipPage = (page - 1) * perPage;

        const query = searchValue
            ? { name: { $regex: searchValue, $options: 'i' } } 
            : {};

        const [categorys, totalCategory] = await Promise.all([
            categoryModel
                .find(query)
                .skip(skipPage)
                .limit(perPage)
                .sort({ createdAt: -1 })
                .lean(),
            categoryModel.countDocuments(query)
        ]);

        const pages = Math.ceil(totalCategory / perPage);

        responseReturn(res, 200, { categorys, totalCategory, pages });
    } catch (error) {
        console.error('Get categories error:', error);
        responseReturn(res, 500, { error: `Failed to retrieve categories: ${error.message}` });
    }
};

const get_category = async (req, res) => {
    try {
        const { id } = req.params
        const category = await categoryModel.findById(id)
        responseReturn(res, 200, { category })
    } catch (error) {
        responseReturn(res, 500, { error: 'Internal Server Error' })
    }
}

const update_category = async (req, res) => {
    const form = formidable()
    form.parse(req, async (err, fields, files) => {
        if (err) {
            responseReturn(res, 404, { error: 'something went wrong' })
        } else {
            let { name } = fields
            let { image } = files
            const { id } = req.params;

            name = name.trim()
            const slug = name.split(' ').join('-')

            try {
                let result = null;
                if (image) {
                    result = await cloudinaryService.uploader.upload(image.filepath, { folder: 'categorys' })
                }

                const updateData = {
                    name,
                    slug,
                }

                if (result) {
                    updateData.image = result.url;
                }

                const category = await categoryModel.findByIdAndUpdate(id, updateData, { new: true });
                responseReturn(res, 200, { category, message: 'Category Updated successfully' })

            } catch (error) {
                responseReturn(res, 500, { error: 'Internal Server Error' })
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
        res.status(500).json({ message: 'Internal Server Error' });
    }

}

module.exports = {
    add_category,
    get_categories,
    get_category,
    update_category,
    delete_category
}