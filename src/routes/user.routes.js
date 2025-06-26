import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",       // ✅ Must match Postman exactly
      maxCount: 1           // ✅ Only 1 file is being sent
    },
    {
      name: "coverImage",   // ✅ Must match Postman exactly
      maxCount: 1
    }
  ]),
  registerUser
);

export default router;
