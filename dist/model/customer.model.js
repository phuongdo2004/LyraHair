import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { nanoid } from "nanoid";
// Hàm tạo token ngẫu nhiên nếu bạn cần dùng cho tokenUser
const generateShortToken = (length) => nanoid(length);
const Customer = sequelize.define("Customer", {
    customer_id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        // Khớp với default: uuid() trong ảnh của bạn
        defaultValue: DataTypes.UUIDV4
    },
    tokenCustomer: {
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
    // favorites: {
    //   type: DataTypes.TEXT,
    //   allowNull: true,
    //   defaultValue: "[]", // Lưu chuỗi JSON mảng rỗng mặc định
    //  // Trong customer.model.ts phần get() và set()
    //   get() {
    //     const self = this as any; // Ép kiểu để thoát khỏi kiểm tra nghiêm ngặt của TS
    //     const rawValue = self.getDataValue('favorites');
    //     return rawValue ? JSON.parse(rawValue) : [];
    //   },
    //   set(value: string[]) {
    //     const self = this as any;
    //     self.setDataValue('favorites', JSON.stringify(value));
    //   }
    // },
    favorites: {
        type: DataTypes.TEXT, // hoặc JSON tùy DB
        allowNull: true,
        defaultValue: "[]",
        get() {
            const rawValue = this.getDataValue('favorites');
            if (!rawValue)
                return []; // Nếu null thì trả về mảng rỗng
            try {
                // Chỉ parse nếu nó là chuỗi có cấu trúc JSON (bắt đầu bằng [ hoặc {)
                return typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
            }
            catch (e) {
                console.error("Lỗi parse JSON tại field favorites:", rawValue);
                return []; // Nếu lỗi parse (như lỗi 'C' bạn gặp) thì trả về mảng rỗng để web không sập
            }
        },
        set(value) {
            this.setDataValue('favorites', JSON.stringify(value));
        }
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW, // Khớp với current_timestamp()
    },
}, {
    // Cấu trúc bảng của bạn chỉ có created_at, không có updated_at
    timestamps: false,
    tableName: 'customers', // Tên bảng thực tế trong DB của bạn
});
export default Customer;
