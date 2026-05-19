import { system } from "../../config/system.js";
import Service from "../../model/service.model.js";
import Artist from "../../model/artist.model.js";
import { pagi } from "../../helpers/pagination.helper.js";
import ServiceCategory from "../../model/serviceCategory.model.js";
// [GET] /admin/services
export const index = async (req, res) => {
    try {
        const pagination = await pagi(req, res);
        // Chỉ lấy các trường hiện có trong Database sau khi em đã chạy SQL xóa cột
        const services = await Service.findAll({
            where: { is_deleted: 0 },
            limit: (await pagination).limitItem,
            offset: (await pagination).skip,
            raw: true
        });
        // Xử lý dữ liệu an toàn để hiển thị ra danh sách
        const processedServices = services.map(service => {
            // 1. Xử lý ảnh an toàn (Lấy tấm đầu tiên)
            let imageDisplay = "";
            if (service.images) {
                try {
                    const imgs = JSON.parse(service.images);
                    imageDisplay = Array.isArray(imgs) ? imgs[0] : imgs;
                }
                catch (e) {
                    // Nếu không phải JSON (ví dụ link trực tiếp), dùng luôn link đó
                    imageDisplay = service.images;
                }
            }
            // 2. Trả về object sạch, không còn rating hay artist_id
            return {
                ...service,
                images: imageDisplay,
                address: "Susannie Studio" // Fix cứng vì đã xóa bảng Artist/artist_id
            };
        });
        res.render("admin/pages/service/index.pug", {
            services: processedServices,
            pagination: pagination,
            totalService: pagination.count,
        });
    }
    catch (error) {
        console.error("Lỗi trang quản lý dịch vụ:", error);
        res.status(500).send("Lỗi hệ thống: Dữ liệu bảng Service không khớp.");
    }
};
// [GET] /admin/service/create
export const create = async (req, res) => {
    try {
        // 1. Lấy song song danh sách artist và danh sách danh mục dịch vụ
        const [artists, categories] = await Promise.all([
            Artist.findAll({ raw: true }) || [],
            ServiceCategory.findAll({
                where: { is_deleted: 0 }, // Chỉ lấy danh mục chưa xóa (nếu hệ thống của bạn có trường này)
                raw: true
            }) || []
        ]);
        // 2. Render và truyền toàn bộ dữ liệu sang giao diện
        res.render("admin/pages/service/create.pug", {
            message: req.flash(),
            artists: artists,
            categories: categories // Truyền danh sách danh mục qua đây
        });
    }
    catch (error) {
        console.error("❌ Lỗi tại controller hiển thị trang thêm dịch vụ:", error.message);
        res.render("admin/pages/service/create.pug", {
            artists: [],
            categories: []
        });
    }
};
// [POST] /admin/service/store
// export const store = async (req: Request, res: Response) => {
//     try {
//         const newService = req.body;
//         // Luôn đảm bảo lưu vào DB dưới dạng String của JSON
//         newService.amenities = JSON.stringify(req.body.amenities || "");
//         newService.images = JSON.stringify(req.body.images || []);
//         await Service.create(newService);
//         req.flash('success', 'Thêm dịch vụ thành công');
//         res.redirect(`${system.prefixAdmin}/services`);
//     } catch (error: any) {
//         console.error("LỖI SQL CHI TIẾT:", error.parent || error);
//         res.status(500).send("Lỗi lưu dịch vụ");
//     }
// }
// [POST] /admin/service/store
// export const store = async (req: Request, res: Response) => {
//   try {
//     const newService = req.body;
//     // 1. ÉP BUỘC thời lượng là 60 (Dù người dùng có gửi gì lên)
//     newService.duration = 60;
//     // 2. KIỂM TRA GIÁ (Phải >= 100.000)
//     const price = parseInt(newService.price);
//     if (!price || price < 100000) {
//       req.flash('error', 'Giá dịch vụ phải ít nhất là 100.000 VNĐ');
//       return res.redirect("back");
//     }
//     // 3. Xử lý dữ liệu khác
//     newService.amenities = JSON.stringify(req.body.amenities || "");
//     newService.images = JSON.stringify(req.body.images || []);
//     console.log("Dữ liệu chuẩn hóa trước khi lưu:", newService);
//     await Service.create(newService);
//     req.flash('success', 'Thêm dịch vụ thành công');
//     console.log("Dịch vụ mới đã được tạo thành công!");
//     res.redirect("/admin/service");
//   } catch (error: any) {
//     console.error("LỖI SQL CHI TIẾT:", error);
//     res.status(500).send("Lỗi hệ thống: " + error.message);
//   }
// }
export const store = async (req, res) => {
    try {
        const { name, category_id, price, duration, amenities } = req.body;
        // 1. KIỂM TRA TÊN VÀ DANH MỤC BẮT BUỘC
        if (!name || !category_id) {
            req.flash('error', 'Vui lòng điền đầy đủ tên dịch vụ và chọn danh mục phân loại!');
            return res.redirect("back");
        }
        // 2. KIỂM TRA GIÁ (Phải >= 100.000 VNĐ)
        const parsedPrice = parseInt(price);
        if (!parsedPrice || parsedPrice < 100000) {
            req.flash('error', 'Giá dịch vụ phải ít nhất là 100.000 VNĐ');
            return res.redirect("back");
        }
        // 3. CHUẨN HÓA THỜI LƯỢNG (Lấy số phút người dùng nhập, nếu trống thì lấy 60)
        const parsedDuration = parseInt(duration) ? parseInt(duration) : 60;
        // 4. XỬ LÝ HÌNH ẢNH (Hỗ trợ cả trường hợp lưu từ Middleware upload hoặc req.body)
        let imagesData = [];
        if (req.body.images) {
            imagesData = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
        }
        else if (req.files) {
            // Trường hợp bạn dùng Multer upload nhiều ảnh (Array/Fields)
            const files = req.files;
            imagesData = files.map((file) => file.path || file.filename);
        }
        else if (req.file) {
            // Trường hợp dùng Multer upload 1 ảnh đơn
            imagesData = [req.file.path || req.file.filename];
        }
        // 5. GOM DỮ LIỆU ĐỂ TẠO OBJECT MỚI CHẮC CHẮN KHỚP DB
        const serviceData = {
            name: name.trim(),
            category_id: category_id, // Khóa ngoại liên kết danh mục
            price: parsedPrice,
            duration: parsedDuration,
            amenities: amenities ? amenities.trim() : "", // Nếu DB cần string thuần thì để nguyên, nếu cần JSON string thì sửa thành JSON.stringify(amenities)
            images: JSON.stringify(imagesData), // Lưu dạng chuỗi JSON Array vào DB
            is_deleted: 0
        };
        console.log("🚀 Dữ liệu chuẩn hóa trước khi lưu vào Database:", serviceData);
        // 6. Ghi vào cơ sở dữ liệu
        await Service.create(serviceData);
        req.flash('success', 'Thêm dịch vụ làm tóc mới thành công ✨');
        console.log("🎉 Thêm thành công một dịch vụ cho Lyra Hair!");
        res.redirect("/admin/service");
    }
    catch (error) {
        console.error("❌ LỖI SQL CHI TIẾT TẠI HÀM STORE DỊCH VỤ:", error);
        req.flash('error', 'Có lỗi hệ thống xảy ra, không thể tạo dịch vụ.');
        res.status(500).send("Lỗi hệ thống: " + error.message);
    }
};
// [GET] /admin/service/detail/:id
// export const detail = async (req: Request, res: Response) => {
//     try {
//         const id = req.params.id;
//         const service = await Service.findOne({
//             where: { id: id, is_deleted: 0 },
//             raw: true
//         });
//         if (!service) return res.redirect("back");
//         // Parse an toàn
//         try {
//             (service as any).images = JSON.parse((service as any).images || "[]");
//             (service as any).amenities = JSON.parse((service as any).amenities || "\"\"");
//         } catch (e) {}
//         const artist = await Artist.findOne({
//             where: { id: (service as any).artist_id },
//             raw: true
//         });
//         res.render("admin/pages/service/detail", {
//             service: service,
//             artistName: (artist as any)?.name || "N/A",
//         });
//     } catch (error) {
//         res.redirect("back");
//     }
// }
// [GET] /admin/service/detail/:id
// export const detail = async (req: Request, res: Response) => {
//     try {
//         const id = req.params.id;
//         // Chỉ lấy các trường hiện có trong Database
//         const service = await Service.findOne({
//             where: { id: id, is_deleted: 0 },
//             raw: true
//         });
//         if (!service) {
//             req.flash('error', 'Không tìm thấy dịch vụ');
//             return res.redirect("back");
//         }
//         // Parse JSON an toàn cho ảnh và tiện ích
//         try {
//             if ((service as any).images) {
//                 const parsedImages = JSON.parse((service as any).images);
//                 (service as any).images = Array.isArray(parsedImages) ? parsedImages : [parsedImages];
//             } else {
//                 (service as any).images = [];
//             }
//             if ((service as any).amenities) {
//                 const parsedAmenities = JSON.parse((service as any).amenities);
//                 (service as any).amenities = parsedAmenities;
//             }
//         } catch (e) {
//             console.error("Lỗi parse JSON:", e);
//         }
//         res.render("admin/pages/service/detail.pug", {
//             service: service,
//             // Đã xóa phần tìm Artist vì cấu trúc bảng mới không còn dùng chung artist_id
//         });
//     } catch (error) {
//         console.error("Lỗi trang chi tiết:", error);
//         res.redirect("back");
//     }
// }
export const detail = async (req, res) => {
    try {
        const id = req.params.id;
        // 1. Chỉ lấy các trường hiện có trong Database của dịch vụ này
        const service = await Service.findOne({
            where: { id: id, is_deleted: 0 },
            raw: true
        });
        if (!service) {
            req.flash('error', 'Không tìm thấy dịch vụ');
            return res.redirect("back");
        }
        // 2. TÌM TÊN DANH MỤC (Dựa vào id_category hoặc category_id từ service vừa tìm được)
        // Lưu ý: Bạn hãy check xem trong DB trường đó tên là id_category hay category_id để ghi cho đúng nhé (ở đây mình dùng thử service.id_category)
        const targetCategoryId = service.category_id;
        let categoryName = "Chưa phân loại";
        if (targetCategoryId) {
            const category = await ServiceCategory.findOne({
                where: { id: targetCategoryId, is_deleted: 0 },
                attributes: ['name'], // Chỉ lấy đúng trường name để tối ưu tốc độ
                raw: true
            });
            if (category && category.name) {
                categoryName = category.name;
            }
        }
        // 3. Parse JSON an toàn cho ảnh và tiện ích
        try {
            if (service.images) {
                // Nếu dữ liệu dạng chuỗi "[...]" thì parse, nếu đã là mảng rồi thì giữ nguyên
                const parsedImages = typeof service.images === 'string' ? JSON.parse(service.images) : service.images;
                service.images = Array.isArray(parsedImages) ? parsedImages : [parsedImages];
            }
            else {
                service.images = [];
            }
            if (service.amenities) {
                service.amenities = typeof service.amenities === 'string' ? JSON.parse(service.amenities) : service.amenities;
            }
        }
        catch (e) {
            console.error("❌ Lỗi parse JSON ảnh hoặc tiện ích:", e);
        }
        // 4. Render dữ liệu ra giao diện kèm theo tên danh mục
        res.render("admin/pages/service/detail.pug", {
            service: service,
            categoryName: categoryName // Truyền biến này sang file Pug để hiển thị (Ví dụ trong Pug gọi: #{categoryName})
        });
    }
    catch (error) {
        console.error("❌ Lỗi trang chi tiết dịch vụ:", error.message);
        req.flash('error', 'Đã xảy ra lỗi khi tải trang chi tiết.');
        res.redirect("back");
    }
};
// [GET] /admin/service/edit/:id
// export const edit = async (req: Request, res: Response) => {
//     try {
//         const id = req.params.id;
//         const service = await Service.findOne({
//             where: { id: id, is_deleted: 0 },
//             raw: true
//         });
//         if (!service) return res.redirect("back");
//         // Parse dữ liệu cũ để hiện lên form
//         try {
//             (service as any).amenities = JSON.parse((service as any).amenities || "\"\"");
//             (service as any).images = JSON.parse((service as any).images || "[]");
//         } catch (e) {}
//         const artists = await Artist.findAll({ raw: true }) || [];
//         res.render("admin/pages/service/edit", {
//             service: service,
//             artists: artists,
//             message: req.flash()
//         });
//     } catch (error) {
//         res.redirect("back");
//     }
// }
// // [POST] /admin/service/edit/:id
// export const editPost = async (req: Request, res: Response) => {
//     try {
//         const id = req.params.id;
//         const dataUpdate = req.body;
//         // 1. Xử lý images
//         if (dataUpdate.images) {
//             dataUpdate.images = Array.isArray(dataUpdate.images) 
//                 ? JSON.stringify(dataUpdate.images) 
//                 : JSON.stringify([dataUpdate.images]);
//         }
//         // 2. Xử lý duration
//         if (dataUpdate.duration) {
//             dataUpdate.duration = parseInt(dataUpdate.duration.toString().replace(/\D/g, ''));
//         }
//         // 3. Xử lý amenities
//         dataUpdate.amenities = JSON.stringify(dataUpdate.amenities || "");
//         await Service.update(dataUpdate, { where: { id: id } });
//         req.flash("success", "Đã cập nhật thành công!");
//         res.redirect(`${system.prefixAdmin}/services`);
//     } catch (error) {
//         console.error("Lỗi Update:", error);
//         res.redirect("back");
//     }
// };
// [GET] /admin/service/edit/:id
export const edit = async (req, res) => {
    try {
        const id = req.params.id;
        const service = await Service.findOne({
            where: { id: id, is_deleted: 0 },
            raw: true
        });
        if (!service)
            return res.redirect(`/${system.prefixAdmin}/service`);
        // Parse dữ liệu để hiện lên form
        try {
            if (service.images) {
                const parsedImgs = JSON.parse(service.images);
                service.images = Array.isArray(parsedImgs) ? parsedImgs : [parsedImgs];
            }
            else {
                service.images = [];
            }
            // Nếu amenities là chuỗi JSON thì parse, không thì để nguyên
            if (service.amenities) {
                try {
                    service.amenities = JSON.parse(service.amenities);
                }
                catch (e) { /* để nguyên chuỗi */ }
            }
        }
        catch (e) {
            console.error("Lỗi parse dữ liệu Edit:", e);
        }
        res.render("admin/pages/service/edit", {
            service: service,
            message: req.flash()
        });
    }
    catch (error) {
        res.redirect("back");
    }
};
// [PATCH] /admin/service/edit/:id
// export const editPost = async (req: Request, res: Response) => {
//     try {
//         const id = req.params.id;
//         const dataUpdate = req.body;
//         // 1. Xử lý images (Giữ ảnh cũ nếu không chọn ảnh mới)
//         // Kiểm tra nếu có dữ liệu images từ middleware upload gửi lên
//         if (dataUpdate.images && dataUpdate.images.length > 0) {
//             dataUpdate.images = Array.isArray(dataUpdate.images) 
//                 ? JSON.stringify(dataUpdate.images) 
//                 : JSON.stringify([dataUpdate.images]);
//         } else {
//             /**
//              * QUAN TRỌNG: Nếu người dùng không chọn ảnh mới, 
//              * ta xóa luôn key 'images' ra khỏi đối tượng update.
//              * Như vậy Sequelize sẽ không tác động đến cột images trong DB.
//              */
//             delete dataUpdate.images;
//         }
//         // 2. Xử lý duration & price (Ép kiểu số)
//         if (dataUpdate.duration) dataUpdate.duration = parseInt(dataUpdate.duration);
//         if (dataUpdate.price) dataUpdate.price = parseInt(dataUpdate.price);
//         // 3. Xử lý amenities
//         // Lưu ý: Nếu bạn muốn lưu dạng chuỗi để hiện lên textarea thì không cần stringify,
//         // nhưng nếu DB yêu cầu JSON thì giữ nguyên dòng dưới.
//         dataUpdate.amenities = JSON.stringify(dataUpdate.amenities || "");
//         // Thực hiện cập nhật
//         await Service.update(dataUpdate, { where: { id: id } });
//         req.flash("success", "Đã cập nhật thành công!");
//         res.redirect(`/${system.prefixAdmin}/service`);
//     } catch (error) {
//         console.error("Lỗi Update:", error);
//         req.flash("error", "Cập nhật thất bại!");
//         res.redirect("back");
//     }
// };
export const editPost = async (req, res) => {
    try {
        const id = req.params.id;
        const dataUpdate = req.body;
        // QUAN TRỌNG: Kiểm tra xem middleware có gửi ảnh mới về không
        if (dataUpdate.images && dataUpdate.images.length > 0) {
            // Nếu có ảnh mới (là mảng URL), ta stringify để lưu vào DB (cột longtext)
            dataUpdate.images = JSON.stringify(dataUpdate.images);
        }
        else {
            // Nếu KHÔNG có ảnh mới (req.body.images undefined), 
            // ta XÓA LUÔN cái key này để Sequelize không update đè giá trị NULL vào DB
            delete dataUpdate.images;
        }
        // Các trường khác xử lý bình thường
        if (dataUpdate.price)
            dataUpdate.price = parseInt(dataUpdate.price);
        if (dataUpdate.duration)
            dataUpdate.duration = parseInt(dataUpdate.duration);
        // Amenities nếu lưu JSON thì stringify, nếu lưu text thì để nguyên
        // dataUpdate.amenities = JSON.stringify(dataUpdate.amenities || "");
        await Service.update(dataUpdate, { where: { id: id } });
        req.flash("success", "Cập nhật dịch vụ thành công!");
        res.redirect(`/admin/service`);
    }
    catch (error) {
        console.error("Lỗi Controller Edit:", error);
        res.redirect("back");
    }
};
// [PATCH] /admin/service/delete/:id
export const deleted = async (req, res) => {
    try {
        const id = req.params.id;
        // Cập nhật trạng thái xóa
        await Service.update({ is_deleted: 1 }, { where: { id: id } });
        req.flash("success", "Đã xóa dịch vụ thành công!");
        // CHỈNH TẠI ĐÂY: Quay về trang danh sách thay vì quay lại trang detail đã mất
        res.redirect(`/${system.prefixAdmin}/service`);
    }
    catch (error) {
        console.error("Lỗi khi xóa:", error);
        res.redirect(`/${system.prefixAdmin}/service`);
    }
};
