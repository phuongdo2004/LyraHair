// import { StreamUpload } from "../../helpers/streamUpload.helper.js";
// import { NextFunction, Request, Response } from "express";
// import Service from "../../model/service.model.js";
//   export const uploadCloud = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     console.log("middleware uploadCloud called");
//     const files = req.files as { [fieldname: string]: Express.Multer.File[] } | any;

//     // KIỂM TRA: Object có tồn tại VÀ có ít nhất một trường file hay không
//     if (files && Object.keys(files).length > 0) {
//       console.log("Thực hiện upload ảnh mới lên Cloudinary");
      
//       for (const key in files) {
//         let images: string[] = [];

//         for (const element of files[key]) {
//           const result: any = await StreamUpload(element.buffer);
//           images.push(result["url"]);
//         }

//         // Lưu mảng URL vào body để chuyển tiếp sang Controller
//         req.body[key] = images;
//       }
//     } else {
//       console.log("Không chọn ảnh mới, giữ nguyên ảnh cũ từ CSDL");
      
//       // Lấy ID từ params hoặc body tùy vào route của bạn
//       const id = req.params.id || req.body.id;
//       if (id) {
//         const service = await Service.findOne({
//           where: { id: id }
//         });

//         if (service) {
//           // Gán lại mảng ảnh cũ vào body để không bị mất dữ liệu khi update
//           req.body["images"] = (service as any).images;
//         }
//       }else{
        
//       }
//     }

//     next();
//   } catch (error) {
//     console.log("Lỗi Upload Cloud:", error);
//     res.status(500).send("Upload failed");
//   }
// };

import { StreamUpload } from "../../helpers/streamUpload.helper.js";
import { NextFunction, Request, Response } from "express";

export const uploadCloud = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Middleware uploadCloud called");
    
    // Ép kiểu files từ Multer
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[] | any;

    /**
     * TRƯỜNG HỢP 1: Nếu upload nhiều file (multer.array hoặc multer.fields)
     * req.files sẽ tồn tại
     */
    if (files && (Array.isArray(files) ? files.length > 0 : Object.keys(files).length > 0)) {
      console.log("Phát hiện ảnh mới, bắt đầu upload lên Cloudinary...");

      // Xử lý nếu là multer.fields (Object)
      if (!Array.isArray(files)) {
        for (const key in files) {
          const images: string[] = [];
          for (const file of files[key]) {
            const result: any = await StreamUpload(file.buffer);
            images.push(result["url"]);
          }
          req.body[key] = images; // Gán mảng URL vào body (ví dụ: req.body.images)
        }
      } 
      // Xử lý nếu là multer.array (Array)
      else {
        const images: string[] = [];
        for (const file of files) {
          const result: any = await StreamUpload(file.buffer);
          images.push(result["url"]);
        }
        req.body["images"] = images;
      }
    } 
    /**
     * TRƯỜNG HỢP 2: Không chọn ảnh mới
     * Chúng ta KHÔNG gán bất cứ thứ gì vào req.body["images"]
     * Để Controller biết đường mà giữ lại ảnh cũ.
     */
    else {
      console.log("Người dùng không chọn ảnh mới.");
    }

    next();
  } catch (error) {
    console.log("Lỗi Upload Cloud:", error);
    res.status(500).send("Upload failed");
  }
};