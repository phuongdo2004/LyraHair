import Booking from "../../model/booking.model.js";
import { customerRouter } from "../../router/admin/customers.route.js";
import axios from "axios";
import { createHmac } from "crypto";
import { Request, Response } from 'express';
import { system } from "../../config/system.js";
import { sendMail } from "../../helpers/sendMail.helper.js";
import Customer from "../../model/customer.model.js";

export const payment = async (req: Request, res: Response) => {
  try {
    console.log("🚀 Bắt đầu xử lý payment với dữ liệu:", req.body);
    const data = req.body;
    const customer = res.locals.Customer;

    if (!data.booking_date || !customer) {
      return res.status(400).send("Thiếu thông tin ngày đặt hoặc khách hàng.");
    }

    // 1. Chuẩn hóa định dạng ngày sang YYYY-MM-DD
    let formattedDate = data.booking_date;
    if (data.booking_date.includes('/')) {
      const parts = data.booking_date.split('/');
      if (parts.length === 3) {
        formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      } else {
        return res.status(400).send("Định dạng ngày không hợp lệ.");
      }
    }

    // 2. Tạo một Order ID ngẫu nhiên bằng cách kết hợp thời gian (Momo cần orderId duy nhất mỗi lượt bấm)
    const orderId = `BOOKING_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    let {
      accessKey,
      secretKey,
      orderInfo,
      partnerCode,
      requestType,
      orderGroupId,
      autoCapture,
      lang,
    } = system;
    
    const ipnUrl = process.env.ipnUrl || "";
    const redirectUrl = process.env.redirectUrl || "";
    const requestId = orderId;
    const amount = (data.deposit || 100000).toString(); 

    // 3. ĐÓNG GÓI TOÀN BỘ THÔNG TIN ĐẶT LỊCH VÀO extraData DƯỚI DẠNG CHUỖI BASE64 HOẶC JSON TRƠN
    // MoMo cho phép truyền dữ liệu tùy biến qua trường extraData (Tối đa 4KB)
    const bookingInfoRaw = {
      id_service: data.id_service,
      id_artist: data.id_artist,
      id_customer: customer.customer_id,
      address: data.address,
      booking_date: formattedDate,
      slot_time: data.slot_time,
      price: parseFloat(data.price) || 0,
      deposit: parseFloat(data.deposit) || 100000,
      remaining_balance: parseFloat(data.remaining_balance) || 0
    };
    
    // Mã hóa JSON sang chuỗi Base64 để tránh lỗi ký tự đặc biệt khi truyền qua môi trường URL/API của MoMo
    const extraData = Buffer.from(JSON.stringify(bookingInfoRaw)).toString("base64");

    // 4. Tạo chuỗi ký Signature MoMo (Bắt buộc bao gồm extraData mới sinh)
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    // 5. Gom dữ liệu gửi lên Gateway MoMo
    const requestBodyObject = {
      partnerCode,
      partnerName: 'Susannie Studio',
      storeId: 'SusannieStore',
      requestId,
      amount, 
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang,
      requestType,
      autoCapture,
      extraData, // Chứa cục data ẩn của chúng ta
      orderGroupId,
      signature
    };
    
    const requestBody = JSON.stringify(requestBodyObject);

    const options = {
      method: 'POST',
      url: 'https://test-payment.momo.vn/v2/gateway/api/create',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
      data: requestBody,
    };

    let result = await axios(options);
    
    if (result.data && result.data.payUrl) {
      // Chuyển hướng đi thanh toán, CHƯA LƯU GÌ VÀO DATABASE BẢNG BOOKINGS
      return res.redirect(result.data.payUrl);
    } else {
      return res.status(400).send("Không thể khởi tạo thanh toán MoMo: " + result.data.message);
    }

  } catch (error: any) {
    console.error("Lỗi trong payment:", error.message);
    return res.status(500).json({ statusCode: 500, message: error.message });    
  }
};

// export const paymentCallback = async (req: Request, res: Response) => {
//   try {
//     console.log("🚀 Bắt đầu xử lý paymentCallback với dữ liệu:", req.body);
//     const { resultCode, extraData, orderId } = req.body;
    
//     // resultCode == 0 nghĩa là người dùng đã quét mã và trừ tiền thành công 100%
//     if (resultCode == 0) {
//       if (!extraData) {
//         console.error("❌ Nhận được thông báo thành công nhưng thiếu extraData chứa thông tin lịch đặt!");
//         return res.sendStatus(400);
//       }

//       // Giải mã ngược chuỗi Base64 từ MoMo gửi về để lấy lại Object dữ liệu đặt lịch ban đầu
//       const decodedDataRaw = Buffer.from(extraData, 'base64').toString('utf-8');
//       const bookingData = JSON.parse(decodedDataRaw);

//       // TIẾN HÀNH TẠO MỚI BẢN GHI TRONG DATABASE
//       const confirmedBooking = await Booking.create({
//         id_service: bookingData.id_service,
//         id_artist: bookingData.id_artist,
//         id_customer: bookingData.id_customer,
//         address: bookingData.address,
//         booking_date: bookingData.booking_date,
//         slot_time: bookingData.slot_time, 
//         price: bookingData.price,
//         deposit: bookingData.deposit, 
//         remaining_balance: bookingData.remaining_balance, 
//         status: "deposited" // Set thẳng thành đã đặt cọc thành công
//       });
//       // ---- ĐOẠN CODE KÍCH HOẠT GỬI MAIL TỰ ĐỘNG ----
//       const customer = await Customer.findOne({ where: { customer_id: bookingData.id_customer } }) as any;
// if (customer && customer.email) {
//   // 1. Chuẩn bị nội dung hiển thị trong Email (Dạng HTML)
//   const emailContent = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 10px;">
//       <h2 style="color: #D2B48C; text-align: center; font-style: italic;">XÁC NHẬN ĐẶT CỌC THÀNH CÔNG</h2>
//       <p>Xin chào <strong>${customer.fullName}</strong>,</p>
//       <p>Studio đã nhận được khoản tiền đặt cọc 100.000đ cho lịch hẹn làm đẹp của bạn.</p>
      
//       <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
//         <tr style="background-color: #f9f9f9;"><td style="padding: 10px; font-weight: bold;">Mã lịch đặt:</td><td style="padding: 10px;">#${confirmedBooking.get('id').substring(0, 8)}</td></tr>
//         <tr><td style="padding: 10px; font-weight: bold;">Khung giờ:</td><td style="padding: 10px;">${confirmedBooking.get('slot_time')} - Ngày ${confirmedBooking.get('booking_date')}</td></tr>
//         <tr style="background-color: #f0fdf4; color: #166534;"><td style="padding: 10px; font-weight: bold;">Số tiền đã cọc:</td><td style="padding: 10px; font-weight: bold;">100.000 đ</td></tr>
//         <tr style="background-color: #fffbeb; color: #9a3412;"><td style="padding: 10px; font-weight: bold;">Số tiền còn lại:</td><td style="padding: 10px; font-weight: bold;">${(Number(confirmedBooking.get('price') ) - 100000).toLocaleString('vi-VN')} đ</td></tr>
//       </table>
//       <p style="text-align: center; font-size: 12px; color: #999;">Cảm ơn bạn đã lựa chọn dịch vụ!<br><strong>Studio Makeup</strong></p>
//     </div>
//   `;

//   // 2. Kích hoạt lệnh gửi mail chạy ngầm (không dùng await để user không phải đợi xoay màn hình)
//   sendMail({
//     to: customer.email, // Email của khách hàng lấy từ DB
//     subject: `[Studio Makeup] Xác nhận đặt cọc thành công #${confirmedBooking.get('id') .substring(0, 8)}`,
//     html: emailContent
//   });
// }
// // ----------------------------------------------

//       console.log(`✅ Khách hàng thanh toán thành công. Lịch đặt mới đã được ghi nhận lưu vào DB. ID: ${confirmedBooking.get('id')}`);
//     } else {
//       // Người dùng tắt trình duyệt, bấm nút hủy hoặc tài khoản không đủ tiền...
//       console.log(`❌ Giao dịch MoMo ${orderId} không thành công (Code: ${resultCode}). Không có bản ghi nào được tạo.`);
//     }

//     // Trả về status 200 báo cho MoMo biết hệ thống đã xử lý xong IPN
//     return res.sendStatus(200);
//   } catch (error: any) {
//     console.error("Lỗi trong paymentCallback:", error.message);
//     return res.sendStatus(500);
//   }
// }
export const paymentCallback = async (req: Request, res: Response) => {
  try {
    console.log("kkdfo");
    
    console.log("🚀 Bắt đầu xử lý paymentCallback với dữ liệu:", req.body);
    const { resultCode, extraData, orderId } = req.body;
    
    // resultCode == 0 nghĩa là người dùng đã quét mã và trừ tiền thành công 100%
    if (resultCode == 0) {
      if (!extraData) {
        console.error("❌ Nhận được thông báo thành công nhưng thiếu extraData chứa thông tin lịch đặt!");
        return res.sendStatus(400);
      }

      // Giải mã ngược chuỗi Base64 từ MoMo gửi về để lấy lại Object dữ liệu đặt lịch ban đầu
      const decodedDataRaw = Buffer.from(extraData, 'base64').toString('utf-8');
      const bookingData = JSON.parse(decodedDataRaw);

      // TIẾN HÀNH TẠO MỚI BẢN GHI TRONG DATABASE
      const newBookingInstance = await Booking.create({
        id_service: bookingData.id_service,
        id_artist: bookingData.id_artist,
        id_customer: bookingData.id_customer,
        address: bookingData.address,
        booking_date: bookingData.booking_date,
        slot_time: bookingData.slot_time, 
        price: bookingData.price,
        deposit: bookingData.deposit, 
        remaining_balance: bookingData.remaining_balance, 
        status: "deposited" // Set thẳng thành đã đặt cọc thành công
      });

      // Chuyển bản ghi vừa tạo thành Object phẳng để lấy dữ liệu dễ dàng không bị lỗi TypeScript
      const confirmedBooking = newBookingInstance.get({ plain: true }) as any;

      // ---- ĐOẠN CODE KÍCH HOẠT GỬI MAIL TỰ ĐỘNG ----
      const customer = await Customer.findOne({ 
        where: { customer_id: confirmedBooking.id_customer },
        raw: true
      }) as any;

      if (customer && customer.email) {
        // Định dạng số tiền để hiển thị trong email
        const depositAmount = confirmedBooking.deposit ? Number(confirmedBooking.deposit).toLocaleString('vi-VN') : '100.000';
        const remainingAmount = confirmedBooking.remaining_balance ? Number(confirmedBooking.remaining_balance).toLocaleString('vi-VN') : '0';

        // 1. Chuẩn bị nội dung hiển thị trong Email (Dạng HTML)
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 10px;">
            <h2 style="color: #D2B48C; text-align: center; font-style: italic;">XÁC NHẬN ĐẶT CỌC THÀNH CÔNG</h2>
            <p>Xin chào <strong>${customer.fullName}</strong>,</p>
            <p>Studio đã nhận được khoản tiền đặt cọc cho lịch hẹn làm đẹp của bạn. Dưới đây là thông tin chi tiết lịch đặt:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="background-color: #f9f9f9;">
                <td style="padding: 10px; font-weight: bold;">Mã lịch đặt:</td>
                <td style="padding: 10px;">#${confirmedBooking.id.substring(0, 8)}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Khung giờ:</td>
                <td style="padding: 10px;">${confirmedBooking.slot_time} - Ngày ${confirmedBooking.booking_date}</td>
              </tr>
              <tr style="background-color: #f0fdf4; color: #166534;">
                <td style="padding: 10px; font-weight: bold;">Số tiền đã cọc:</td>
                <td style="padding: 10px; font-weight: bold;">${depositAmount} đ</td>
              </tr>
              <tr style="background-color: #fffbeb; color: #9a3412;">
                <td style="padding: 10px; font-weight: bold;">Số tiền còn lại:</td>
                <td style="padding: 10px; font-weight: bold;">${remainingAmount} đ</td>
              </tr>
            </table>
            <p style="text-align: center; font-size: 12px; color: #999;">Cảm ơn bạn đã lựa chọn dịch vụ!<br><strong>Studio Makeup</strong></p>
          </div>
        `;

        // 2. Kích hoạt lệnh gửi mail chạy ngầm
        sendMail({
          to: customer.email,
          subject: `[Studio Makeup] Xác nhận đặt cọc thành công #${confirmedBooking.id.substring(0, 8)}`,
          html: emailContent
        });
      }
      // ----------------------------------------------

      console.log(`✅ Khách hàng thanh toán thành công. Lịch đặt mới đã được ghi nhận lưu vào DB. ID: ${confirmedBooking.id}`);
    } else {
      // Người dùng tắt trình duyệt, bấm nút hủy hoặc tài khoản không đủ tiền...
      console.log(`❌ Giao dịch MoMo ${orderId} không thành công (Code: ${resultCode}). Không có bản ghi nào được tạo.`);
    }

    // Trả về status 200 báo cho MoMo biết hệ thống đã xử lý xong IPN
    return res.sendStatus(200);
  } catch (error: any) {
    console.error("Lỗi trong paymentCallback:", error.message);
    return res.sendStatus(500);
  }
};