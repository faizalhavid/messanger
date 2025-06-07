import { Hono } from "hono";
import { ProfileService } from "../services/profile-service";
import { HonoContext } from "@messanger/types";
import { BaseApiResponse } from "@messanger/types";


export const profileController = new Hono<{ Variables: HonoContext }>();

profileController.get("/", async (c) => {
    const user = c.get("authenticatedUser");
    const result = await ProfileService.getProfile(user);
    const response: BaseApiResponse = {
        success: true,
        message: "Profile retrieved successfully",
        data: result,
    };
    return c.json(response);
});

profileController.patch("/", async (c) => {
    const user = c.get("authenticatedUser");
    const request = await c.req.json();
    const result = await ProfileService.updateProfile(user, request);
    const response: BaseApiResponse = {
        success: true,
        message: "Profile updated successfully",
        data: result,
    };
    return c.json(response);
});

profileController.delete("/", async (c) => {
    const user = c.get("authenticatedUser");
    await ProfileService.deleteProfile(user);
    const response: BaseApiResponse = {
        success: true,
        message: "Profile deleted successfully",
    };
    return c.json(response);
});

