import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { nanoid } from "nanoid";

// Hàm tạo token ngẫu nhiên nếu bạn cần dùng cho tokenUser
const generateShortToken = (length: number) => nanoid(length);

const User = sequelize.define("User", {
  user_id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    // Khớp với default: uuid() trong ảnh của bạn
    defaultValue: DataTypes.UUIDV4 
  },
  tokenUser: {
    type: DataTypes.STRING(11),
    allowNull: false,
    // Nếu bạn muốn tự động tạo token 11 ký tự khi tạo user mới
    defaultValue: () => generateShortToken(11)
  },
  password: {
    // Để 255 để lưu hash (bcrypt) an toàn như đã thảo luận
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true, // Có biểu tượng chìa khóa bạc trong ảnh
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Thêm trường experience như trong ảnh
  experience: {
    type: DataTypes.INTEGER, // Tương ứng với int(11)
    allowNull: true,         // Cột 'Null' là 'Yes'
    defaultValue: 2          // Giá trị mặc định là 2
  },
   biography: {
  type: DataTypes.TEXT, // Chuyển từ STRING sang TEXT
  allowNull: true
},
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Khớp với current_timestamp()
  },
}, {
  // Cấu trúc bảng của bạn chỉ có created_at, không có updated_at
  timestamps: false, 
  tableName: 'users', // Tên bảng thực tế trong DB của bạn
});

export default User;