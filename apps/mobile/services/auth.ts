import { LoginRequest, LoginResponse } from "@messanger/types";
import axios from "./axios"; // Use your custom axios instance

export const postLogin = async (req: LoginRequest): Promise<LoginResponse> => {
    const response = await axios.post("/auth/login", req);
    console.log("Response from login:", response);
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error("Login failed");
    }
}