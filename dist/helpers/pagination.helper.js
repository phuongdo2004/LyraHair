import Service from "../model/service.model.js";
export const pagi = async (req, res) => {
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
        // SỬA TẠI ĐÂY: Chỉ count dựa trên cột 'id', không lấy 'rating'
        const count = await Service.count({
            where: {
                is_deleted: 0
            }
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
