import Service from "../model/service.model.js";
// ĐÃ SỬA TẠI ĐÂY: Nhận thêm tham số findCondition (mặc định là { is_deleted: 0 })
export const pagi = async (req, res, findCondition = { is_deleted: 0 }) => {
    const pagination = {
        currentPage: 1,
        limitItem: 6,
        skip: 0,
        totalPage: 0,
        count: 0,
    };
    if (req.query.page) {
        const pageNumber = parseInt(req.query.page);
        if (!isNaN(pageNumber) && pageNumber > 0) {
            pagination.currentPage = pageNumber;
        }
    }
    pagination.skip = (pagination.currentPage - 1) * pagination.limitItem;
    try {
        // ĐÃ SỬA TẠI ĐÂY: Đếm dựa trên findCondition động truyền từ controller vào
        const count = await Service.count({
            where: findCondition
        });
        pagination.count = count;
        pagination.totalPage = Math.ceil(count / pagination.limitItem);
    }
    catch (error) {
        console.error("Lỗi khi đếm số lượng dịch vụ:", error);
        pagination.count = 0;
        pagination.totalPage = 0;
    }
    return pagination;
};
