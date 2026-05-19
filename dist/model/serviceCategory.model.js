import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { nanoid } from "nanoid";
const generateShortId = (length) => nanoid(length);
const ServiceCategory = sequelize.define("ServiceCategory", {
    id: {
        type: DataTypes.STRING(11),
        primaryKey: true,
        defaultValue: () => generateShortId(11)
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true // Đảm bảo tên danh mục không bị trùng lặp
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
    }
}, {
    timestamps: false,
    tableName: 'service_categories', // Tên bảng dạng số nhiều bằng tiếng Anh
});
export default ServiceCategory;
