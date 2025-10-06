export type UserID = {
  id: string;
};

export type User = {
  email: string;

  pseudo: string;

  password: string;

  createdAt: Date;

  isAdmin: boolean;

  language: string;
};
