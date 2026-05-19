import ServiceCategory from "../../model/serviceCategory.model.js";
import { Request, Response } from "express";
export const index = async (req: Request, res: Response) => {
  try {
    const categories = await ServiceCategory.findAll({
      where: { is_deleted: 0 }, 
        order: [['created_at', 'DESC']]
    }); 
    res.render("admin/pages/categories/index.pug", {
      pageTitle: "Quản lý danh mục dịch vụ",
      categories: categories
    });
  } catch (error) {
    console.error("Error fetching service categories:", error);
    res.status(500).send("Internal Server Error");
  }
};
export const create = async (req: Request, res: Response) => {
  try {
    res.render("admin/pages/categories/create.pug", { 
      pageTitle: "Thêm danh mục dịch vụ mới",
    });
  } catch (error) {
    console.error("Error rendering create category page:", error);
    res.status(500).send("Internal Server Error");
  }   
};
export const store = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;  
    if (!name || name.trim() === "") {
      return res.status(400).send("Tên danh mục không được để trống");
    }
    await ServiceCategory.create({ name: name.trim(), description: req.body.description || "" });
    res.redirect('/admin/categories');
  } catch (error) {
    console.error("Error creating service category:", error);
    res.status(500).send("Internal Server Error");
  }
};
export const details = async (req: Request, res: Response) => {
  try {
    const categoryId = req.params.id; 
    const category = await ServiceCategory.findOne({
      where: { id: categoryId, is_deleted
: 0 }

    });
    if (!category) {
      return res.status(404).send("Danh mục không tồn tại");
    }
    console.log("Category details:", category.toJSON());
    res.render("admin/pages/categories/detail.pug", {
      pageTitle: "Chi tiết danh mục dịch vụ",
      category: category
    });
  } catch (error) {
    console.error("Error fetching category details:", error);
    res.status(500).send("Internal Server Error");
  }

};