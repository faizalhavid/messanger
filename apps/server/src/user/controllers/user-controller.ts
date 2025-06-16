import { BaseApiResponse, HonoContext } from "@messanger/types";
import { UserModelMapper } from "@messanger/types";
import { Hono } from "hono";
import { UserService } from "../services/user-service";


export const userController = new Hono<{ Variables: HonoContext }>();
const controller = userController;


controller.get("/", (c) => {
    const user = c.get("authenticatedUser");
    const result = UserService.getUserProfile(user.id);
    return c.json({
        success: true,
        message: "User profile retrieved successfully",
        data: result
    });
});

controller.get("/:id", (c) => {
    const userId = c.req.param("id");
    const result = UserService.getUserProfile(userId);
    return c.json({
        success: true,
        message: `User with ID ${userId} found`,
        data: result
    });
});

controller.patch("/", async (c) => {
    const user = c.get("authenticatedUser");
    const request = await c.req.json();
    const result = await UserService.updateUserProfile(user.id, request);
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

controller.patch("/activate", async (c) => {
    const user = c.get("authenticatedUser");
    const request = await c.req.json();
    await UserService.updateActivateUser(user.id, request.status);
    return c.json({
        success: true,
        message: "User activation status updated successfully",
        data: null
    });
});

controller.patch("/delete", async (c) => {
    const user = c.get("authenticatedUser");
    const request = await c.req.json();
    await UserService.updateDeleteUserStatus(user.id, request.status);
    return c.json({
        success: true,
        message: "User deletion status updated successfully",
        data: null
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
