import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { nanoid } from "nanoid";
const generateShortId = (length) => nanoid(length);
const Comment = sequelize.define("Comment", {
    id: {
        type: DataTypes.STRING(36), // Khớp với varchar(36) trong ảnh
        primaryKey: true,
        defaultValue: () => generateShortId(36)
    },
    customer_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
        references: {
            model: 'customers', // Tên bảng thực tế trong DB
            key: 'customer_id'
        }
    },
    service_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
        references: {
            model: 'services',
            key: 'id'
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    rating: {
        type: DataTypes.FLOAT, // Khớp với float trong ảnh
        allowNull: false,
        defaultValue: 5 // Giá trị mặc định là 5
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW, // Tương đương CURRENT_TIMESTAMP
    }
}, {
    timestamps: false, // Tắt timestamps tự động vì bạn đã có created_at
    tableName: 'comments', // Khớp với tên bảng trong database
});
export default Comment;
