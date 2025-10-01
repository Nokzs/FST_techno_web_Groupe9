export type UserID = {
  id: string;
  jwt: string;
  refreshToken: string;
};

export type User = {
  email: string;

  pseudo: string;

  password: string;

  createdAt: Date;

  isAdmin: boolean;

  language: string;
};
