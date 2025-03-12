const userModel = require("../../models/userModel");
const sellerSalaryModel = require("../../models/sellerSalary");
const { responseReturn } = require("../../utiles/response");

// Tạo lương cho người bán
const create_salary = async (req, res) => {
    try {
        const { sellerId, basicSalary, bonus, deduction, note, month, year } = req.body;

        if (!sellerId || !basicSalary || !month || !year) {
            return responseReturn(res, 400, { error: 'Seller ID, basic salary, month, and year are required' });
        }

        // Kiểm tra xem seller có tồn tại không
        const seller = await userModel.findOne({ _id: sellerId, role: "seller" });
        if (!seller) {
            return responseReturn(res, 404, { error: 'Seller not found' });
        }

        // Kiểm tra xem đã có lương cho tháng này chưa
        const existingSalary = await sellerSalaryModel.findOne({ sellerId, month, year });
        if (existingSalary) {
            return responseReturn(res, 400, { error: 'Salary for this month already exists for this seller' });
        }

        const totalSalary = Number(basicSalary) + Number(bonus || 0) - Number(deduction || 0);

        const newSalary = await sellerSalaryModel.create({
            sellerId,
            basicSalary,
            bonus: bonus || 0,
            deduction: deduction || 0,
            totalSalary,
            note,
            month,
            year,
            status: "pending"
        });
        
        // Populate thông tin seller
        await newSalary.populate('seller', 'name email image');
        
        // Lọc dữ liệu trước khi trả về
        const filteredSalary = {
            _id: newSalary._id,
            sellerId: newSalary.sellerId,
            basicSalary: newSalary.basicSalary,
            bonus: newSalary.bonus,
            deduction: newSalary.deduction,
            totalSalary: newSalary.totalSalary,
            status: newSalary.status,
            month: newSalary.month,
            year: newSalary.year,
            note: newSalary.note,
            seller: newSalary.seller ? {
                _id: newSalary.seller._id,
                name: newSalary.seller.name,
                email: newSalary.seller.email,
                image: newSalary.seller.image || ''
            } : null
        };

        responseReturn(res, 201, { salary: filteredSalary, message: "Salary created successfully" });
    } catch (error) {
        console.error('Create salary error:', error);
        responseReturn(res, 500, { error: error.message });
    }
};

// Lấy danh sách lương người bán với phân trang và tìm kiếm
const get_salaries = async (req, res) => {
    try {
        const { page = 1, perPage = 10, searchValue, status, month, year } = req.body;

        const query = {};

        if (searchValue) {
            // Tìm kiếm seller có tên hoặc email trùng khớp
            const sellers = await userModel.find({
                role: "seller",
                $or: [
                    { name: { $regex: searchValue, $options: 'i' } },
                    { email: { $regex: searchValue, $options: 'i' } }
                ]
            }).select('_id');

            const sellerIds = sellers.map(seller => seller._id);
            query.sellerId = { $in: sellerIds };
        }

        if (status) {
            query.status = status;
        }

        if (month) {
            query.month = month;
        }

        if (year) {
            query.year = year;
        }

        const skip = (Number(page) - 1) * Number(perPage);

        const salaries = await sellerSalaryModel.find(query)
            .populate('seller', 'name email image')
            .skip(skip)
            .limit(Number(perPage))
            .sort({ createdAt: -1 });

        const total = await sellerSalaryModel.countDocuments(query);
        const totalPages = Math.ceil(total / perPage);

        // Lọc dữ liệu trước khi trả về
        const filteredSalaries = salaries.map(salary => ({
            _id: salary._id,
            sellerId: salary.sellerId,
            basicSalary: salary.basicSalary,
            bonus: salary.bonus,
            deduction: salary.deduction,
            totalSalary: salary.totalSalary,
            status: salary.status,
            month: salary.month,
            year: salary.year,
            seller: salary.seller ? {
                _id: salary.seller._id,
                name: salary.seller.name,
                email: salary.seller.email,
                image: salary.seller.image || ''
            } : null,
            paidDate: salary.paidDate
        }));

        responseReturn(res, 200, { 
            items: filteredSalaries, 
            pagination: {
                totalPages,
                total,
                currentPage: Number(page),
                perPage: Number(perPage)
            }
        });
    } catch (error) {
        console.error('Get salaries error:', error);
        responseReturn(res, 500, { error: error.message });
    }
};

// Lấy thông tin lương của một người bán
const get_salary = async (req, res) => {
    try {
        const { id } = req.params;

        const salary = await sellerSalaryModel.findById(id)
            .populate('seller', 'name email image');

        if (!salary) {
            return responseReturn(res, 404, { error: 'Salary not found' });
        }

        // Lọc dữ liệu trước khi trả về
        const filteredSalary = {
            _id: salary._id,
            sellerId: salary.sellerId,
            basicSalary: salary.basicSalary,
            bonus: salary.bonus,
            deduction: salary.deduction,
            totalSalary: salary.totalSalary,
            status: salary.status,
            month: salary.month,
            year: salary.year,
            note: salary.note,
            createdAt: salary.createdAt,
            seller: salary.seller ? {
                _id: salary.seller._id,
                name: salary.seller.name,
                email: salary.seller.email,
                image: salary.seller.image || ''
            } : null,
            paidDate: salary.paidDate
        };

        responseReturn(res, 200, { salary: filteredSalary });
    } catch (error) {
        console.error('Get salary error:', error);
        responseReturn(res, 500, { error: error.message });
    }
};

// Cập nhật thông tin lương
const update_salary = async (req, res) => {
    try {
        const { id } = req.params;
        const { basicSalary, bonus, deduction, note, status } = req.body;

        const salary = await sellerSalaryModel.findById(id);
        if (!salary) {
            return responseReturn(res, 404, { error: 'Salary not found' });
        }

        // Cập nhật thông tin lương
        if (basicSalary !== undefined) salary.basicSalary = Number(basicSalary);
        if (bonus !== undefined) salary.bonus = Number(bonus);
        if (deduction !== undefined) salary.deduction = Number(deduction);
        if (note !== undefined) salary.note = note;
        if (status !== undefined) {
            salary.status = status;
            if (status === 'paid') {
                salary.paidDate = new Date();
            }
        }

        // Tính lại tổng lương
        salary.totalSalary = Number(salary.basicSalary) + Number(salary.bonus) - Number(salary.deduction);

        await salary.save();
        
        // Populate thông tin seller
        await salary.populate('seller', 'name email image');
        
        // Lọc dữ liệu trước khi trả về
        const filteredSalary = {
            _id: salary._id,
            sellerId: salary.sellerId,
            basicSalary: salary.basicSalary,
            bonus: salary.bonus,
            deduction: salary.deduction,
            totalSalary: salary.totalSalary,
            status: salary.status,
            month: salary.month,
            year: salary.year,
            note: salary.note,
            seller: salary.seller ? {
                _id: salary.seller._id,
                name: salary.seller.name,
                email: salary.seller.email,
                image: salary.seller.image || ''
            } : null,
            paidDate: salary.paidDate
        };

        responseReturn(res, 200, { salary: filteredSalary, message: "Salary updated successfully" });
    } catch (error) {
        console.error('Update salary error:', error);
        responseReturn(res, 500, { error: error.message });
    }
};

// Xóa lương
const delete_salary = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedSalary = await sellerSalaryModel.findByIdAndDelete(id);
        if (!deletedSalary) {
            return responseReturn(res, 404, { error: 'Salary not found' });
        }

        responseReturn(res, 200, { message: "Salary deleted successfully" });
    } catch (error) {
        console.error('Delete salary error:', error);
        responseReturn(res, 500, { error: error.message });
    }
};

// Lấy tổng kết lương theo tháng/năm
const get_salary_summary = async (req, res) => {
    try {
        const { month, year } = req.body;

        if (!month || !year) {
            return responseReturn(res, 400, { error: 'Month and year are required' });
        }

        const query = { month, year };

        const summary = await sellerSalaryModel.aggregate([
            { $match: query },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$totalSalary" }
                }
            }
        ]);

        // Chuyển đổi kết quả thành đối tượng dễ sử dụng hơn
        const result = {
            total: 0,
            paid: { count: 0, amount: 0 },
            pending: { count: 0, amount: 0 },
            rejected: { count: 0, amount: 0 }
        };

        summary.forEach(item => {
            if (item._id === 'paid') {
                result.paid = { count: item.count, amount: item.totalAmount };
            } else if (item._id === 'pending') {
                result.pending = { count: item.count, amount: item.totalAmount };
            } else if (item._id === 'rejected') {
                result.rejected = { count: item.count, amount: item.totalAmount };
            }
            result.total += item.totalAmount;
        });

        responseReturn(res, 200, { summary: result });
    } catch (error) {
        console.error('Get salary summary error:', error);
        responseReturn(res, 500, { error: error.message });
    }
};

// Lấy lương của người bán theo tháng/năm
const get_seller_salary = async (req, res) => {
    try {
        const { sellerId, month, year } = req.body;

        if (!sellerId) {
            return responseReturn(res, 400, { error: 'Seller ID is required' });
        }

        const query = { sellerId };

        if (month) {
            query.month = month;
        }

        if (year) {
            query.year = year;
        }

        const salaries = await sellerSalaryModel.find(query)
            .populate('seller', 'name email image')
            .sort({ year: -1, month: -1 });

        // Lọc dữ liệu trước khi trả về
        const filteredSalaries = salaries.map(salary => ({
            _id: salary._id,
            sellerId: salary.sellerId,
            basicSalary: salary.basicSalary,
            bonus: salary.bonus,
            deduction: salary.deduction,
            totalSalary: salary.totalSalary,
            status: salary.status,
            month: salary.month,
            year: salary.year,
            note: salary.note,
            seller: salary.seller ? {
                _id: salary.seller._id,
                name: salary.seller.name,
                email: salary.seller.email,
                image: salary.seller.image || ''
            } : null,
            paidDate: salary.paidDate
        }));

        responseReturn(res, 200, { salaries: filteredSalaries });
    } catch (error) {
        console.error('Get seller salary error:', error);
        responseReturn(res, 500, { error: error.message });
    }
};

module.exports = {
    create_salary,
    get_salaries,
    get_salary,
    update_salary,
    delete_salary,
    get_salary_summary,
    get_seller_salary
}; 