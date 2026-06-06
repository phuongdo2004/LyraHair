import { Request, Response } from "express";
import Booking from "../../model/booking.model.js";
import Artist from "../../model/artist.model.js"; // Import trực tiếp model Artist

/**
 * [GET] /bookings/history
 * Lấy danh sách lịch sử đặt lịch của Khách hàng hiện tại
 */
export const history = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Đã vào controller history");
    const currentCustomer = res.locals.Customer;

    if (!currentCustomer || !currentCustomer.customer_id) {
      res.redirect("/user/login");
      return;
    }

    // 1. Lấy danh sách lịch đặt thuần
    const bookings = await Booking.findAll({
      where: {
        id_customer: currentCustomer.customer_id,
        is_deleted: 0 
      },
      order: [["booking_date", "DESC"], ["slot_time", "DESC"]],
      raw: true 
    }) as any[];

    // 2. Chạy vòng lặp bổ sung tên chuyên viên cho từng booking (Cách thủ công đơn giản)
    for (const booking of bookings) {
      if ((booking as any).id_artist) {
        const artist = await Artist.findOne({
          where: { id: (booking as any).id_artist },
          attributes: ["name"],
          raw: true
        });
        // Gán trực tiếp thuộc tính artist_name vào object booking hiện tại
        (booking as any).artist_name = artist ? (artist as any).name : "Chưa phân bổ";
      } else {
        (booking as any).artist_name = "Chưa phân bổ";
      }
    }

    res.render("client/pages/bookings/history.pug", {
      pageTitle: "Lịch sử đặt lịch",
      bookings: bookings 
    });

  } catch (error) {
    console.error("Lỗi khi lấy lịch sử đặt lịch:", error);
    res.redirect("/");
  }
};

/**
 * [GET] /bookings/detail/:id
 * Xem chi tiết một lịch đặt cụ thể của khách hàng
 */
export const getBookingDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookingId = req.params.id;
    const currentCustomer = res.locals.Customer;

    if (!currentCustomer || !currentCustomer.customer_id) {
      res.redirect("/user/login");
      return;
    }

    // 1. Tìm lịch đặt của khách hàng
    const booking = await Booking.findOne({
      where: {
        id: bookingId,
        id_customer: currentCustomer.customer_id,
        is_deleted: 0 
      },
      raw: true 
    });

    if (!booking) {
      req.flash("error", "Không tìm thấy thông tin lịch hẹn hoặc em không có quyền xem!");
      res.redirect("/bookings/history");
      return;
    }

    // 2. Tìm tên của chuyên viên dựa vào id_artist lấy được từ booking trên
    let artistName = "Chưa phân bổ";
    if ((booking as any).id_artist) {
      const artist = await Artist.findOne({
        where: { id: (booking as any).id_artist },
        attributes: ["name"],
        raw: true
      });
      if (artist) {
        artistName = (artist as any).name;
      }
    }

    res.render("client/pages/bookings/detail", {
      pageTitle: `Chi tiết lịch hẹn`,
      booking: booking,
      artistName: artistName // Truyền trực tiếp chuỗi tên thợ sang view
    });

  } catch (error) {
    console.error("Lỗi khi lấy chi tiết lịch đặt:", error);
    req.flash("error", "Đã xảy ra lỗi hệ thống khi tải chi tiết lịch hẹn!");
    res.redirect("/bookings/history");
  }
};