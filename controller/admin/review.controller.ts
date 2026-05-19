import { Request, Response } from "express";
// Import Model của bạn (ví dụ Review)
import Comment from "../../model/comment.model.js";
import Customer from "../../model/customer.model.js";
import Service from "../../model/service.model.js";

// export const index = async (req: Request, res: Response) => {
//   // try {
//     // 1. Lấy tất cả bình luận
//     const rawReviews = await Comment.findAll({
//       raw: true,
//       order: [['created_at', 'DESC']]
//     });

//     // 2. Xử lý lấy thông tin bổ sung cho từng review bằng Promise.all (chạy song song)
//     const reviews = await Promise.all(rawReviews.map(async (review: any) => {
//       // Tìm khách hàng theo ID (giả sử cột là customer_id)
//       const customer = await Customer.findOne({ 
//         where: { customer_id: review.customer_id }, 
//         raw: true 
//       });
      
//       // Tìm dịch vụ theo ID (giả sử cột là service_id)
//       const service = await Service.findOne({ 
//         where: { id: review.service_id }, 
//         raw: true 
//       });
//       const avatar = customer ? (JSON.parse((customer as any).avatar))[0] : null;
//       console.log(avatar);
//       return {
//         ...review,
//         customerName: customer ? (customer as any).fullName : "Khách ẩn danh",
//         customerAvatar: customer ? avatar : "",
//         serviceName: service ? (service as any).name : "Dịch vụ không xác định"
//       };
//     }));

//     // 3. Tính toán thống kê nhanh
//     const totalReviews = reviews.length;
//     const avgRating = totalReviews > 0 
//       ? (reviews.reduce((sum, item) => sum + Number(item.rating), 0) / totalReviews).toFixed(1) 
//       : "0.0";

//     res.render("admin/pages/comments/index.pug", {
//       pageTitle: "Quản lý bình luận",
//       reviews: reviews,
//       stats: {
//         total: totalReviews,
//         avg: avgRating
//       }
//     });
//   // } catch (error) {
//   //   console.error("Lỗi Controller:", error);
//   //    res.redirect("admin/comments/index.pug");
//   // }
// };

export const index = async (req: Request, res: Response) => {
  try {
    // 1. Lấy tất cả bình luận (Dùng 1 kết nối)
    const rawReviews = await Comment.findAll({
      raw: true,
      order: [['created_at', 'DESC']]
    });

    const reviews = [];

    // 2. Chạy tuần tự để không bị quá tải kết nối (Sửa ở đây)
    for (const review of rawReviews) {
      const customer = await Customer.findOne({ 
        where: { customer_id: (review as any).customer_id }, 
        raw: true 
      });
      
      const service = await Service.findOne({ 
        where: { id: (review as any).service_id }, 
        raw: true 
      });

      let avatar = null;
      try {
        if (customer && (customer as any).avatar) {
          const parsedAvatar = JSON.parse((customer as any).avatar);
          avatar = Array.isArray(parsedAvatar) ? parsedAvatar[0] : parsedAvatar;
        }
      } catch (e) {
        avatar = (customer as any).avatar; // Nếu không phải JSON thì lấy luôn
      }

      reviews.push({
        ...review,
        customerName: customer ? (customer as any).fullName : "Khách ẩn danh",
        customerAvatar: avatar || "",
        serviceName: service ? (service as any).name : "Dịch vụ không xác định"
      });
    }

    // 3. Tính toán thống kê
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 
      ? (reviews.reduce((sum, item) => sum + Number((item as any).rating), 0) / totalReviews).toFixed(1) 
      : "0.0";

    res.render("admin/pages/comments/index.pug", {
      pageTitle: "Quản lý bình luận",
      reviews: reviews,
      stats: {
        total: totalReviews,
        avg: avgRating
      }
    });
  } catch (error) {
    console.error("Lỗi Controller:", error);
    res.status(500).send("Lỗi server hoặc vượt giới hạn kết nối database.");
  }
};