interface ILoginResponse {
  message: string;
  user_id: string;
  user_type: string;
  tokens: {
    refresh: string;
    access: string;
  };
}

export type { ILoginResponse };
