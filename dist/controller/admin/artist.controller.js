import Artist from "../../model/artist.model.js";
import { system } from "../../config/system.js";
export const index = async (req, res) => {
    const artists = await Artist.findAll({ where: { status: 'active' } });
    for (const artist of artists) {
        if (artist["avatar"]) {
            artist["avatar"] = (JSON.parse(artist["avatar"]))[0];
        }
    }
    res.render("admin/pages/artists/index.pug", {
        artists: artists,
        message: req.flash(),
    });
};
export const create = async (req, res) => {
    res.render("admin/pages/artists/create.pug", {
        message: req.flash(),
    });
};
export const createPost = async (req, res) => {
    try {
        console.log("start");
        const newArtist = req.body;
        newArtist.avatar = JSON.stringify(req.body.avatar);
        const artist = await Artist.create(newArtist);
        console.log("okk");
        await artist.save();
        req.flash("success", "Tạo nghệ sĩ thành công");
        res.redirect("/admin/artists");
    }
    catch (error) {
        console.error(error);
    }
};
// [GET] /admin/artists/detail/:id
export const detail = async (req, res) => {
    // try {
    const artistId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!artistId) {
        return res.status(400).send("ID nghệ sĩ không hợp lệ");
    }
    else {
        const artist = await Artist.findByPk(artistId);
        if (artist["avatar"]) {
            artist["avatar"] = (JSON.parse(artist["avatar"]))[0];
        }
        res.render("admin/pages/artists/detail.pug", {
            artist: artist,
        });
    }
    // }
    //   catch (error) {
    //     res.status(500).send(error);
    //   }
};
// ?[GET] edit artist
export const edit = async (req, res) => {
    const artistId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!artistId) {
        return res.status(400).send("ID nghệ sĩ không hợp lệ");
    }
    else {
        const artist = await Artist.findByPk(artistId);
        if (artist["avatar"]) {
            artist["avatar"] = (JSON.parse(artist["avatar"]))[0];
        }
        res.render("admin/pages/artists/edit.pug", {
            artist: artist,
        });
    }
};
export const editPost = async (req, res) => {
    try {
        console.log("edit post");
        const artistId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!artistId) {
            return res.status(400).send("ID nghệ sĩ không hợp lệ");
        }
        else {
            const artist = await Artist.findByPk(artistId);
            if (artist) {
                const updatedData = req.body;
                if (req.body.avatar) {
                    updatedData.avatar = JSON.stringify(req.body.avatar);
                }
                await artist.update(updatedData);
                req.flash("success", "Cập nhật nghệ sĩ thành công");
                res.redirect("/admin/artists");
            }
        }
    }
    catch (error) {
        res.status(500).send(error);
    }
};
export const deleted = async (req, res) => {
    try {
        console.log("delete artist");
        const artistId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!artistId) {
            return res.status(400).send("ID nghệ sĩ không hợp lệ");
        }
        else {
            const artist = await Artist.findByPk(artistId);
            if (artist) {
                await artist.update({ status: 'inactive' });
                req.flash("success", "Xóa nghệ sĩ thành công");
                res.redirect(`/${system.prefixAdmin}/artists`);
            }
        }
    }
    catch (error) {
    }
};
