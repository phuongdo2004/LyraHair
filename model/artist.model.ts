import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Artist = sequelize.define("Artist", {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4 
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  avatar: {
    type: DataTypes.TEXT("long"), 
    allowNull: true,
  },
  experience: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 2
  },
  rating: {
    type: DataTypes.DOUBLE, 
    allowNull: true,
    defaultValue: 5.0
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: "active"
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
  },
  biography: {
    type: DataTypes.TEXT, 
    allowNull: true
  },
  // ĐÃ XÓA time_start và time_end ở đây.
  // Lý do: Em đã quy định khung giờ chung (3h - 21h) cho toàn bộ hệ thống ở bảng Booking, 
  // nên không cần lưu thời gian bắt đầu/kết thúc riêng lẻ ở từng Artist nữa cho đỡ rối.

 created_at: {
  type: DataTypes.DATE,
  allowNull: false,
  defaultValue: DataTypes.NOW,
  field: 'created_at' // Đảm bảo Sequelize biết cột này tên là created_at trong DB
},
}, {
  timestamps: false, 
  tableName: 'artist', // Anh đổi thành số nhiều cho đúng chuẩn đặt tên bảng
});

export default Artist;