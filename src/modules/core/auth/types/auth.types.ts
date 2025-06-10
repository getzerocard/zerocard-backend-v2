export interface BaseResponse {
  message?: string;
}

export enum OauthProvider {
  GOOGLE = 'google',
  APPLE = 'apple',
}

export interface IOAuthUser {
  providerUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface UserResponse {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
  };
}

export interface LoginResponse extends BaseResponse, Partial<TokenResponse>, Partial<UserResponse> {
  sessionId: string;
}
