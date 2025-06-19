import { BaseApiResponse, HonoContext } from "@messanger/types";
import { UserModelMapper } from "@messanger/types";
import { Hono } from "hono";
import { UserService } from "../services/user-service";


export const userController = new Hono<{ Variables: HonoContext }>();
const controller = userController;


controller.get("/", async (c) => {
    const user = c.get("authenticatedUser");
    const result = await UserService.getUserProfile(user.id);
    return c.json({
        success: true,
        message: "User profile retrieved successfully",
        data: result
    });
});

controller.get("/:id", async (c) => {
    const userId = c.req.param("id");
    return c.json({
        success: true,
        message: `User with ID ${userId} found`,
        data: await UserService.getUserProfile(userId)
    });
});

controller.patch("/:id", async (c) => {
    const userId = c.req.param("id");
    const request = await c.req.json();
    const result = await UserService.updateUserProfile(userId, request);
    return c.json({
        success: true,
        message: "User profile updated successfully",
        data: result
    });
});

// Todo: Implement avatar update functionality
// controller.patch("/update-avatar", async (c) => {
//     const user = c.get("authenticatedUser");
//     const request = await c.req.json();
//     if (!request.avatar || !request.avatar.url) {
//         return c.json({
//             success: false,
//             message: "Avatar URL is required",
//             data: null
//         }, 400);
//     }
//     const result = await UserService.updateUserProfile(user.id, { avatar: request.avatar });
//     return c.json({
//         success: true,
//         message: "User avatar updated successfully",
//         data: result
//     });
// });

controller.patch("/:id/activate", async (c) => {
    const userId = c.req.param("id");
    const request = await c.req.json();

    return c.json({
        success: true,
        message: "User activation status updated successfully",
        data: await UserService.updateActivateStatus(userId, request.status)
    });
});

controller.patch("/:id/delete", async (c) => {
    const userId = c.req.param("id");
    const request = await c.req.json();

    return c.json({
        success: true,
        message: "User deletion status updated successfully",
        data: await UserService.updateDeleteUserStatus(userId, request.status)
    });
});

// Todo : Implement search functionality
// controller.get("/search", async (c) => {
//     const queryParams = c.req.query();
//     const user = c.get("authenticatedUser");
//     const result = await UserService.searchUsers(queryParams, user.id);
//     return c.json({
//         success: true,
//         message: "Users searched successfully",
//         data: result
//     });
// });
