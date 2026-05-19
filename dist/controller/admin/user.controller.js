import md5 from "md5";
import User from "../../model/user.model.js";
import { system } from "../../config/system.js";
import { formatDate } from "../../helpers/formatDate.helper.js";
export const index = async (req, res) => {
    const user = res.locals.user;
    console.log(user.created_at);
    user.createdAt = formatDate(new Date(user.created_at));
    // console.log(user.createdAt);
    res.render("admin/pages/user/profile.pug", { user: user });
};
export const edit = async (req, res) => {
    const user = res.locals.user;
    res.render("admin/pages/user/edit.pug", { user: user,
        message: req.flash()
    });
};
export const patchEdit = async (req, res) => {
    try {
        console.log(req.body);
        const userId = res.locals.user.user_id;
        const { fullName, email, phone, address, biography } = req.body;
        if (!req.body.avatar) {
            req.body.avatar = res.locals.user.avatar;
        }
        let avatar = req.body.avatar;
        // if(req.files && (req.files as any)["avatar"] && (req.files as any)["avatar"].length > 0) {
        //   avatar = (req.files as any)["avatar"][0].path;
        // }
        // console.log(avatar);
        avatar = JSON.stringify(avatar);
        // console.log(avatar);
        await User.update({
            fullName: fullName,
            email: email,
            phone: phone,
            address: address,
            biography: biography,
            avatar: avatar
        }, {
            where: {
                user_id: userId
            }
        });
        req.flash("success", "Cập nhật thông tin thành công!");
        // THÊM RETURN Ở ĐÂY để dừng hàm
        res.redirect(`/${system.prefixAdmin}/profile/edit`);
    }
    catch (error) {
        console.log(error);
        // Nếu có lỗi cũng phải return để không chạy xuống dưới
        if (!res.headersSent) {
            res.redirect(`/${system.prefixAdmin}/profile/edit`);
        }
    }
};
export const register = async (req, res) => {
    res.render("admin/pages/user/signin");
};
export const postRegister = async (req, res) => {
    const password = md5(req.body.password);
    const user = req.body;
    user.password = password;
    await User.create(user);
    res.send("da gui thanh cong");
};
export const login = async (req, res) => {
    res.render("admin/pages/user/login.pug", {
        message: req.flash()
    });
};
export const postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Mã hóa mật khẩu để so khớp
        const md5Password = md5(password);
        const user = await User.findOne({
            where: {
                email: email,
                password: md5Password,
            },
            raw: true,
        });
        if (user) {
            // Lưu token vào cookie
            // Ép kiểu (user as any) hoặc định nghĩa Interface cho User để lấy tokenUser
            res.cookie("token", user.tokenUser, {
                path: '/', // Nên để '/' để token có hiệu lực toàn trang hoặc '/admin'
                expires: new Date(Date.now() + 8 * 3600000), // Cookie hết hạn sau 8 tiếng
                httpOnly: true // Bảo mật hơn, ngăn JS phía client can thiệp
            });
            req.flash("success", "Đã đăng nhập thành công!");
            // QUAN TRỌNG: Phải redirect về dashboard, không dùng render trực tiếp
            res.redirect(`/${system.prefixAdmin}/dashboard`);
        }
        else {
            req.flash("error", "Email hoặc mật khẩu không đúng!");
            // Quay lại trang login (dùng đường dẫn tuyệt đối cho chắc chắn)
            res.redirect(`/${system.prefixAdmin}/auth/login`);
        }
    }
    catch (error) {
        console.error("Login Error:", error);
        req.flash("error", "Có lỗi hệ thống xảy ra!");
        res.redirect(`/${system.prefixAdmin}/auth/login`);
    }
};
export const logout = async (req, res) => {
    res.clearCookie("token", { path: '/' });
    res.redirect(`/${system.prefixAdmin}/auth/login`);
};
