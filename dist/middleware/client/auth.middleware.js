import Customer from "../../model/customer.model.js";
export const requireAuth = async (req, res, next) => {
    if (!req.cookies.tokenCustomer) {
        if (req.path !== `/auth/login`) {
            return res.redirect(`/user/login`);
        }
        return next();
    }
    else {
        const token = req.cookies.tokenCustomer;
        const customer = await Customer.findOne({
            where: {
                tokenCustomer: token
            },
            raw: true
        });
        if (customer) {
            res.locals.Customer = customer;
            // lay avatar
            if (customer) {
                res.locals.Customer = customer;
                // Kiểm tra và xử lý avatar an toàn
                if (customer.avatar) {
                    try {
                        // Chỉ parse nếu chuỗi trông có vẻ là mảng JSON (bắt đầu bằng [ )
                        if (typeof customer.avatar === 'string' && customer.avatar.startsWith('[')) {
                            customer.avatar = JSON.parse(customer.avatar);
                        }
                        else if (typeof customer.avatar === 'string') {
                            // Nếu là chuỗi đường dẫn bình thường, bọc nó vào mảng để đồng bộ với file Pug (.avatar[0])
                            customer.avatar = [customer.avatar];
                        }
                    }
                    catch (e) {
                        // Nếu parse lỗi, coi như đó là chuỗi đường dẫn và bọc vào mảng
                        customer.avatar = [customer.avatar];
                    }
                }
                else {
                    // Nếu không có avatar, gán mảng chứa ảnh mặc định
                    customer.avatar = ["/uploads/avatar-default.jpg"];
                }
                // Kiểm tra và xử lý favorites an toàn
                if (customer.favorites) {
                    if (typeof customer.favorites === 'string') {
                        try {
                            customer.favorites = JSON.parse(customer.favorites);
                        }
                        catch (e) {
                            customer.favorites = [];
                        }
                    }
                }
                else {
                    customer.favorites = [];
                }
                return next();
            }
            return next();
        }
        else {
            return res.redirect(`/user/login`);
        }
    }
};
