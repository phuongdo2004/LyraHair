import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { v4 as uuidv4 } from "uuid";
const Booking = sequelize.define("Booking", {
    id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        defaultValue: () => uuidv4(),
    },
    id_customer: {
        type: DataTypes.STRING(36),
        allowNull: false,
        references: {
            model: 'customers',
            key: 'customer_id'
        }
    },
    id_artist: {
        type: DataTypes.STRING(36),
        allowNull: false,
        references: {
            model: 'artists',
            key: 'id'
        }
    },
    id_service: {
        type: DataTypes.STRING(11),
        allowNull: false,
        references: {
            model: 'services',
            key: 'id'
        }
    },
    booking_date: {
        type: DataTypes.DATEONLY, // Lưu dạng YYYY-MM-DD khớp với bookingData.date
        allowNull: false,
    },
    // ĐỔI SANG STRING: Lưu trực tiếp chuỗi "03:00 - 04:00", "04:00 - 05:00" gửi từ Frontend
    slot_time: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    deposit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 100000.00
    },
    remaining_balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('paid', 'pending', 'deposited', 'cancelled'), // Thêm trạng thái huỷ lịch nếu cần
        defaultValue: 'pending',
        allowNull: true,
    },
    is_deleted: {
        type: DataTypes.TINYINT({ length: 1 }),
        allowNull: false,
        defaultValue: 0
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: false,
    tableName: 'bookings',
    collate: 'utf8mb4_general_ci'
});
export default Booking;
