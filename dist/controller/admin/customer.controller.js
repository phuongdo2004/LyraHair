import Customer from "../../model/customer.model.js";
import Booking from "../../model/booking.model.js";
export const index = async (req, res) => {
    const limit = 3;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    // 2. Lấy tổng số bản ghi (Chỉ cần lấy count)
    const countCustomers = await Customer.count();
    // 3. Tính toán số trang (Làm tròn lên)
    // Ví dụ: 5 bản ghi, limit 4 => 5/4 = 1.25 => Làm tròn lên là 2 trang
    const totalPage = Math.ceil(countCustomers / limit);
    const pagination = {
        currentPage: page,
        limitItem: limit,
        totalPage: totalPage, // Bây giờ nó đã là một con số (number)
        skip: offset
    };
    // 1. Lấy danh sách khách hàng
    const customers = await Customer.findAll({
        limit: pagination.limitItem,
        offset: pagination.skip,
        raw: true,
    });
    for (const customer of customers) {
        // 2. Tính tổng chi tiêu từ bảng Bookings
        const total = await Booking.sum('price', {
            where: { id_customer: customer.customer_id, status: 'paid' }
        }) || 0;
        customer.totalSpent = total;
        // 3. Phân hạng dựa trên chi tiêu
        if (total >= 10000000) { // Trên 10 triệu
            customer.rankName = "Diamond";
            customer.rankClass = "bg-blue-50 text-blue-600 border-blue-100";
        }
        else if (total >= 5000000) { // Trên 5 triệu
            customer.rankName = "Gold";
            customer.rankClass = "bg-yellow-50 text-yellow-600 border-yellow-100";
        }
        else {
            customer.rankName = "Silver";
            customer.rankClass = "bg-neutral-100 text-neutral-500 border-neutral-200";
        }
        // 4. Lấy lần cuối ghé thăm (Booking gần nhất)
        const lastBooking = await Booking.findOne({
            where: { id_customer: customer.customer_id },
            order: [['booking_date', 'DESC']],
            raw: true
        });
        if (lastBooking) {
            customer.lastVisitDate = lastBooking.booking_date;
            // Bạn có thể join thêm bảng Service để lấy tên dịch vụ tại đây
            customer.lastService = "Dịch vụ đã dùng";
        }
    }
    res.render("admin/pages/customers/index.pug", {
        customers: customers,
        pagination: pagination // Giả định bạn đã tính toán pagination ở trên
    });
};
