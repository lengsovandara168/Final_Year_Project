import { apiFetch, apiFetchPublic } from "./client";

export type RegisterRequest = {
  email: string;
  name: string;
};

export type RegisterResponse = {
  ok: boolean;
  userId: string;
  email: string;
};

export async function register(payload: RegisterRequest) {
  return apiFetchPublic<RegisterResponse>("/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type LoginRequest = {
  email: string;
};

export type LoginResponse = {
  ok: boolean;
};

export async function login(payload: LoginRequest) {
  return apiFetchPublic<LoginResponse>("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type OtpRequest = {
  email: string;
};

export type OtpRequestResponse = {
  message?: string;
};

export async function requestOtp(payload: OtpRequest) {
  return apiFetchPublic<OtpRequestResponse>("/v1/auth/otp/request", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type OtpVerifyRequest = {
  email: string;
  code: string;
};

export type OtpVerifyResponse = {
  ok: boolean;
  userId: string;
  email: string;
  role: string;
  accessToken: string;
};

export async function verifyRegisterOtp(payload: OtpVerifyRequest) {
  return apiFetchPublic<OtpVerifyResponse>("/v1/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyLoginOtp(payload: OtpVerifyRequest) {
  return apiFetchPublic<OtpVerifyResponse>("/v1/auth/login-verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logout(accessToken: string) {
  return apiFetch<{ message?: string }>("/v1/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export type UserProfile = {
  user_id: string;
  email: string;
  role: string;
};

export async function getMe(accessToken: string) {
  return apiFetch<UserProfile>("/v1/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export type DeleteAccountRequest = {
  reason: string;
  confirmation: boolean;
};

export async function deleteAccount(
  payload: DeleteAccountRequest,
  accessToken: string,
) {
  return apiFetch<{ message?: string }>("/v1/auth/account", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}
