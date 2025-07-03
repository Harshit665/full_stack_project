import { Router } from "express";
import { loginUser, logOutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

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

router.route("/login").post(loginUser);


//secured Routes
router.route("/logout").post(
  verifyJWT,
  logOutUser
);

export default router;
