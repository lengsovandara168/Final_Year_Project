import { apiFetch } from "./client";

export type CreateStaffUserRequest = {
  email: string;
  name: string;
};

export type CreateStaffUserResponse = {
  ok?: boolean;
  userId?: string;
  email?: string;
  name?: string;
  role?: string;
  status?: string;
  data?: {
    userId?: string;
    email?: string;
    name?: string;
    role?: string;
    status?: string;
  };
};

export async function createStaffUser(
  payload: CreateStaffUserRequest,
  accessToken: string,
) {
  return apiFetch<CreateStaffUserResponse>("/v1/admin/users/staff", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
