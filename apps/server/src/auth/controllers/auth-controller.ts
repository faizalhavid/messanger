import { Env, Hono } from "hono";
import { Schema } from "zod";
import { AuthService } from "../services/auth-services";
import { BaseApiResponse } from "@types/api-response";

export const authController = new Hono();

authController.post("/login", async (c) => {
    const request = await c.req.json();
    const result = await AuthService.login(request);
    const response: BaseApiResponse = {
        success: true,
        message: "Login successful",
        data: result,
    };
    return c.json(response);
});

authController.post("/register", async (c) => {
    const request = await c.req.json();
    const response = await AuthService.register(request);
    const result: BaseApiResponse = {
        success: true,
        status: 201,
        message: "Registration successful",
        data: response,
    };
    c.status(201);
    return c.json(result);
});


// authController.get("/getProfile", async (c) => {
//     const token = c.req.header("Authorization");
//     const response = await AuthService.getProfile(token);
//     const result: BaseApiResponse = {
//         success: true,
//         message: "Profile retrieved successfully",
//         data: response,
//     };
//     return c.json(result);
// });
