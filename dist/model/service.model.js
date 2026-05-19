import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { nanoid } from "nanoid";
const generateShortId = (length) => nanoid(length);
const Service = sequelize.define("Service", {
    id: {
        type: DataTypes.STRING(11),
        primaryKey: true,
        defaultValue: () => generateShortId(11)
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    category_id: {
        type: DataTypes.STRING(11),
        allowNull: true, // Để true để dữ liệu cũ không bị lỗi khi chưa có category
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    // ĐÃ XÓA RATING TẠI ĐÂY
    duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 60
    },
    amenities: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
    },
    images: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
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
    tableName: 'services',
});
export default Service;
