const { Router } = require("express");
const {
    getAllUsers,
    getOneUser,
    updateUser,
    deleteUser,
    getUserProfile,
    updateUserProfile,
    deleteUserBySuperAdmin,
    getAllUsersWithRoles,
    createSuperAdmin
} = require("../controller/userController");
const { authMiddleware } = require("../middleware/auth");
const { authorizeRoles } = require("../middleware/roles");
const { uploadProfileFiles } = require("../middleware/uploadProfileFiles");

const router = Router();

router.get("/", getAllUsers);
router.get("/with-roles", authMiddleware, authorizeRoles("Admin", "SuperAdmin"), getAllUsersWithRoles);
router.get("/profile", authMiddleware, getUserProfile);
router.get("/:id", getOneUser);
router.put("/profile", authMiddleware, uploadProfileFiles, updateUserProfile);
router.put("/:id", authMiddleware, authorizeRoles("Admin", "SuperAdmin"), updateUser);
router.delete("/super-admin/:id", authMiddleware, authorizeRoles("SuperAdmin"), deleteUserBySuperAdmin);
router.delete("/:id", authMiddleware, authorizeRoles("Admin", "SuperAdmin"), deleteUser);
router.post("/create-super-admin", createSuperAdmin);

module.exports = router;
