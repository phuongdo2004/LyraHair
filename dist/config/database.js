import { Sequelize } from "sequelize";
import 'dotenv/config';
export const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD, {
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT) || 3306, // Lấy port từ .env
    dialect: 'mysql',
    logging: false, // Tắt log để console sạch hơn
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false, // Cực kỳ quan trọng để kết nối được với Clever Cloud
        },
    },
    timezone: "+07:00", // Để khớp múi giờ Việt Nam
});
sequelize.authenticate().then(() => {
    console.log("✅ Kết nối Database Cloud thành công!");
}).catch((error) => {
    console.log("❌ Kết nối Database thất bại:");
    console.error(error);
});
