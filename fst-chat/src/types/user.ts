export type UserID = {
  id: string;
};

export type User = {
  id: string;

  email: string;

  pseudo: string;

  createdAt?: Date;

  lastConnectedAt?: Date;

  isAdmin?: boolean;

  language: string;

  bio?: string;

  password?: string;

  urlPicture?: string;

  avatarBlob?: Blob;
};
