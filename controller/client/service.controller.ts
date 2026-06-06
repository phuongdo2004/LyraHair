import { Op } from "sequelize";
import {Request , Response} from "express";
import Service from "../../model/service.model.js";
import Artist from "../../model/artist.model.js";
import Customer from "../../model/customer.model.js";
import Comment from "../../model/comment.model.js";
import Booking from "../../model/booking.model.js";
import { pagi } from "../../helpers/pagination.helper.js";
import ServiceCategory from "../../model/serviceCategory.model.js";


// export const detail = async(req: Request, res: Response) => {
//   const id = req.params.id;
  
//   // 1. Tìm dịch vụ (Giữ nguyên)
//   const service = await Service.findOne({ where: { id: id } });
//   if (!service) return res.redirect("/services");

//   // 2. Xử lý mảng ảnh (Giữ nguyên)
//   if ((service as any).images) {
//     try {
//       const allImages = JSON.parse((service as any).images);
//       (service as any).allImages = allImages;
//       (service as any).images = allImages[0];
//     } catch (e) {
//       (service as any).allImages = [(service as any).images];
//     }
//   }

//   // 4. LẤY BÌNH LUẬN THEO KIỂU THỦ CÔNG (Không dùng include)
//   // Lấy tất cả comment của dịch vụ này
//   const rawReviews = await Comment.findAll({
//     where: { service_id: id },
//     order: [['created_at', 'DESC']],
//     raw: true // Lấy dữ liệu thuần túy cho dễ xử lý
//   });

//   // Tạo một mảng mới để chứa comment đã có thông tin khách hàng
//   const reviews = [];

//   for (const review of rawReviews) {
//     // Tìm khách hàng tương ứng với mỗi comment
//     const customer = await Customer.findOne({
//       where: { customer_id: (review as any).customer_id },
//       attributes: ['fullName', 'avatar'],
//       raw: true
//     });
//  if (typeof (customer as any).avatar === 'string') {
//       // Nếu là chuỗi JSON mảng thì parse, nếu là chuỗi thường thì bọc vào mảng
//       try {
//         (customer as any).avatar = (JSON.parse((customer as any).avatar))[0];
//       } catch (e) {
//         (customer as any).avatar = [(customer as any).avatar];
//       }
//     }
    
//     // Gộp thông tin khách vào object review
//     reviews.push({
//       ...review,
//       customer_name: customer ? (customer as any).fullName : "Khách hàng",
//       customer_avatar: customer ? (customer as any).avatar : null
//     });
//   }

 
//   // 5. Render ra giao diện
//   res.render("client/pages/service/detail.pug", {
//     service: service,

//     reviews: reviews // Giờ reviews đã có thêm customer_name và customer_avatar
//   // ,existingBookings: JSON.stringify(existingBookings) // Chuyển sang JSON để Script ở Frontend đọc được
//   });
// }
// detail service end
// export const index = async (req: Request, res: Response) => {
//   try {
//     // 1. Lấy dữ liệu phân trang trước (Đợi pagination xử lý xong)
//     const pagination = await pagi(req, res);

//     // 2. Lấy categoryId đang lọc trên URL query (nếu có)
//     const currentCategoryId = req.query.categoryId || "";

//     // 3. Khởi tạo object điều kiện tìm kiếm dựa trên trường 'is_deleted' của Model
//     const findCondition: any = {
//       is_deleted: 0 // Khớp 100% với defaultValue: 0 trong model của em
//     };

//     // ĐÃ SỬA TẠI ĐÂY: Khớp với trường 'category_id' trong Model Service của em
//     if (currentCategoryId) {
//       findCondition.category_id = currentCategoryId; 
//     }

//     // 4. Lấy danh sách dịch vụ dựa trên bộ lọc phân trang và danh mục
//     const services = await Service.findAll({
//       where: findCondition,
//       limit: pagination.limitItem,
//       offset: pagination.skip,
//       raw: true
//     });

//     // 5. Chuẩn hóa hiển thị ảnh đầu tiên của dịch vụ từ chuỗi JSON mảng
//     for (const service of services) {
//       if ((service as any)["images"]) {
//         try {
//           (service as any)["images"] = (JSON.parse((service as any)["images"]))[0];
//         } catch (e) {
//           // Phòng trường hợp chuỗi thường không thể parse JSON
//           (service as any)["images"] = (service as any)["images"];
//         }
//       }
//     }

//     // 6. Lấy thông tin khách hàng từ locals (nếu đã đăng nhập)
//     const customer = res.locals.Customer;

//     // 7. Lấy tất cả danh mục dịch vụ chưa bị xóa để hiển thị lên thanh bộ lọc
//     const categories = await ServiceCategory.findAll({
//       where: { is_deleted: 0 }, // Khớp với trường 'is_deleted' trong Model ServiceCategory
//       raw: true
//     });

//     // 8. Render dữ liệu ra giao diện Pug
//     res.render("client/pages/service/index.pug", {
//       services: services,
//       categories: categories,
//       currentCategoryId: currentCategoryId, // Truyền sang để nút Danh mục sáng màu hồng lên
//       pagination: pagination,
//       customer: customer,
//     });

//   } catch (error) {
//     console.error("Lỗi khi tải danh sách dịch vụ:", error);
//     res.status(500).send("Có lỗi xảy ra ở hệ thống!");
//   }
// };
export const index = async (req: Request, res: Response) => {
  try {
    // 1. Lấy categoryId đang lọc trên URL query (nếu có) trước
    const currentCategoryId = req.query.categoryId || "";

    // 2. Khởi tạo object điều kiện tìm kiếm dựa trên trường 'is_deleted' và 'category_id'
    const findCondition: any = {
      is_deleted: 0 
    };

    if (currentCategoryId) {
      findCondition.category_id = currentCategoryId; 
    }

    // 3. ĐÃ SỬA TẠI ĐÂY: Truyền findCondition vào hàm pagi để tính toán phân trang chuẩn theo danh mục
    const pagination = await pagi(req, res, findCondition);

    // 4. Lấy danh sách dịch vụ dựa trên bộ lọc phân trang và danh mục đã chuẩn hóa
    const services = await Service.findAll({
      where: findCondition,
      limit: pagination.limitItem,
      offset: pagination.skip,
      raw: true
    });

    // 5. Chuẩn hóa hiển thị ảnh đầu tiên của dịch vụ từ chuỗi JSON mảng
    for (const service of services) {
      if ((service as any)["images"]) {
        try {
          (service as any)["images"] = (JSON.parse((service as any)["images"]))[0];
        } catch (e) {
          (service as any)["images"] = (service as any)["images"];
        }
      }
    }

    // 6. Lấy thông tin khách hàng từ locals (nếu đã đăng nhập)
    const customer = res.locals.Customer;

    // 7. Lấy tất cả danh mục dịch vụ chưa bị xóa để hiển thị lên thanh bộ lọc
    const categories = await ServiceCategory.findAll({
      where: { is_deleted: 0 }, 
      raw: true
    });

    // 8. Render dữ liệu ra giao diện Pug
    res.render("client/pages/service/index.pug", {
      services: services,
      categories: categories,
      currentCategoryId: currentCategoryId, 
      pagination: pagination,
      customer: customer,
    });

  } catch (error) {
    console.error("Lỗi khi tải danh sách dịch vụ:", error);
    res.status(500).send("Có lỗi xảy ra ở hệ thống!");
  }
};

export const detail = async(req: Request, res: Response) => {
  const id = req.params.id;
  
  // 1. Tìm dịch vụ (Giữ nguyên)
  const service = await Service.findOne({ where: { id: id } });
  if (!service) return res.redirect("/services");

  // 2. Xử lý mảng ảnh (Giữ nguyên)
  if ((service as any).images) {
    try {
      const allImages = JSON.parse((service as any).images);
      (service as any).allImages = allImages;
      (service as any).images = allImages[0];
    } catch (e) {
      (service as any).allImages = [(service as any).images];
    }
  }

  // 3. THÊM MỚI: Lấy danh sách nhân viên/chuyên viên hoạt động từ CSDL để đưa lên Form đặt lịch
  // Bạn có thể lọc thêm điều kiện theo trạng thái nếu có (ví dụ: status: "active")
  const artists = await Artist.findAll({
    attributes: ['id', 'name', 'avatar', 'experience'], // Lấy các trường hiển thị trên giao diện Pug
    raw: true
  });

  // Xử lý ảnh đại diện của Artist nếu lưu dạng mảng JSON (giống cách xử lý ảnh Customer)
  for (const artist of artists) {
    if ((artist as any).avatar && typeof (artist as any).avatar === 'string') {
      try {
        (artist as any).avatar = (JSON.parse((artist as any).avatar))[0];
      } catch (e) {
        // Nếu không phải chuỗi JSON thì giữ nguyên giá trị
      }
    }
  }

  // 4. LẤY BÌNH LUẬN THEO KIỂU THỦ CÔNG (Giữ nguyên)
  const rawReviews = await Comment.findAll({
    where: { service_id: id },
    order: [['created_at', 'DESC']],
    raw: true 
  });

  const reviews = [];

  for (const review of rawReviews) {
    const customer = await Customer.findOne({
      where: { customer_id: (review as any).customer_id },
      attributes: ['fullName', 'avatar'],
      raw: true
    });

    if (customer && typeof (customer as any).avatar === 'string') {
      try {
        (customer as any).avatar = (JSON.parse((customer as any).avatar))[0];
      } catch (e) {
        (customer as any).avatar = [(customer as any).avatar];
      }
    }
    
    reviews.push({
      ...review,
      customer_name: customer ? (customer as any).fullName : "Khách hàng",
      customer_avatar: customer ? (customer as any).avatar : null
    });
  }

  // 5. Render ra giao diện (Đã bổ sung biến artists)
  res.render("client/pages/service/detail.pug", {
    service: service,
    reviews: reviews,
    artists: artists // Gửi danh sách nhân viên sang phía giao diện Pug nhận dữ liệu tuần hoàn
  });
}

// Thêm API này vào cùng file controller của bạn để Frontend gọi xử lý bằng AJAX (Fetch)
export const checkBusySlots = async (req: Request, res: Response) => {
  try {
    const { id_artist, booking_date } = req.query;

    if (!id_artist || !booking_date) {
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu check lịch." });
    }

    // Tìm tất cả các lịch đặt của nghệ sĩ này trong ngày được chọn mà trạng thái khác 'cancelled'
    const busyBookings = await Booking.findAll({
      where: {
        id_artist: id_artist as string,
        booking_date: booking_date as string,
        status: { [Op.ne]: 'cancelled' }, 
        // Nếu DB của bạn không có cột is_deleted thì bạn có thể xóa dòng dưới này đi nhé
        is_deleted: 0 
      },
      attributes: ['slot_time'],
      raw: true
    });

    // SỬA TẠI ĐÂY: Thêm (b as any) để TypeScript không bắt bẻ thuộc tính slot_time nữa
    const busySlots = busyBookings.map(b => (b as any).slot_time);

    return res.json({
      success: true,
      busySlots: busySlots
    });

  } catch (error: any) {
    console.error("Lỗi checkBusySlots:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const searchSuggest = async (req: Request, res: Response) => {
  console.log("chay vaof ");

    const keyword = req.query.keyword as string;
console.log(keyword);

    try {
        const services = await Service.findAll({
            where: {
                name: {
                    [Op.like]: `%${keyword}%` // Tìm kiếm gần đúng
                },
                is_deleted: 0
            },
            limit: 5, // Chỉ lấy 5 gợi ý hàng đầu
            attributes: ['id', 'name', 'price', 'images']
        });
    for (const service of services) {
      if ((service as any)["images"]) {
        (service as any)["images"] = (JSON.parse((service as any)["images"]))[0];

      }
  }
console.log(services);
        res.json({ services });
    } catch (error) {
        res.status(500).json({ message: "Lỗi tìm kiếm" });
    }
};
export const toggleFavorite = async (req: Request, res: Response) => {
    const { serviceId } = req.body;
  const customer = res.locals.Customer; // Giả sử bạn đã lấy user từ middleware
  // Vì chúng ta đã dùng get() ở model, favorite_services sẽ là một Array
  let favorites: string[] = customer.favorites || [];

  if (typeof favorites === 'string') favorites = JSON.parse(favorites);
  if (favorites.includes(serviceId)) {
    // Nếu có rồi thì xóa đi (Unfavorite)
    favorites = favorites.filter(id => id !== serviceId);
  } else {
    // Nếu chưa có thì thêm vào
    favorites.push(serviceId);
  }

  // Cập nhật lại vào DB
  await Customer.update(
    { favorites: favorites }, 
    { where: { customer_id: customer.customer_id } }
  );

  res.json({ message: "Cập nhật yêu thích thành công" , code:200});
};

export const favorite = async (req: Request, res: Response) => {
  const customer = res.locals.Customer;
  let favorite_services = customer.favorites || []; // Mảng các ID: ['id1', 'id2',...]
  if (typeof favorite_services === 'string') {
    try {
      favorite_services = JSON.parse(favorite_services);
    } catch (e) {
      favorite_services = [];
    }
  }

  // 1. Cấu hình phân trang
  const limit = 6; // Số lượng item mỗi trang
  const page = parseInt(req.query.page as string) || 1;
  const offset = (page - 1) * limit;

  // 2. Lấy danh sách ID cho trang hiện tại
  // Việc cắt mảng giúp bạn biết chính xác trang này cần lấy những ID nào
  const idsForPage = Array.isArray(favorite_services) ? favorite_services.slice(offset, offset + limit) : []; 

  let services: any = [];
  if (idsForPage.length > 0) {
    services = await Service.findAll({
      where: {
        id: {
          [Op.in]: idsForPage // Tìm các Service có id nằm trong danh sách idsForPage
        },
        is_deleted: 0
      },
      raw: true
    });
    for (const service of services) {
      // / tim address 
      const artist = await Artist.findOne({
        where:{
          id: (service as any).artist_id,
        },
      });

      if(artist){
        (service as any).address = (artist as any).address;
      }
       if ((service as any)["images"]) {
      (service as any)["images"] = (JSON.parse((service as any)["images"]))[0];

    }
    }
    
  }

  // 3. Tính toán thông tin phân trang cho giao diện
  const totalPage = Math.ceil(favorite_services.length / limit);
  const pagination = {
    currentPage: page,
    limitItem: limit,
    totalPage: totalPage,
    skip: offset
  };

  res.render("client/pages/service/favorite.pug", {
    services: services,
    pagination: pagination, // Truyền sang để hiển thị nút số trang
    customer: customer
  });
};
export const review = async (req: Request, res: Response) => {
  try {
    const { service_id, rating, content } = req.body;
    
    const customer = res.locals.Customer;
    // Kiểm tra nếu khách hàng chưa đăng nhập
    if (!customer) {
      return res.json({
        code: 401,
        message: "Vui lòng đăng nhập để gửi đánh giá!"
      });
    }

    const customer_id = customer.customer_id;

    // Tạo bình luận mới
    const newComment = await Comment.create({
      customer_id: customer_id,
      service_id: service_id, 
      content: content,
      rating: parseFloat(rating) || 5, 
    });

    // Lưu vào Database (Nếu dùng Sequelize thì .create đã save rồi, 
    // nhưng nếu dùng mongoose/khác thì để chắc chắn có thể giữ .save)
    await newComment.save();

    // TRẢ VỀ JSON THAY VÌ REDIRECT
    res.json({
      code: 200,
      message: "Gửi bình luận thành công!"
    });

  } catch (error) {
    console.error(error);
    res.json({
      code: 500,
      message: "Có lỗi xảy ra trên hệ thống."
    });
  }
}