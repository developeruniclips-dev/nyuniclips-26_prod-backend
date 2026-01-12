const { Router } = require("express");
const {
    getAllUsers,
    getOneUser,
    updateUser,
    deleteUser,
    getUserProfile,
    updateUserProfile
} = require("../controller/userController");
const { authMiddleware } = require("../middleware/auth");
const { authorizeRoles } = require("../middleware/roles");
const { uploadProfileFiles } = require("../middleware/uploadProfileFiles");

const router = Router();

router.get("/", getAllUsers);
router.get("/profile", authMiddleware, getUserProfile);
router.get("/:id", getOneUser);
router.put("/profile", authMiddleware, uploadProfileFiles, updateUserProfile);
router.put("/:id", authMiddleware, authorizeRoles("Admin"), updateUser);
router.delete("/:id", authMiddleware, authorizeRoles("Admin"), deleteUser);

module.exports = router;
