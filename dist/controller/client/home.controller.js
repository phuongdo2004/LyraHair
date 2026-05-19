import Customer from "../../model/customer.model.js";
import Service from "../../model/service.model.js";
import Comment from "../../model/comment.model.js";
export const index = async (req, res) => {
    try {
        console.log("Đang truy cập trang chủ..."); // Debug: Kiểm tra xem có vào được đây không
        // 1. Lấy danh sách dịch vụ
        const services = await Service.findAll({
            where: { is_deleted: 0 },
            limit: 6
        });
        // console.log("Dịch vụ đã lấy:", services); // Debug: Kiểm tra dữ liệu dịch vụ lấy được
        // Xử lý an toàn cho từng dịch vụ
        if (services && services.length > 0) {
            for (const service of services) {
                // --- ĐÃ BỎ PHẦN TÌM ARTIST THEO artist_id VÌ CỘT NÀY KHÔNG CÒN ---
                // Xử lý ảnh an toàn
                const rawImages = service.images;
                if (rawImages) {
                    try {
                        // Kiểm tra xem có phải là chuỗi JSON không trước khi parse
                        const parsedImages = typeof rawImages === 'string' ? JSON.parse(rawImages) : rawImages;
                        service.images = Array.isArray(parsedImages) ? parsedImages[0] : parsedImages;
                    }
                    catch (e) {
                        console.log("Lỗi parse ảnh dịch vụ:", e);
                        service.images = ""; // Nếu lỗi thì để trống thay vì sập web
                    }
                }
            }
        }
        const customer = res.locals.Customer;
        // 2. Lấy top 3 phản hồi (Feedbacks)
        let feedbacks = [];
        try {
            const comments = await Comment.findAll({
                order: [['rating', 'DESC'], ['created_at', 'DESC']],
                limit: 3,
                raw: true
            });
            if (comments && comments.length > 0) {
                for (const comment of comments) {
                    const commentedCustomer = await Customer.findOne({
                        where: { customer_id: comment.customer_id },
                        attributes: ['fullName', 'avatar'],
                        raw: true
                    });
                    // Xử lý Avatar an toàn
                    let avatarUrl = null;
                    const avatarValue = commentedCustomer?.avatar;
                    if (avatarValue) {
                        try {
                            if (typeof avatarValue === 'string' && avatarValue.startsWith('[')) {
                                const parsed = JSON.parse(avatarValue);
                                avatarUrl = Array.isArray(parsed) ? parsed[0] : parsed;
                            }
                            else {
                                avatarUrl = avatarValue;
                            }
                        }
                        catch (error) {
                            avatarUrl = avatarValue;
                        }
                    }
                    comment.customer = {
                        fullName: commentedCustomer?.fullName || 'Khách hàng ẩn danh',
                        avatar: avatarUrl
                    };
                }
                feedbacks = comments;
            }
        }
        catch (error) {
            console.log("Lỗi khi lấy feedbacks:", error);
            feedbacks = [];
        }
        // 3. Render
        res.render("client/pages/home/index.pug", {
            services: services || [], // Luôn gửi mảng dù rỗng
            message: req.flash(),
            customer: customer,
            feedbacks: feedbacks || []
        });
    }
    catch (error) {
        console.error("LỖI CHÍNH TẠI TRANG CHỦ:", error); // In lỗi ra Terminal để em xem
        res.status(500).send("Lỗi máy chủ: " + error.message);
    }
};
