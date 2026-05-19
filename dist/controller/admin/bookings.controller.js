import Booking from "../../model/booking.model.js";
import Customer from "../../model/customer.model.js";
import Service from "../../model/service.model.js";
import { system } from "../../config/system.js";
export const index = async (req, res) => {
    // 1. Cấu hình phân trang
    // 1. Cấu hình phân trang
    const limit = 4;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    // 2. Lấy tổng số bản ghi (Chỉ cần lấy count)
    const countBookings = await Booking.count();
    // 3. Tính toán số trang (Làm tròn lên)
    // Ví dụ: 5 bản ghi, limit 4 => 5/4 = 1.25 => Làm tròn lên là 2 trang
    const totalPage = Math.ceil(countBookings / limit);
    const pagination = {
        currentPage: page,
        limitItem: limit,
        totalPage: totalPage, // Bây giờ nó đã là một con số (number)
        skip: offset
    };
    // 4. Lấy dữ liệu trang hiện tại
    const bookings = await Booking.findAll({
        limit: pagination.limitItem,
        offset: pagination.skip,
        raw: true,
        where: {
            is_deleted: 0
        },
        order: [['created_at', 'DESC']], // Thêm sắp xếp để xem lịch mới nhất,
        // logging: console.log // <--- Thêm dòng này
    });
    // ... (vòng lặp for lấy customer giữ nguyên)
    if (bookings.length > 0) {
        for (const booking of bookings) {
            // Sửa đoạn này trong vòng lặp:
            const customer = await Customer.findOne({
                where: {
                    customer_id: booking.id_customer
                    // Tạm thời comment dòng dưới để test xem có phải do thiếu cột không
                    // is_deleted: 0 
                },
                attributes: ['fullName', 'phone'],
                raw: true
            });
            if (customer) {
                booking.fullName = customer.fullName;
                booking.phone = customer.phone; // Lấy phone ra đây
            }
            else {
                booking.fullName = "Khách vãng lai";
                booking.phone = "N/A";
            }
            const service = await Service.findOne({
                where: { id: booking.id_service }, // Bạn kiểm tra lại tên cột id nhé
                attributes: ['name'], // Giả sử cột tên dịch vụ là 'title' hoặc 'name'
                raw: true
            });
            booking.serviceName = service ? service.name : "Dịch vụ không tồn tại";
            const statusMap = {
                'pending': { label: 'Chờ xác nhận', class: 'bg-yellow-100 text-yellow-700' },
                'paid': { label: 'Đã thanh toán', class: 'bg-green-100 text-green-700' },
                'deposited': { label: 'Đã đặt cọc', class: 'bg-blue-100 text-blue-700' }
            };
            const currentStatus = booking.status;
            booking.statusDisplay = statusMap[currentStatus]?.label || 'Không xác định';
            booking.statusClass = statusMap[currentStatus]?.class || 'bg-gray-100 text-gray-700';
        }
    }
    res.render("admin/pages/bookings/index.pug", {
        bookings: bookings,
        message: req.flash(),
        pagination: pagination // Gửi object pagination sang view
    });
};
// [GET] /admin/bookings/detail/:id
// [GET] /admin/bookings/detail/:id
export const detail = async (req, res) => {
    try {
        const id = req.params.id;
        // 1. Tìm booking theo ID
        const booking = await Booking.findOne({
            where: { id: id, is_deleted: 0 }, // Chỉ tìm booking chưa bị xóa
            raw: true
        });
        if (!booking) {
            req.flash("error", "Không tìm thấy lịch đặt!");
            return res.redirect("back");
        }
        // 2. Lấy thông tin khách hàng liên quan
        const customer = await Customer.findOne({
            where: { customer_id: booking.id_customer },
            raw: true
        });
        // 3. Lấy thông tin dịch vụ
        const service = await Service.findOne({
            where: { id: booking.id_service },
            raw: true
        });
        // 4. Ánh xạ trạng thái để hiển thị màu sắc (Bổ sung trạng thái 'cancelled' nếu cần)
        const statusMap = {
            'pending': { label: 'Chờ xác nhận', class: 'bg-yellow-100 text-yellow-700' },
            'paid': { label: 'Đã thanh toán', class: 'bg-green-100 text-green-700' },
            'deposited': { label: 'Đã đặt cọc', class: 'bg-blue-100 text-blue-700' },
            'cancelled': { label: 'Đã hủy lịch', class: 'bg-red-100 text-red-700' }
        };
        // 5. Chuẩn bị dữ liệu hiển thị (Định dạng lại tiền tệ dựa trên các trường của DB)
        const displayData = {
            ...booking,
            customerName: customer ? customer.fullName : "N/A",
            customerPhone: customer ? customer.phone : "N/A",
            serviceName: service ? service.name : "N/A",
            statusLabel: statusMap[booking.status]?.label || booking.status,
            statusClass: statusMap[booking.status]?.class || 'bg-gray-100',
            // Định dạng tiền tệ dạng x.xxx.xxx đ để hiển thị lên giao diện Pug
            priceDisplay: booking.price ? Number(booking.price).toLocaleString('vi-VN') : '0',
            depositDisplay: booking.deposit ? Number(booking.deposit).toLocaleString('vi-VN') : '0',
            remainingDisplay: booking.remaining_balance ? Number(booking.remaining_balance).toLocaleString('vi-VN') : '0'
        };
        res.render("admin/pages/bookings/detail.pug", {
            booking: displayData
        });
    }
    catch (error) {
        console.error("Error in booking detail:", error);
        req.flash("error", "Đã xảy ra lỗi hệ thống!");
        res.redirect("back");
    }
};
export const cancel = async (req, res) => {
    const id = req.params.id;
    await Booking.update({ is_deleted: 1 }, {
        where: {
            id: id,
        }
    });
    req.flash("success", "Hủy lịch đặt thành công!");
    res.redirect(`/${system.prefixAdmin}/bookings`);
};
export const changeStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const status = req.body.status; // Lấy từ thuộc tính name="status" của thẻ select
        // Cập nhật trạng thái trong Database
        await Booking.update({ status: status }, {
            where: { id: id }
        });
        req.flash("success", "Cập nhật trạng thái thành công!");
        // SỬA TẠI ĐÂY: Điều hướng trực tiếp về trang chi tiết của đơn hàng này
        // Không dùng "back" nữa để tránh lỗi mất Header Referer trên trình duyệt
        res.redirect(`/admin/bookings/detail/${id}`);
    }
    catch (error) {
        console.error("❌ Lỗi tại changeStatus controller:", error);
        req.flash("error", "Có lỗi xảy ra khi cập nhật trạng thái.");
        res.redirect(`/admin/bookings`); // Nếu lỗi nặng thì đẩy hẳn về trang danh sách cho an toàn
    }
};
