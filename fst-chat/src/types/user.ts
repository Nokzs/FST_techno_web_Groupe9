export type UserID = {
  id: string;
};

export type User = {
  email: string;

  pseudo: string;

  createdAt: Date;

  isAdmin: boolean;

  language: string;

  bio: string;

  urlPicture: string;
};
