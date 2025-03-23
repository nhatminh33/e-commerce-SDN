/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: ID người dùng
 *         name:
 *           type: string
 *           description: Tên người dùng
 *         email:
 *           type: string
 *           format: email
 *           description: Email người dùng
 *         password:
 *           type: string
 *           format: password
 *           description: Mật khẩu người dùng
 *         image:
 *           type: string
 *           description: URL ảnh đại diện
 *         role:
 *           type: string
 *           enum: [customer, seller, admin]
 *           description: Vai trò của người dùng
 *         status:
 *           type: string
 *           enum: [active, inactive, pending]
 *           description: Trạng thái tài khoản
 *         method:
 *           type: string
 *           enum: [local, google, github]
 *           description: Phương thức xác thực
 *         emailVerified:
 *           type: boolean
 *           description: Trạng thái xác thực email
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian tạo tài khoản
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian cập nhật tài khoản
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - category
 *         - sellerId
 *       properties:
 *         _id:
 *           type: string
 *           description: ID sản phẩm
 *         name:
 *           type: string
 *           description: Tên sản phẩm
 *         slug:
 *           type: string
 *           description: Slug URL của sản phẩm
 *         price:
 *           type: number
 *           description: Giá sản phẩm
 *         discount:
 *           type: number
 *           description: Phần trăm giảm giá
 *         stock:
 *           type: number
 *           description: Số lượng trong kho
 *         description:
 *           type: string
 *           description: Mô tả sản phẩm
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Danh sách URL ảnh sản phẩm
 *         category:
 *           type: string
 *           description: ID danh mục sản phẩm
 *         sellerId:
 *           type: string
 *           description: ID người bán
 *         rating:
 *           type: number
 *           description: Đánh giá trung bình
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: Trạng thái sản phẩm
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian tạo sản phẩm
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian cập nhật sản phẩm
 *     Order:
 *       type: object
 *       required:
 *         - customerId
 *         - products
 *         - totalPrice
 *       properties:
 *         _id:
 *           type: string
 *           description: ID đơn hàng
 *         customerId:
 *           type: string
 *           description: ID khách hàng
 *         products:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID sản phẩm
 *               quantity:
 *                 type: number
 *                 description: Số lượng
 *               price:
 *                 type: number
 *                 description: Giá sản phẩm
 *               sellerId:
 *                 type: string
 *                 description: ID người bán
 *         address:
 *           type: object
 *           properties:
 *             country:
 *               type: string
 *               description: Quốc gia
 *             city:
 *               type: string
 *               description: Thành phố
 *             district:
 *               type: string
 *               description: Quận/huyện
 *             ward:
 *               type: string
 *               description: Phường/xã
 *             street:
 *               type: string
 *               description: Đường phố
 *         status:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, canceled]
 *           description: Trạng thái đơn hàng
 *         paymentMethod:
 *           type: string
 *           enum: [cod, card]
 *           description: Phương thức thanh toán
 *         paymentStatus:
 *           type: string
 *           enum: [paid, unpaid]
 *           description: Trạng thái thanh toán
 *         totalPrice:
 *           type: number
 *           description: Tổng giá trị đơn hàng
 *         discount:
 *           type: number
 *           description: Giảm giá
 *         shippingFee:
 *           type: number
 *           description: Phí vận chuyển
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian tạo đơn hàng
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian cập nhật đơn hàng
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: ID danh mục
 *         name:
 *           type: string
 *           description: Tên danh mục
 *         slug:
 *           type: string
 *           description: Slug URL của danh mục
 *         image:
 *           type: string
 *           description: URL ảnh danh mục
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: Trạng thái danh mục
 */ 