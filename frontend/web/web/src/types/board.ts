export type AccessLevel = {
  type: "public" | "private" | "group_public" | "group";
};

export type Owner = {
  id: string;
};


export type Pin = {
  id: string;
  title: string;
  content: string;

};

export type Board = {
  id: string;
  accessLevel: AccessLevel;
  groupId: string;
  owner: Owner;
};

export type FullBoard = {
  id: string;
  name: string;
  accessLevel: AccessLevel;
  groupId: string;
  createdAt: string;
  owner: Owner;
  pins: Pin[];
};

export type BoardResponse = {
  board: Board | null; 
};

export type FullBoardResponse = {
  board: FullBoard | null; 
};

export type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

export type PinsByLocationResponse = {
  pinsByLocation: Pin[];
};

export type User = {
  id: string;
  username: string;
  email: string;
};

export type UserByIdResponse = {
  userById: User | null;
};


export type Reaction = {
  id: string;
  type: string;
  description?: string;
};

export type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: User;
};

export type CommentsByBoardResponse = {
  commentsByBoard: Comment[];
};

export type ReactionsCountByBoardResponse = {
  reactionsCountByBoard: number;
};


export type AddCommentInput = {
  contentId: string;
  userId: string;
  message: string;   
};

export type AddCommentResponse = {
  addCommentToBoard: Comment;
};

export type ComplaintInput = {
  complaintTypeId: string;
  content?: string;
};

export type ComplaintTypes = {
  id: string;
  type: string;
  description: string;
};

export type ComplaintStatuses = {
  id: string;
  type: string;
  description: string;
};

export type CopyBoardResponse = {
  copyBoard: {
    id: string;
  };
};