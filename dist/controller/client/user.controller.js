import md5 from "md5";
import Customer from "../../model/customer.model.js";
export const login = async (req, res) => {
    res.render("client/pages/user/login.pug", {
        message: req.flash(),
    });
};
export const postLogin = async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = md5(password);
    const customer = await Customer.findOne({
        where: {
            email: email,
            password: hashedPassword
        }
    });
    console.log(customer);
    if (customer) {
        console.log("Đăng nhập thành công");
        const customerData = customer.get ? customer.get() : customer;
        res.cookie("tokenCustomer", customerData.tokenCustomer);
        req.flash("success", "Đăng nhập thành công");
        res.redirect("/home/");
    }
    else {
        req.flash("error", "Email hoặc mật khẩu không đúng");
        res.redirect("/user/login");
    }
};
export const register = async (req, res) => {
    res.render("client/pages/user/register.pug", { message: req.flash(), });
};
// export const postRegister = async(req:Request, res:Response) => {
//   // Lấy dữ liệu từ form đăng ký
//   const { fullName, email, password } = req.body; 
//   const hashedPassword = md5(password);
//   console.log(hashedPassword);
//   // Lưu dữ liệu người dùng vào cơ sở dữ liệu (giả sử bạn có hàm saveUser)
//  const customer= await Customer.create({
//   fullName: fullName,
//   email: email,
//   password: hashedPassword
// })
//   await customer.save();
//   // Chuyển hướng người dùng đến trang đăng nhập sau khi đăng ký thành công
//   res.redirect("/user/login");
// }
export const postRegister = async (req, res) => {
    try {
        // 1. Lấy dữ liệu từ form đăng ký
        const { fullName, email, password } = req.body;
        const hashedPassword = md5(password);
        // 2. Tạo bản ghi mới bằng Customer.create()
        // KHÔNG truyền trường tokenCustomer vào đây, hệ thống sẽ tự sinh 11 ký tự dựa trên Schema của bạn
        // KHÔNG dùng thêm lệnh .save() ở phía dưới vì .create() đã tự lưu rồi
        await Customer.create({
            fullName: fullName,
            email: email,
            password: hashedPassword
            // Trường customer_id cũng tự động nhận UUIDV4 từ Schema luôn nhé
        });
        req.flash("success", "Đăng ký tài khoản thành công!");
        // 3. Chuyển hướng người dùng đến trang đăng nhập
        res.redirect("/user/login");
    }
    catch (error) {
        // In lỗi chi tiết ra terminal nếu sau này phát sinh thêm lỗi trường khác
        console.error("❌ Lỗi chi tiết tại postRegister:", error.message);
        req.flash("error", "Đăng ký thất bại, vui lòng thử lại!");
        res.redirect("back");
    }
};
export const toggleFavorite = async (req, res) => {
    const { serviceId } = req.body;
    const customer = res.locals.customer; // Giả sử bạn đã lấy user từ middleware
    // Vì chúng ta đã dùng get() ở model, favorite_services sẽ là một Array
    let favorites = customer.favorite_services || [];
    if (favorites.includes(serviceId)) {
        // Nếu có rồi thì xóa đi (Unfavorite)
        favorites = favorites.filter(id => id !== serviceId);
    }
    else {
        // Nếu chưa có thì thêm vào
        favorites.push(serviceId);
    }
    // Cập nhật lại vào DB
    await Customer.update({ favorites: favorites }, { where: { customer_id: customer.customer_id } });
    res.json({ message: "Cập nhật yêu thích thành công", favorites });
};
export const profile = async (req, res) => {
    const customer = res.locals.Customer;
    // 1. Kiểm tra nếu avatar không tồn tại hoặc là chuỗi rỗng
    if (!customer.avatar) {
        // Gán thành mảng chứa ảnh mặc định để user.avatar[0] hoạt động
        customer.avatar = ["/uploads/avatar-default.jpg"];
    }
    else {
        // 2. Nếu avatar đang là chuỗi (string) từ DB, hãy biến nó thành mảng
        if (typeof customer.avatar === 'string') {
            // Nếu là chuỗi JSON mảng thì parse, nếu là chuỗi thường thì bọc vào mảng
            try {
                customer.avatar = JSON.parse(customer.avatar);
            }
            catch (e) {
                customer.avatar = [customer.avatar];
            }
        }
    }
    res.render("client/pages/user/profile.pug", {
        user: customer,
    });
};
export const edit = async (req, res) => {
    const customer = res.locals.Customer;
    if (!customer.avatar) {
        // Gán thành mảng chứa ảnh mặc định để user.avatar[0] hoạt động
        customer.avatar = ["/uploads/avatar-default.jpg"];
    }
    else {
        // 2. Nếu avatar đang là chuỗi (string) từ DB, hãy biến nó thành mảng
        if (typeof customer.avatar === 'string') {
            // Nếu là chuỗi JSON mảng thì parse, nếu là chuỗi thường thì bọc vào mảng
            try {
                customer.avatar = JSON.parse(customer.avatar);
            }
            catch (e) {
                customer.avatar = [customer.avatar];
            }
        }
    }
    res.render("client/pages/user/edit.pug", {
        user: customer,
        message: req.flash(),
    });
};
export const patchEdit = async (req, res) => {
    const { fullName, email, phone, address } = req.body;
    const getAvatarUrl = (avatarValue) => {
        if (!avatarValue)
            return null;
        if (Array.isArray(avatarValue)) {
            return avatarValue.length > 0 ? avatarValue[0] : null;
        }
        if (typeof avatarValue === 'string') {
            const trimmed = avatarValue.trim();
            if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                try {
                    const parsed = JSON.parse(trimmed);
                    return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
                }
                catch (_e) {
                    return trimmed;
                }
            }
            return trimmed;
        }
        return String(avatarValue);
    };
    let avatarUrl = getAvatarUrl(req.body.avatar || res.locals.Customer?.avatar);
    const updateData = { fullName, email, phone, address };
    if (avatarUrl) {
        updateData.avatar = JSON.stringify([avatarUrl]);
    }
    await Customer.update(updateData, {
        where: {
            tokenCustomer: (res.locals.Customer).tokenCustomer,
        }
    });
    req.flash("success", "Cập nhật hồ sơ thành công!");
    res.redirect("/user/profile");
};
