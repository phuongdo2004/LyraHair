import User from "../../model/user.model.js";
import Booking from "../../model/booking.model.js";
import Customer from "../../model/customer.model.js";
import { sequelize } from "../../config/database.js";
import { Op } from 'sequelize';
export const index = async (req, res) => {
    try {
        // --- 0. Thông tin User & Auth ---
        const user = await User.findOne({
            where: { tokenUser: req.cookies.token },
            raw: true
        });
        if (user && user.avatar) {
            try {
                user.avatar = JSON.parse(user.avatar);
            }
            catch { }
        }
        else if (user) {
            user.avatar = "/uploads/avatar-default.jpg";
        }
        // --- 1. Xử lý bộ lọc Khoảng ngày ---
        let { startDate, endDate } = req.query;
        const today = new Date();
        const pad = (n) => n < 10 ? '0' + n : n;
        // Tối ưu mặc định: Nếu admin không chọn ngày, hệ thống quét từ Đầu tháng đến Hết tháng này
        if (!startDate) {
            startDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-01`;
        }
        if (!endDate) {
            // Lấy ngày cuối cùng của tháng hiện tại (ví dụ: 31/05/2026)
            const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            endDate = `${lastDay.getFullYear()}-${pad(lastDay.getMonth() + 1)}-${pad(lastDay.getDate())}`;
        }
        // Thiết lập mốc thời gian chi tiết để Sequelize so sánh chính xác
        const startCondition = `${startDate} 00:00:00`;
        const endCondition = `${endDate} 23:59:59`;
        // Điều kiện lọc khớp hoàn toàn với cấu trúc DB trong ảnh của bạn
        const dateRangeCondition = {
            status: { [Op.in]: ['paid', 'deposited'] },
            is_deleted: 0, // Khớp với tinyint(1) mặc định bằng 0
            booking_date: { [Op.between]: [startCondition, endCondition] }
        };
        // --- 2. Tính toán số liệu thống kê cho 3 Cards ---
        const revenueResult = await Booking.findOne({
            attributes: [
                [
                    sequelize.literal(`
            SUM(
              CASE 
                WHEN status = 'paid' THEN price
                WHEN status = 'deposited' THEN deposit 
                ELSE 0 
              END
            )
          `),
                    'total_real_revenue'
                ]
            ],
            where: dateRangeCondition,
            raw: true
        });
        const revenueData = revenueResult ? Number(revenueResult.total_real_revenue || 0) : 0;
        const totalBookingsCount = await Booking.count({ where: dateRangeCondition });
        const totalCustomers = await Customer.count({});
        // --- 3. Nhóm dữ liệu theo Ngày làm Biểu đồ ---
        const chartRawData = await Booking.findAll({
            attributes: [
                'booking_date',
                [sequelize.fn('COUNT', sequelize.col('id')), 'daily_bookings'],
                [
                    sequelize.literal(`SUM(CASE WHEN status = 'deposited' THEN deposit ELSE 0 END)`),
                    'daily_deposited'
                ],
                [
                    sequelize.literal(`SUM(CASE WHEN status = 'paid' THEN price ELSE 0 END)`),
                    'daily_paid'
                ],
                [
                    sequelize.literal(`
            SUM(
              CASE 
                WHEN status = 'paid' THEN price 
                WHEN status = 'deposited' THEN deposit 
                ELSE 0 
               END
            )
          `),
                    'daily_revenue'
                ]
            ],
            where: dateRangeCondition,
            group: ['booking_date'],
            order: [['booking_date', 'ASC']],
            raw: true
        });
        // Format an toàn: Ép kiểu dữ liệu chắc chắn thành số và cắt chuỗi ngày chuẩn
        const revenueChartData = chartRawData.map(item => {
            let bDate = item.booking_date;
            if (bDate instanceof Date) {
                bDate = bDate.toISOString().split('T')[0];
            }
            return {
                booking_date: bDate,
                daily_bookings: Number(item.daily_bookings || 0),
                daily_deposited: Number(item.daily_deposited || 0),
                daily_paid: Number(item.daily_paid || 0),
                daily_revenue: Number(item.daily_revenue || 0)
            };
        });
        // --- 4. Render (Bổ sung biến hệ thống tránh lỗi undefined) ---
        res.render("admin/pages/dashboard/index.pug", {
            user,
            prefixAdmin: "admin", // Đảm bảo truyền biến này để khớp với Route hệ thống của bạn
            startDate,
            endDate,
            stats: {
                revenue: revenueData.toLocaleString('vi-VN'),
                totalBookings: totalBookingsCount,
                totalCustomers: totalCustomers
            },
            revenueChartData
        });
    }
    catch (error) {
        console.error("❌ Lỗi tại dashboard controller:", error.message);
        res.status(500).send("Có lỗi xảy ra trong quá trình xử lý thống kê.");
    }
};
