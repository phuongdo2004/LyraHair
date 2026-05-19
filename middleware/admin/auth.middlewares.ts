import User from "../../model/user.model.js";
import { system } from "../../config/system.js";
import { NextFunction, Request, Response } from "express";
export const requireAuth = async(req:Request, res:Response, next:NextFunction)=>{
  console.log("middleware auth");
  if( !req.cookies.token){
    console.log("no token");
    if (req.path !== `/admin/auth/login`) {
              return res.redirect(`/admin/auth/login`);
    }
          return next();
  }else{
    const token = req.cookies.token;
const user = await User.findOne({
  where: {
    tokenUser: token  
  },
  raw: true
}) as { [key: string]: any } | null;
if(user){
  console.log("user found in auth middleware");
  res.locals.user = user;
  // lay avatar

  if(user && user.avatar){
    user.avatar = JSON.parse(user.avatar);
  }else if(user){
    user.avatar = "/uploads/avatar-default.jpg";
  }
  return next();
}else{
  console.log("no user found");
  return res.redirect("/admin/auth/login");
}
}
}