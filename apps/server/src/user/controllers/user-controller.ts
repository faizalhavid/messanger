import { BaseApiResponse } from "@types/api-response";
import { UserPublic } from "@types/user/user";
import { Hono } from "hono";


export const userController = new Hono();

userController.get("/", (c) => {
    return c.json({
        success: true,
        message: "User controller is working",
        data: undefined
    } as BaseApiResponse<UserPublic>);
});

userController.get("/:id", (c) => {
    const userId = c.req.param("id");
    return c.json({
        success: true,
        message: `User with ID ${userId} found`,
        data: { id: userId, name: "John Doe" } as unknown as UserPublic
    } as BaseApiResponse<UserPublic>);
});



