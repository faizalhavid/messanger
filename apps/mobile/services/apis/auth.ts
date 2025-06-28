import { BaseApiResponse, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '@messanger/types';
import axios from '../axios';

export const postLogin = async (req: LoginRequest): Promise<BaseApiResponse<LoginResponse>> => {
  const response = await axios.post('/auth/login', req);
  console.log('Response from login:', response);
  if (response.status === 200) {
    return {
      success: true,
      data: response.data,
      error: undefined,
    };
  } else {
    return {
      success: false,
      data: undefined,
      error: response.data?.error || 'Login failed',
    };
  }
};

export const postRegister = async (req: RegisterRequest): Promise<BaseApiResponse<RegisterResponse>> => {
  try {
    const response = await axios.post('/auth/register', req);
    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        error: undefined,
      };
    } else {
      return {
        success: false,
        data: undefined,
        error: response.data?.error || 'Registration failed',
      };
    }
  } catch (error: any) {
    return {
      success: false,
      data: undefined,
      error: error?.response?.data?.error || error.message || 'Registration failed',
    };
  }
};

export const postForgotPassword = async (email: string): Promise<BaseApiResponse<void>> => {
  try {
    const response = await axios.post('/(auth)/forgot-password', { email });
    if (response.status === 200) {
      return {
        success: true,
        data: undefined,
        error: undefined,
      };
    } else {
      return {
        success: false,
        data: undefined,
        error: response.data?.error || 'Forgot password request failed',
      };
    }
  } catch (error: any) {
    return {
      success: false,
      data: undefined,
      error: error?.response?.data?.error || error.message || 'Forgot password request failed',
    };
  }
};

export const postVerification = async (data: { email: string; token: string }): Promise<BaseApiResponse<void>> => {
  try {
    const response = await axios.post('/(auth)/verifications', data);
    if (response.status === 200) {
      return {
        success: true,
        data: undefined,
        error: undefined,
      };
    } else {
      return {
        success: false,
        data: undefined,
        error: response.data?.error || 'Verification failed',
      };
    }
  } catch (error: any) {
    return {
      success: false,
      data: undefined,
      error: error?.response?.data?.error || error.message || 'Verification failed',
    };
  }
};
