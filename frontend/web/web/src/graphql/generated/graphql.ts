import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Time: { input: any; output: any; }
  UUID: { input: any; output: any; }
};

export enum AccessLevelType {
  Group = 'group',
  GroupPublic = 'group_public',
  Private = 'private',
  Public = 'public'
}

export type AddCommentToBoardInput = {
  boardId: Scalars['UUID']['input'];
  message: Scalars['String']['input'];
  userId: Scalars['UUID']['input'];
};

export type AddCommentToPinInput = {
  message: Scalars['String']['input'];
  pinId: Scalars['UUID']['input'];
  userId: Scalars['UUID']['input'];
};

export type AddImageInput = {
  imageUrl: Scalars['String']['input'];
  orderNumber: Scalars['Int']['input'];
  pinId: Scalars['UUID']['input'];
};

export type Board = {
  __typename?: 'Board';
  accessLevel: AccessLevelType;
  authorId: Scalars['UUID']['output'];
  bookmarked?: Maybe<Scalars['Boolean']['output']>;
  createdAt: Scalars['Time']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  name: Scalars['String']['output'];
  ownerId: Scalars['UUID']['output'];
  ownerType: OwnerType;
  pins?: Maybe<Array<Pin>>;
  reactionId?: Maybe<Scalars['UUID']['output']>;
  savedAt: Scalars['Time']['output'];
};

export type CommentToBoard = {
  __typename?: 'CommentToBoard';
  boardId: Scalars['UUID']['output'];
  createdAt: Scalars['Time']['output'];
  id: Scalars['UUID']['output'];
  message: Scalars['String']['output'];
  owner: User;
};

export type CommentToPin = {
  __typename?: 'CommentToPin';
  createdAt: Scalars['Time']['output'];
  id: Scalars['UUID']['output'];
  message: Scalars['String']['output'];
  owner: User;
  pinId: Scalars['UUID']['output'];
};

export type CreateBoardInput = {
  accessLevel: AccessLevelType;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  ownerId: Scalars['UUID']['input'];
  ownerType: OwnerType;
};

export type CreateGroupInput = {
  members: Array<Scalars['UUID']['input']>;
};

export type CreatePinInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
  name: Scalars['String']['input'];
  ownerId: Scalars['UUID']['input'];
};

export type CreateUserInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  nick_tag: Scalars['String']['input'];
  nickname: Scalars['String']['input'];
  profilePicture?: InputMaybe<Scalars['String']['input']>;
};

export type Group = {
  __typename?: 'Group';
  id: Scalars['UUID']['output'];
  members: Array<User>;
};

export type Mutation = {
  __typename?: 'Mutation';
  acceptJoinToGroup: Scalars['Boolean']['output'];
  addCommentToBoard: CommentToBoard;
  addCommentToPin: CommentToPin;
  addImageToPin: PinImage;
  addPinToBoard: Board;
  addUserToGroup: Scalars['Boolean']['output'];
  bookmarkToBoard: Scalars['Boolean']['output'];
  bookmarkToPin: Scalars['Boolean']['output'];
  changeAccessBookmarks: Scalars['Boolean']['output'];
  copyBoard: Board;
  copyPin: Pin;
  createBoard: Board;
  createGroup: Group;
  createPin: Pin;
  createUser: User;
  deleteCommentToBoard: Scalars['Boolean']['output'];
  deleteCommentToPin: Scalars['Boolean']['output'];
  deleteGroup: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  followUser: Scalars['Boolean']['output'];
  reactionToBoard: Scalars['Boolean']['output'];
  reactionToPin: Scalars['Boolean']['output'];
  removeImageFromPin: Scalars['Boolean']['output'];
  removePinFromBoard: Board;
  removeUserFromGroup: Scalars['Boolean']['output'];
  requestJoinGroup: Scalars['Boolean']['output'];
  unfollowUser: Scalars['Boolean']['output'];
  updateBoard: Board;
  updateCommentToBoard: CommentToBoard;
  updateCommentToPin: CommentToPin;
  updateImageOrder: PinImage;
  updatePin: Pin;
  updateUser: User;
};


export type MutationAcceptJoinToGroupArgs = {
  requestId: Scalars['UUID']['input'];
};


export type MutationAddCommentToBoardArgs = {
  input: AddCommentToBoardInput;
};


export type MutationAddCommentToPinArgs = {
  input: AddCommentToPinInput;
};


export type MutationAddImageToPinArgs = {
  input: AddImageInput;
};


export type MutationAddPinToBoardArgs = {
  boardId: Scalars['UUID']['input'];
  pinId: Scalars['UUID']['input'];
};


export type MutationAddUserToGroupArgs = {
  groupId: Scalars['UUID']['input'];
  userId: Scalars['UUID']['input'];
};


export type MutationBookmarkToBoardArgs = {
  boardId: Scalars['UUID']['input'];
  userId: Scalars['UUID']['input'];
};


export type MutationBookmarkToPinArgs = {
  pinId: Scalars['UUID']['input'];
  userId: Scalars['UUID']['input'];
};


export type MutationChangeAccessBookmarksArgs = {
  newStatus: Scalars['Int']['input'];
  userId: Scalars['UUID']['input'];
};


export type MutationCopyBoardArgs = {
  boardId: Scalars['UUID']['input'];
  userId: Scalars['UUID']['input'];
};


export type MutationCopyPinArgs = {
  pinId: Scalars['UUID']['input'];
  userId: Scalars['UUID']['input'];
};


export type MutationCreateBoardArgs = {
  input: CreateBoardInput;
};


export type MutationCreateGroupArgs = {
  input: CreateGroupInput;
};


export type MutationCreatePinArgs = {
  input: CreatePinInput;
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationDeleteCommentToBoardArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationDeleteCommentToPinArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationDeleteGroupArgs = {
  groupId: Scalars['UUID']['input'];
};


export type MutationDeleteUserArgs = {
  userId: Scalars['UUID']['input'];
};


export type MutationFollowUserArgs = {
  followerId: Scalars['UUID']['input'];
  userId: Scalars['UUID']['input'];
};


export type MutationReactionToBoardArgs = {
  boardId: Scalars['UUID']['input'];
  reactionId: Scalars['UUID']['input'];
  userId: Scalars['UUID']['input'];
};


export type MutationReactionToPinArgs = {
  pinId: Scalars['UUID']['input'];
  reactionId: Scalars['UUID']['input'];
  userId: Scalars['UUID']['input'];
};


export type MutationRemoveImageFromPinArgs = {
  imageId: Scalars['UUID']['input'];
};


export type MutationRemovePinFromBoardArgs = {
  boardId: Scalars['UUID']['input'];
  pinId: Scalars['UUID']['input'];
};


export type MutationRemoveUserFromGroupArgs = {
  groupId: Scalars['UUID']['input'];
  userId: Scalars['UUID']['input'];
};


export type MutationRequestJoinGroupArgs = {
  groupId: Scalars['UUID']['input'];
  userId: Scalars['UUID']['input'];
};


export type MutationUnfollowUserArgs = {
  followerId: Scalars['UUID']['input'];
  userId: Scalars['UUID']['input'];
};


export type MutationUpdateBoardArgs = {
  id: Scalars['UUID']['input'];
  input: UpdateBoardInput;
};


export type MutationUpdateCommentToBoardArgs = {
  id: Scalars['UUID']['input'];
  message: Scalars['String']['input'];
};


export type MutationUpdateCommentToPinArgs = {
  id: Scalars['UUID']['input'];
  message: Scalars['String']['input'];
};


export type MutationUpdateImageOrderArgs = {
  imageId: Scalars['UUID']['input'];
  newOrder: Scalars['Int']['input'];
};


export type MutationUpdatePinArgs = {
  id: Scalars['UUID']['input'];
  input: UpdatePinInput;
};


export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
  userId: Scalars['UUID']['input'];
};

export enum OwnerType {
  Group = 'group',
  User = 'user'
}

export type Pin = {
  __typename?: 'Pin';
  address?: Maybe<Scalars['String']['output']>;
  author: User;
  bookmarked?: Maybe<Scalars['Boolean']['output']>;
  createdAt: Scalars['Time']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  images?: Maybe<Array<PinImage>>;
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  owner: User;
  place?: Maybe<Place>;
  rating: Scalars['Float']['output'];
  reactionId?: Maybe<Scalars['UUID']['output']>;
  savedAt: Scalars['Time']['output'];
};

export type PinImage = {
  __typename?: 'PinImage';
  id: Scalars['UUID']['output'];
  imageUrl: Scalars['String']['output'];
  orderNumber: Scalars['Int']['output'];
};

export type Place = {
  __typename?: 'Place';
  address?: Maybe<Scalars['String']['output']>;
  gis_id?: Maybe<Scalars['UUID']['output']>;
  id: Scalars['UUID']['output'];
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  purpose_name?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  board?: Maybe<Board>;
  boardByName?: Maybe<Array<Board>>;
  boardsByGroup?: Maybe<Array<Board>>;
  bookmarkedBoardsByUser: Array<Board>;
  bookmarkedPinsByUser: Array<Pin>;
  commentsByBoard: Array<Maybe<CommentToBoard>>;
  commentsByPin: Array<Maybe<CommentToPin>>;
  countAllReactionsToBoard: Scalars['Int']['output'];
  countAllReactionsToPin: Scalars['Int']['output'];
  countGroupBoardsByUser: Scalars['Int']['output'];
  countOwnBoardsByUser: Scalars['Int']['output'];
  countPinsByUser: Scalars['Int']['output'];
  feed: Array<Pin>;
  followersCount: Scalars['Int']['output'];
  followersOf: Array<User>;
  followingCount: Scalars['Int']['output'];
  followingOf: Array<User>;
  getSettingsStatuses: Array<SettingsStatuses>;
  groupBoardsByUser: Array<Board>;
  groupById?: Maybe<Group>;
  groupsOfUser: Array<Group>;
  isUserInGroup: Scalars['Boolean']['output'];
  likedBoardsByUser: Array<Board>;
  likedPinsByUser: Array<Pin>;
  ownBoardsByUser: Array<Board>;
  pin?: Maybe<Pin>;
  pinsByLocation?: Maybe<Array<Pin>>;
  pinsByName?: Maybe<Array<Pin>>;
  pinsByUser?: Maybe<Array<Pin>>;
  reactions: Array<Reaction>;
  userByEmail?: Maybe<User>;
  userById?: Maybe<User>;
  userByNickname?: Maybe<Array<User>>;
  userByTag?: Maybe<User>;
};


export type QueryBoardArgs = {
  id: Scalars['UUID']['input'];
  viewerId?: InputMaybe<Scalars['UUID']['input']>;
};


export type QueryBoardByNameArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
  viewerId?: InputMaybe<Scalars['UUID']['input']>;
};


export type QueryBoardsByGroupArgs = {
  groupId: Scalars['UUID']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  viewerId?: InputMaybe<Scalars['UUID']['input']>;
};


export type QueryBookmarkedBoardsByUserArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  userID: Scalars['UUID']['input'];
};


export type QueryBookmarkedPinsByUserArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  userID: Scalars['UUID']['input'];
};


export type QueryCommentsByBoardArgs = {
  boardId: Scalars['UUID']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCommentsByPinArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  pinId: Scalars['UUID']['input'];
};


export type QueryCountAllReactionsToBoardArgs = {
  boardId: Scalars['UUID']['input'];
};


export type QueryCountAllReactionsToPinArgs = {
  pinId: Scalars['UUID']['input'];
};


export type QueryCountGroupBoardsByUserArgs = {
  userId: Scalars['UUID']['input'];
};


export type QueryCountOwnBoardsByUserArgs = {
  userId: Scalars['UUID']['input'];
};


export type QueryCountPinsByUserArgs = {
  userId: Scalars['UUID']['input'];
};


export type QueryFollowersCountArgs = {
  userId: Scalars['UUID']['input'];
};


export type QueryFollowersOfArgs = {
  userId: Scalars['UUID']['input'];
};


export type QueryFollowingCountArgs = {
  userId: Scalars['UUID']['input'];
};


export type QueryFollowingOfArgs = {
  userId: Scalars['UUID']['input'];
};


export type QueryGroupBoardsByUserArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  userId: Scalars['UUID']['input'];
};


export type QueryGroupByIdArgs = {
  groupId: Scalars['UUID']['input'];
};


export type QueryGroupsOfUserArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  userId: Scalars['UUID']['input'];
};


export type QueryIsUserInGroupArgs = {
  groupId: Scalars['UUID']['input'];
  userId: Scalars['UUID']['input'];
};


export type QueryLikedBoardsByUserArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  userID: Scalars['UUID']['input'];
};


export type QueryLikedPinsByUserArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  userID: Scalars['UUID']['input'];
};


export type QueryOwnBoardsByUserArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  userId: Scalars['UUID']['input'];
};


export type QueryPinArgs = {
  id: Scalars['UUID']['input'];
  viewerId?: InputMaybe<Scalars['UUID']['input']>;
};


export type QueryPinsByLocationArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
  viewerId?: InputMaybe<Scalars['UUID']['input']>;
};


export type QueryPinsByNameArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
  viewerId?: InputMaybe<Scalars['UUID']['input']>;
};


export type QueryPinsByUserArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  userId: Scalars['UUID']['input'];
  viewerId?: InputMaybe<Scalars['UUID']['input']>;
};


export type QueryUserByEmailArgs = {
  email: Scalars['String']['input'];
};


export type QueryUserByIdArgs = {
  userId: Scalars['UUID']['input'];
};


export type QueryUserByNicknameArgs = {
  nickname: Scalars['String']['input'];
};


export type QueryUserByTagArgs = {
  nickTag: Scalars['String']['input'];
};

export type Reaction = {
  __typename?: 'Reaction';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  type: Scalars['String']['output'];
};

export type SettingsStatuses = {
  __typename?: 'SettingsStatuses';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  type: Scalars['String']['output'];
};

export type UpdateBoardInput = {
  accessLevel?: InputMaybe<AccessLevelType>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['UUID']['input'];
};

export type UpdatePinInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  latitude?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  rating?: InputMaybe<Scalars['Float']['input']>;
  userId: Scalars['UUID']['input'];
};

export type UpdateUserInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  nick_tag?: InputMaybe<Scalars['String']['input']>;
  nickname?: InputMaybe<Scalars['String']['input']>;
  profilePicture?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  description?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  followers: Array<User>;
  following: Array<User>;
  id: Scalars['UUID']['output'];
  nickTag: Scalars['String']['output'];
  nickname: Scalars['String']['output'];
  profilePicture?: Maybe<Scalars['String']['output']>;
  status: UserStatus;
  userRating: Scalars['Float']['output'];
};

export enum UserStatus {
  Active = 'active',
  Deleted = 'deleted'
}

export type GetPinBasicByIdQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type GetPinBasicByIdQuery = { __typename?: 'Query', pin?: { __typename?: 'Pin', id: any, name: string, owner: { __typename?: 'User', id: any, nickname: string, profilePicture?: string | null }, images?: Array<{ __typename?: 'PinImage', id: any, orderNumber: number, imageUrl: string }> | null } | null };

export type GetUserByNickTagQueryVariables = Exact<{
  nickTag: Scalars['String']['input'];
}>;


export type GetUserByNickTagQuery = { __typename?: 'Query', userByTag?: { __typename?: 'User', id: any, nickname: string, email: string, nickTag: string, profilePicture?: string | null, description?: string | null, status: UserStatus, userRating: number, followers: Array<{ __typename?: 'User', id: any, nickname: string }>, following: Array<{ __typename?: 'User', id: any, nickname: string }> } | null };

export type GetUserByIdQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
}>;


export type GetUserByIdQuery = { __typename?: 'Query', userById?: { __typename?: 'User', id: any, nickname: string, email: string, nickTag: string, profilePicture?: string | null, description?: string | null, status: UserStatus, userRating: number, followers: Array<{ __typename?: 'User', id: any, nickname: string }>, following: Array<{ __typename?: 'User', id: any, nickname: string }> } | null };

export type GetPinsByUserIdQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
  viewerId?: InputMaybe<Scalars['UUID']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetPinsByUserIdQuery = { __typename?: 'Query', pinsByUser?: Array<{ __typename?: 'Pin', id: any, name: string, latitude: number, longitude: number, description?: string | null, rating: number, createdAt: any, owner: { __typename?: 'User', id: any, nickname: string, profilePicture?: string | null }, images?: Array<{ __typename?: 'PinImage', id: any, orderNumber: number, imageUrl: string }> | null }> | null };

export type GetLikedPinsByUserIdQueryVariables = Exact<{
  userID: Scalars['UUID']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetLikedPinsByUserIdQuery = { __typename?: 'Query', likedPinsByUser: Array<{ __typename?: 'Pin', id: any, name: string, latitude: number, longitude: number, description?: string | null, rating: number, createdAt: any, owner: { __typename?: 'User', id: any, nickname: string, profilePicture?: string | null }, images?: Array<{ __typename?: 'PinImage', id: any, orderNumber: number, imageUrl: string }> | null }> };

export type GetOwnBoardsByUserIdQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetOwnBoardsByUserIdQuery = { __typename?: 'Query', ownBoardsByUser: Array<{ __typename?: 'Board', id: any, name: string, description?: string | null, accessLevel: AccessLevelType, ownerId: any, authorId: any, ownerType: OwnerType, createdAt: any, savedAt: any, reactionId?: any | null, bookmarked?: boolean | null, pins?: Array<{ __typename?: 'Pin', id: any, name: string, owner: { __typename?: 'User', id: any, nickname: string, profilePicture?: string | null }, images?: Array<{ __typename?: 'PinImage', id: any, orderNumber: number, imageUrl: string }> | null }> | null }> };

export type GetLikedBoardsByUserIdQueryVariables = Exact<{
  userID: Scalars['UUID']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetLikedBoardsByUserIdQuery = { __typename?: 'Query', likedBoardsByUser: Array<{ __typename?: 'Board', id: any, name: string, description?: string | null, accessLevel: AccessLevelType, ownerId: any, authorId: any, ownerType: OwnerType, createdAt: any, savedAt: any, reactionId?: any | null, bookmarked?: boolean | null, pins?: Array<{ __typename?: 'Pin', id: any, name: string, owner: { __typename?: 'User', id: any, nickname: string, profilePicture?: string | null }, images?: Array<{ __typename?: 'PinImage', id: any, orderNumber: number, imageUrl: string }> | null }> | null }> };

export type GetUserIdByNickTagQueryVariables = Exact<{
  nickTag: Scalars['String']['input'];
}>;


export type GetUserIdByNickTagQuery = { __typename?: 'Query', userByTag?: { __typename?: 'User', id: any } | null };

export type GetFollowersByIdQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
}>;


export type GetFollowersByIdQuery = { __typename?: 'Query', followersOf: Array<{ __typename?: 'User', id: any, nickname: string, email: string, nickTag: string, profilePicture?: string | null, description?: string | null, status: UserStatus, userRating: number, followers: Array<{ __typename?: 'User', id: any, nickname: string }>, following: Array<{ __typename?: 'User', id: any, nickname: string }> }> };

export type CreateGroupMutationVariables = Exact<{
  input: CreateGroupInput;
}>;


export type CreateGroupMutation = { __typename?: 'Mutation', createGroup: { __typename?: 'Group', id: any, members: Array<{ __typename?: 'User', id: any }> } };

export type CreateBoardMutationVariables = Exact<{
  input: CreateBoardInput;
}>;


export type CreateBoardMutation = { __typename?: 'Mutation', createBoard: { __typename?: 'Board', id: any } };

export type GetPinFullByIdQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type GetPinFullByIdQuery = { __typename?: 'Query', pin?: { __typename?: 'Pin', id: any, name: string, latitude: number, longitude: number, description?: string | null, rating: number, createdAt: any, owner: { __typename?: 'User', id: any, nickname: string, profilePicture?: string | null }, images?: Array<{ __typename?: 'PinImage', id: any, orderNumber: number, imageUrl: string }> | null } | null };

export type CreatePinMutationVariables = Exact<{
  input: CreatePinInput;
}>;


export type CreatePinMutation = { __typename?: 'Mutation', createPin: { __typename?: 'Pin', id: any, name: string, latitude: number, longitude: number, description?: string | null, rating: number, createdAt: any, images?: Array<{ __typename?: 'PinImage', id: any, orderNumber: number, imageUrl: string }> | null } };

export type UpdatePinMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  input: UpdatePinInput;
}>;


export type UpdatePinMutation = { __typename?: 'Mutation', updatePin: { __typename?: 'Pin', id: any, name: string, latitude: number, longitude: number, description?: string | null, rating: number, createdAt: any } };

export type AddPinToBoardMutationVariables = Exact<{
  pinId: Scalars['UUID']['input'];
  boardId: Scalars['UUID']['input'];
}>;


export type AddPinToBoardMutation = { __typename?: 'Mutation', addPinToBoard: { __typename?: 'Board', id: any, name: string, pins?: Array<{ __typename?: 'Pin', id: any, name: string }> | null } };

export type RemovePinFromBoardMutationVariables = Exact<{
  pinId: Scalars['UUID']['input'];
  boardId: Scalars['UUID']['input'];
}>;


export type RemovePinFromBoardMutation = { __typename?: 'Mutation', removePinFromBoard: { __typename?: 'Board', id: any, name: string, pins?: Array<{ __typename?: 'Pin', id: any, name: string }> | null } };

export type AddCommentToPinMutationVariables = Exact<{
  input: AddCommentToPinInput;
}>;


export type AddCommentToPinMutation = { __typename?: 'Mutation', addCommentToPin: { __typename?: 'CommentToPin', id: any, message: string, createdAt: any, owner: { __typename?: 'User', id: any, nickname: string, nickTag: string } } };

export type UpdateCommentToPinMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  message: Scalars['String']['input'];
}>;


export type UpdateCommentToPinMutation = { __typename?: 'Mutation', updateCommentToPin: { __typename?: 'CommentToPin', message: string } };

export type UpdateCommentToBoardMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  message: Scalars['String']['input'];
}>;


export type UpdateCommentToBoardMutation = { __typename?: 'Mutation', updateCommentToBoard: { __typename?: 'CommentToBoard', message: string } };

export type DeleteCommentToPinMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type DeleteCommentToPinMutation = { __typename?: 'Mutation', deleteCommentToPin: boolean };

export type DeleteCommentToBoardMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type DeleteCommentToBoardMutation = { __typename?: 'Mutation', deleteCommentToBoard: boolean };

export type AddImageToPinMutationVariables = Exact<{
  input: AddImageInput;
}>;


export type AddImageToPinMutation = { __typename?: 'Mutation', addImageToPin: { __typename?: 'PinImage', id: any, imageUrl: string, orderNumber: number } };

export type RemoveImageFromPinMutationVariables = Exact<{
  imageId: Scalars['UUID']['input'];
}>;


export type RemoveImageFromPinMutation = { __typename?: 'Mutation', removeImageFromPin: boolean };


export const GetPinBasicByIdDocument = gql`
    query GetPinBasicById($id: UUID!) {
  pin(id: $id) {
    id
    name
    owner {
      id
      nickname
      profilePicture
    }
    images {
      id
      orderNumber
      imageUrl
    }
  }
}
    `;

/**
 * __useGetPinBasicByIdQuery__
 *
 * To run a query within a React component, call `useGetPinBasicByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPinBasicByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPinBasicByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetPinBasicByIdQuery(baseOptions: Apollo.QueryHookOptions<GetPinBasicByIdQuery, GetPinBasicByIdQueryVariables> & ({ variables: GetPinBasicByIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPinBasicByIdQuery, GetPinBasicByIdQueryVariables>(GetPinBasicByIdDocument, options);
      }
export function useGetPinBasicByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPinBasicByIdQuery, GetPinBasicByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPinBasicByIdQuery, GetPinBasicByIdQueryVariables>(GetPinBasicByIdDocument, options);
        }
export function useGetPinBasicByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPinBasicByIdQuery, GetPinBasicByIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPinBasicByIdQuery, GetPinBasicByIdQueryVariables>(GetPinBasicByIdDocument, options);
        }
export type GetPinBasicByIdQueryHookResult = ReturnType<typeof useGetPinBasicByIdQuery>;
export type GetPinBasicByIdLazyQueryHookResult = ReturnType<typeof useGetPinBasicByIdLazyQuery>;
export type GetPinBasicByIdSuspenseQueryHookResult = ReturnType<typeof useGetPinBasicByIdSuspenseQuery>;
export type GetPinBasicByIdQueryResult = Apollo.QueryResult<GetPinBasicByIdQuery, GetPinBasicByIdQueryVariables>;
export const GetUserByNickTagDocument = gql`
    query GetUserByNickTag($nickTag: String!) {
  userByTag(nickTag: $nickTag) {
    id
    nickname
    email
    nickTag
    profilePicture
    description
    status
    userRating
    followers {
      id
      nickname
    }
    following {
      id
      nickname
    }
  }
}
    `;

/**
 * __useGetUserByNickTagQuery__
 *
 * To run a query within a React component, call `useGetUserByNickTagQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserByNickTagQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserByNickTagQuery({
 *   variables: {
 *      nickTag: // value for 'nickTag'
 *   },
 * });
 */
export function useGetUserByNickTagQuery(baseOptions: Apollo.QueryHookOptions<GetUserByNickTagQuery, GetUserByNickTagQueryVariables> & ({ variables: GetUserByNickTagQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserByNickTagQuery, GetUserByNickTagQueryVariables>(GetUserByNickTagDocument, options);
      }
export function useGetUserByNickTagLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserByNickTagQuery, GetUserByNickTagQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserByNickTagQuery, GetUserByNickTagQueryVariables>(GetUserByNickTagDocument, options);
        }
export function useGetUserByNickTagSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserByNickTagQuery, GetUserByNickTagQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUserByNickTagQuery, GetUserByNickTagQueryVariables>(GetUserByNickTagDocument, options);
        }
export type GetUserByNickTagQueryHookResult = ReturnType<typeof useGetUserByNickTagQuery>;
export type GetUserByNickTagLazyQueryHookResult = ReturnType<typeof useGetUserByNickTagLazyQuery>;
export type GetUserByNickTagSuspenseQueryHookResult = ReturnType<typeof useGetUserByNickTagSuspenseQuery>;
export type GetUserByNickTagQueryResult = Apollo.QueryResult<GetUserByNickTagQuery, GetUserByNickTagQueryVariables>;
export const GetUserByIdDocument = gql`
    query GetUserById($userId: UUID!) {
  userById(userId: $userId) {
    id
    nickname
    email
    nickTag
    profilePicture
    description
    status
    userRating
    followers {
      id
      nickname
    }
    following {
      id
      nickname
    }
  }
}
    `;

/**
 * __useGetUserByIdQuery__
 *
 * To run a query within a React component, call `useGetUserByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserByIdQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetUserByIdQuery(baseOptions: Apollo.QueryHookOptions<GetUserByIdQuery, GetUserByIdQueryVariables> & ({ variables: GetUserByIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserByIdQuery, GetUserByIdQueryVariables>(GetUserByIdDocument, options);
      }
export function useGetUserByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserByIdQuery, GetUserByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserByIdQuery, GetUserByIdQueryVariables>(GetUserByIdDocument, options);
        }
export function useGetUserByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserByIdQuery, GetUserByIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUserByIdQuery, GetUserByIdQueryVariables>(GetUserByIdDocument, options);
        }
export type GetUserByIdQueryHookResult = ReturnType<typeof useGetUserByIdQuery>;
export type GetUserByIdLazyQueryHookResult = ReturnType<typeof useGetUserByIdLazyQuery>;
export type GetUserByIdSuspenseQueryHookResult = ReturnType<typeof useGetUserByIdSuspenseQuery>;
export type GetUserByIdQueryResult = Apollo.QueryResult<GetUserByIdQuery, GetUserByIdQueryVariables>;
export const GetPinsByUserIdDocument = gql`
    query GetPinsByUserId($userId: UUID!, $viewerId: UUID, $limit: Int = 10, $offset: Int = 0) {
  pinsByUser(userId: $userId, viewerId: $viewerId, limit: $limit, offset: $offset) {
    id
    name
    latitude
    longitude
    description
    rating
    createdAt
    owner {
      id
      nickname
      profilePicture
    }
    images {
      id
      orderNumber
      imageUrl
    }
  }
}
    `;

/**
 * __useGetPinsByUserIdQuery__
 *
 * To run a query within a React component, call `useGetPinsByUserIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPinsByUserIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPinsByUserIdQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *      viewerId: // value for 'viewerId'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetPinsByUserIdQuery(baseOptions: Apollo.QueryHookOptions<GetPinsByUserIdQuery, GetPinsByUserIdQueryVariables> & ({ variables: GetPinsByUserIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPinsByUserIdQuery, GetPinsByUserIdQueryVariables>(GetPinsByUserIdDocument, options);
      }
export function useGetPinsByUserIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPinsByUserIdQuery, GetPinsByUserIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPinsByUserIdQuery, GetPinsByUserIdQueryVariables>(GetPinsByUserIdDocument, options);
        }
export function useGetPinsByUserIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPinsByUserIdQuery, GetPinsByUserIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPinsByUserIdQuery, GetPinsByUserIdQueryVariables>(GetPinsByUserIdDocument, options);
        }
export type GetPinsByUserIdQueryHookResult = ReturnType<typeof useGetPinsByUserIdQuery>;
export type GetPinsByUserIdLazyQueryHookResult = ReturnType<typeof useGetPinsByUserIdLazyQuery>;
export type GetPinsByUserIdSuspenseQueryHookResult = ReturnType<typeof useGetPinsByUserIdSuspenseQuery>;
export type GetPinsByUserIdQueryResult = Apollo.QueryResult<GetPinsByUserIdQuery, GetPinsByUserIdQueryVariables>;
export const GetLikedPinsByUserIdDocument = gql`
    query GetLikedPinsByUserId($userID: UUID!, $limit: Int = 10, $offset: Int = 0) {
  likedPinsByUser(userID: $userID, limit: $limit, offset: $offset) {
    id
    name
    latitude
    longitude
    description
    rating
    createdAt
    owner {
      id
      nickname
      profilePicture
    }
    images {
      id
      orderNumber
      imageUrl
    }
  }
}
    `;

/**
 * __useGetLikedPinsByUserIdQuery__
 *
 * To run a query within a React component, call `useGetLikedPinsByUserIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLikedPinsByUserIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLikedPinsByUserIdQuery({
 *   variables: {
 *      userID: // value for 'userID'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetLikedPinsByUserIdQuery(baseOptions: Apollo.QueryHookOptions<GetLikedPinsByUserIdQuery, GetLikedPinsByUserIdQueryVariables> & ({ variables: GetLikedPinsByUserIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLikedPinsByUserIdQuery, GetLikedPinsByUserIdQueryVariables>(GetLikedPinsByUserIdDocument, options);
      }
export function useGetLikedPinsByUserIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLikedPinsByUserIdQuery, GetLikedPinsByUserIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLikedPinsByUserIdQuery, GetLikedPinsByUserIdQueryVariables>(GetLikedPinsByUserIdDocument, options);
        }
export function useGetLikedPinsByUserIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLikedPinsByUserIdQuery, GetLikedPinsByUserIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetLikedPinsByUserIdQuery, GetLikedPinsByUserIdQueryVariables>(GetLikedPinsByUserIdDocument, options);
        }
export type GetLikedPinsByUserIdQueryHookResult = ReturnType<typeof useGetLikedPinsByUserIdQuery>;
export type GetLikedPinsByUserIdLazyQueryHookResult = ReturnType<typeof useGetLikedPinsByUserIdLazyQuery>;
export type GetLikedPinsByUserIdSuspenseQueryHookResult = ReturnType<typeof useGetLikedPinsByUserIdSuspenseQuery>;
export type GetLikedPinsByUserIdQueryResult = Apollo.QueryResult<GetLikedPinsByUserIdQuery, GetLikedPinsByUserIdQueryVariables>;
export const GetOwnBoardsByUserIdDocument = gql`
    query GetOwnBoardsByUserId($userId: UUID!, $limit: Int = 10, $offset: Int = 0) {
  ownBoardsByUser(userId: $userId, limit: $limit, offset: $offset) {
    id
    name
    description
    accessLevel
    ownerId
    authorId
    ownerType
    createdAt
    savedAt
    pins {
      id
      name
      owner {
        id
        nickname
        profilePicture
      }
      images {
        id
        orderNumber
        imageUrl
      }
    }
    reactionId
    bookmarked
  }
}
    `;

/**
 * __useGetOwnBoardsByUserIdQuery__
 *
 * To run a query within a React component, call `useGetOwnBoardsByUserIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOwnBoardsByUserIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOwnBoardsByUserIdQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetOwnBoardsByUserIdQuery(baseOptions: Apollo.QueryHookOptions<GetOwnBoardsByUserIdQuery, GetOwnBoardsByUserIdQueryVariables> & ({ variables: GetOwnBoardsByUserIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOwnBoardsByUserIdQuery, GetOwnBoardsByUserIdQueryVariables>(GetOwnBoardsByUserIdDocument, options);
      }
export function useGetOwnBoardsByUserIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOwnBoardsByUserIdQuery, GetOwnBoardsByUserIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOwnBoardsByUserIdQuery, GetOwnBoardsByUserIdQueryVariables>(GetOwnBoardsByUserIdDocument, options);
        }
export function useGetOwnBoardsByUserIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetOwnBoardsByUserIdQuery, GetOwnBoardsByUserIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOwnBoardsByUserIdQuery, GetOwnBoardsByUserIdQueryVariables>(GetOwnBoardsByUserIdDocument, options);
        }
export type GetOwnBoardsByUserIdQueryHookResult = ReturnType<typeof useGetOwnBoardsByUserIdQuery>;
export type GetOwnBoardsByUserIdLazyQueryHookResult = ReturnType<typeof useGetOwnBoardsByUserIdLazyQuery>;
export type GetOwnBoardsByUserIdSuspenseQueryHookResult = ReturnType<typeof useGetOwnBoardsByUserIdSuspenseQuery>;
export type GetOwnBoardsByUserIdQueryResult = Apollo.QueryResult<GetOwnBoardsByUserIdQuery, GetOwnBoardsByUserIdQueryVariables>;
export const GetLikedBoardsByUserIdDocument = gql`
    query GetLikedBoardsByUserId($userID: UUID!, $limit: Int = 10, $offset: Int = 0) {
  likedBoardsByUser(userID: $userID, limit: $limit, offset: $offset) {
    id
    name
    description
    accessLevel
    ownerId
    authorId
    ownerType
    createdAt
    savedAt
    pins {
      id
      name
      owner {
        id
        nickname
        profilePicture
      }
      images {
        id
        orderNumber
        imageUrl
      }
    }
    reactionId
    bookmarked
  }
}
    `;

/**
 * __useGetLikedBoardsByUserIdQuery__
 *
 * To run a query within a React component, call `useGetLikedBoardsByUserIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLikedBoardsByUserIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLikedBoardsByUserIdQuery({
 *   variables: {
 *      userID: // value for 'userID'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetLikedBoardsByUserIdQuery(baseOptions: Apollo.QueryHookOptions<GetLikedBoardsByUserIdQuery, GetLikedBoardsByUserIdQueryVariables> & ({ variables: GetLikedBoardsByUserIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLikedBoardsByUserIdQuery, GetLikedBoardsByUserIdQueryVariables>(GetLikedBoardsByUserIdDocument, options);
      }
export function useGetLikedBoardsByUserIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLikedBoardsByUserIdQuery, GetLikedBoardsByUserIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLikedBoardsByUserIdQuery, GetLikedBoardsByUserIdQueryVariables>(GetLikedBoardsByUserIdDocument, options);
        }
export function useGetLikedBoardsByUserIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLikedBoardsByUserIdQuery, GetLikedBoardsByUserIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetLikedBoardsByUserIdQuery, GetLikedBoardsByUserIdQueryVariables>(GetLikedBoardsByUserIdDocument, options);
        }
export type GetLikedBoardsByUserIdQueryHookResult = ReturnType<typeof useGetLikedBoardsByUserIdQuery>;
export type GetLikedBoardsByUserIdLazyQueryHookResult = ReturnType<typeof useGetLikedBoardsByUserIdLazyQuery>;
export type GetLikedBoardsByUserIdSuspenseQueryHookResult = ReturnType<typeof useGetLikedBoardsByUserIdSuspenseQuery>;
export type GetLikedBoardsByUserIdQueryResult = Apollo.QueryResult<GetLikedBoardsByUserIdQuery, GetLikedBoardsByUserIdQueryVariables>;
export const GetUserIdByNickTagDocument = gql`
    query GetUserIdByNickTag($nickTag: String!) {
  userByTag(nickTag: $nickTag) {
    id
  }
}
    `;

/**
 * __useGetUserIdByNickTagQuery__
 *
 * To run a query within a React component, call `useGetUserIdByNickTagQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserIdByNickTagQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserIdByNickTagQuery({
 *   variables: {
 *      nickTag: // value for 'nickTag'
 *   },
 * });
 */
export function useGetUserIdByNickTagQuery(baseOptions: Apollo.QueryHookOptions<GetUserIdByNickTagQuery, GetUserIdByNickTagQueryVariables> & ({ variables: GetUserIdByNickTagQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserIdByNickTagQuery, GetUserIdByNickTagQueryVariables>(GetUserIdByNickTagDocument, options);
      }
export function useGetUserIdByNickTagLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserIdByNickTagQuery, GetUserIdByNickTagQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserIdByNickTagQuery, GetUserIdByNickTagQueryVariables>(GetUserIdByNickTagDocument, options);
        }
export function useGetUserIdByNickTagSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserIdByNickTagQuery, GetUserIdByNickTagQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUserIdByNickTagQuery, GetUserIdByNickTagQueryVariables>(GetUserIdByNickTagDocument, options);
        }
export type GetUserIdByNickTagQueryHookResult = ReturnType<typeof useGetUserIdByNickTagQuery>;
export type GetUserIdByNickTagLazyQueryHookResult = ReturnType<typeof useGetUserIdByNickTagLazyQuery>;
export type GetUserIdByNickTagSuspenseQueryHookResult = ReturnType<typeof useGetUserIdByNickTagSuspenseQuery>;
export type GetUserIdByNickTagQueryResult = Apollo.QueryResult<GetUserIdByNickTagQuery, GetUserIdByNickTagQueryVariables>;
export const GetFollowersByIdDocument = gql`
    query GetFollowersById($userId: UUID!) {
  followersOf(userId: $userId) {
    id
    nickname
    email
    nickTag
    profilePicture
    description
    status
    userRating
    followers {
      id
      nickname
    }
    following {
      id
      nickname
    }
  }
}
    `;

/**
 * __useGetFollowersByIdQuery__
 *
 * To run a query within a React component, call `useGetFollowersByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFollowersByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFollowersByIdQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetFollowersByIdQuery(baseOptions: Apollo.QueryHookOptions<GetFollowersByIdQuery, GetFollowersByIdQueryVariables> & ({ variables: GetFollowersByIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFollowersByIdQuery, GetFollowersByIdQueryVariables>(GetFollowersByIdDocument, options);
      }
export function useGetFollowersByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFollowersByIdQuery, GetFollowersByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFollowersByIdQuery, GetFollowersByIdQueryVariables>(GetFollowersByIdDocument, options);
        }
export function useGetFollowersByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFollowersByIdQuery, GetFollowersByIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFollowersByIdQuery, GetFollowersByIdQueryVariables>(GetFollowersByIdDocument, options);
        }
export type GetFollowersByIdQueryHookResult = ReturnType<typeof useGetFollowersByIdQuery>;
export type GetFollowersByIdLazyQueryHookResult = ReturnType<typeof useGetFollowersByIdLazyQuery>;
export type GetFollowersByIdSuspenseQueryHookResult = ReturnType<typeof useGetFollowersByIdSuspenseQuery>;
export type GetFollowersByIdQueryResult = Apollo.QueryResult<GetFollowersByIdQuery, GetFollowersByIdQueryVariables>;
export const CreateGroupDocument = gql`
    mutation CreateGroup($input: CreateGroupInput!) {
  createGroup(input: $input) {
    id
    members {
      id
    }
  }
}
    `;
export type CreateGroupMutationFn = Apollo.MutationFunction<CreateGroupMutation, CreateGroupMutationVariables>;

/**
 * __useCreateGroupMutation__
 *
 * To run a mutation, you first call `useCreateGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGroupMutation, { data, loading, error }] = useCreateGroupMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateGroupMutation(baseOptions?: Apollo.MutationHookOptions<CreateGroupMutation, CreateGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateGroupMutation, CreateGroupMutationVariables>(CreateGroupDocument, options);
      }
export type CreateGroupMutationHookResult = ReturnType<typeof useCreateGroupMutation>;
export type CreateGroupMutationResult = Apollo.MutationResult<CreateGroupMutation>;
export type CreateGroupMutationOptions = Apollo.BaseMutationOptions<CreateGroupMutation, CreateGroupMutationVariables>;
export const CreateBoardDocument = gql`
    mutation CreateBoard($input: CreateBoardInput!) {
  createBoard(input: $input) {
    id
  }
}
    `;
export type CreateBoardMutationFn = Apollo.MutationFunction<CreateBoardMutation, CreateBoardMutationVariables>;

/**
 * __useCreateBoardMutation__
 *
 * To run a mutation, you first call `useCreateBoardMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateBoardMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createBoardMutation, { data, loading, error }] = useCreateBoardMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateBoardMutation(baseOptions?: Apollo.MutationHookOptions<CreateBoardMutation, CreateBoardMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateBoardMutation, CreateBoardMutationVariables>(CreateBoardDocument, options);
      }
export type CreateBoardMutationHookResult = ReturnType<typeof useCreateBoardMutation>;
export type CreateBoardMutationResult = Apollo.MutationResult<CreateBoardMutation>;
export type CreateBoardMutationOptions = Apollo.BaseMutationOptions<CreateBoardMutation, CreateBoardMutationVariables>;
export const GetPinFullByIdDocument = gql`
    query GetPinFullById($id: UUID!) {
  pin(id: $id) {
    id
    name
    latitude
    longitude
    description
    rating
    createdAt
    owner {
      id
      nickname
      profilePicture
    }
    images {
      id
      orderNumber
      imageUrl
    }
  }
}
    `;

/**
 * __useGetPinFullByIdQuery__
 *
 * To run a query within a React component, call `useGetPinFullByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPinFullByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPinFullByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetPinFullByIdQuery(baseOptions: Apollo.QueryHookOptions<GetPinFullByIdQuery, GetPinFullByIdQueryVariables> & ({ variables: GetPinFullByIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPinFullByIdQuery, GetPinFullByIdQueryVariables>(GetPinFullByIdDocument, options);
      }
export function useGetPinFullByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPinFullByIdQuery, GetPinFullByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPinFullByIdQuery, GetPinFullByIdQueryVariables>(GetPinFullByIdDocument, options);
        }
export function useGetPinFullByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPinFullByIdQuery, GetPinFullByIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPinFullByIdQuery, GetPinFullByIdQueryVariables>(GetPinFullByIdDocument, options);
        }
export type GetPinFullByIdQueryHookResult = ReturnType<typeof useGetPinFullByIdQuery>;
export type GetPinFullByIdLazyQueryHookResult = ReturnType<typeof useGetPinFullByIdLazyQuery>;
export type GetPinFullByIdSuspenseQueryHookResult = ReturnType<typeof useGetPinFullByIdSuspenseQuery>;
export type GetPinFullByIdQueryResult = Apollo.QueryResult<GetPinFullByIdQuery, GetPinFullByIdQueryVariables>;
export const CreatePinDocument = gql`
    mutation CreatePin($input: CreatePinInput!) {
  createPin(input: $input) {
    id
    name
    latitude
    longitude
    description
    rating
    createdAt
    images {
      id
      orderNumber
      imageUrl
    }
  }
}
    `;
export type CreatePinMutationFn = Apollo.MutationFunction<CreatePinMutation, CreatePinMutationVariables>;

/**
 * __useCreatePinMutation__
 *
 * To run a mutation, you first call `useCreatePinMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePinMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPinMutation, { data, loading, error }] = useCreatePinMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreatePinMutation(baseOptions?: Apollo.MutationHookOptions<CreatePinMutation, CreatePinMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreatePinMutation, CreatePinMutationVariables>(CreatePinDocument, options);
      }
export type CreatePinMutationHookResult = ReturnType<typeof useCreatePinMutation>;
export type CreatePinMutationResult = Apollo.MutationResult<CreatePinMutation>;
export type CreatePinMutationOptions = Apollo.BaseMutationOptions<CreatePinMutation, CreatePinMutationVariables>;
export const UpdatePinDocument = gql`
    mutation UpdatePin($id: UUID!, $input: UpdatePinInput!) {
  updatePin(id: $id, input: $input) {
    id
    name
    latitude
    longitude
    description
    rating
    createdAt
  }
}
    `;
export type UpdatePinMutationFn = Apollo.MutationFunction<UpdatePinMutation, UpdatePinMutationVariables>;

/**
 * __useUpdatePinMutation__
 *
 * To run a mutation, you first call `useUpdatePinMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePinMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePinMutation, { data, loading, error }] = useUpdatePinMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdatePinMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePinMutation, UpdatePinMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdatePinMutation, UpdatePinMutationVariables>(UpdatePinDocument, options);
      }
export type UpdatePinMutationHookResult = ReturnType<typeof useUpdatePinMutation>;
export type UpdatePinMutationResult = Apollo.MutationResult<UpdatePinMutation>;
export type UpdatePinMutationOptions = Apollo.BaseMutationOptions<UpdatePinMutation, UpdatePinMutationVariables>;
export const AddPinToBoardDocument = gql`
    mutation AddPinToBoard($pinId: UUID!, $boardId: UUID!) {
  addPinToBoard(pinId: $pinId, boardId: $boardId) {
    id
    name
    pins {
      id
      name
    }
  }
}
    `;
export type AddPinToBoardMutationFn = Apollo.MutationFunction<AddPinToBoardMutation, AddPinToBoardMutationVariables>;

/**
 * __useAddPinToBoardMutation__
 *
 * To run a mutation, you first call `useAddPinToBoardMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddPinToBoardMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addPinToBoardMutation, { data, loading, error }] = useAddPinToBoardMutation({
 *   variables: {
 *      pinId: // value for 'pinId'
 *      boardId: // value for 'boardId'
 *   },
 * });
 */
export function useAddPinToBoardMutation(baseOptions?: Apollo.MutationHookOptions<AddPinToBoardMutation, AddPinToBoardMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddPinToBoardMutation, AddPinToBoardMutationVariables>(AddPinToBoardDocument, options);
      }
export type AddPinToBoardMutationHookResult = ReturnType<typeof useAddPinToBoardMutation>;
export type AddPinToBoardMutationResult = Apollo.MutationResult<AddPinToBoardMutation>;
export type AddPinToBoardMutationOptions = Apollo.BaseMutationOptions<AddPinToBoardMutation, AddPinToBoardMutationVariables>;
export const RemovePinFromBoardDocument = gql`
    mutation RemovePinFromBoard($pinId: UUID!, $boardId: UUID!) {
  removePinFromBoard(pinId: $pinId, boardId: $boardId) {
    id
    name
    pins {
      id
      name
    }
  }
}
    `;
export type RemovePinFromBoardMutationFn = Apollo.MutationFunction<RemovePinFromBoardMutation, RemovePinFromBoardMutationVariables>;

/**
 * __useRemovePinFromBoardMutation__
 *
 * To run a mutation, you first call `useRemovePinFromBoardMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemovePinFromBoardMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removePinFromBoardMutation, { data, loading, error }] = useRemovePinFromBoardMutation({
 *   variables: {
 *      pinId: // value for 'pinId'
 *      boardId: // value for 'boardId'
 *   },
 * });
 */
export function useRemovePinFromBoardMutation(baseOptions?: Apollo.MutationHookOptions<RemovePinFromBoardMutation, RemovePinFromBoardMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemovePinFromBoardMutation, RemovePinFromBoardMutationVariables>(RemovePinFromBoardDocument, options);
      }
export type RemovePinFromBoardMutationHookResult = ReturnType<typeof useRemovePinFromBoardMutation>;
export type RemovePinFromBoardMutationResult = Apollo.MutationResult<RemovePinFromBoardMutation>;
export type RemovePinFromBoardMutationOptions = Apollo.BaseMutationOptions<RemovePinFromBoardMutation, RemovePinFromBoardMutationVariables>;
export const AddCommentToPinDocument = gql`
    mutation AddCommentToPin($input: AddCommentToPinInput!) {
  addCommentToPin(input: $input) {
    id
    message
    createdAt
    owner {
      id
      nickname
      nickTag
    }
  }
}
    `;
export type AddCommentToPinMutationFn = Apollo.MutationFunction<AddCommentToPinMutation, AddCommentToPinMutationVariables>;

/**
 * __useAddCommentToPinMutation__
 *
 * To run a mutation, you first call `useAddCommentToPinMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddCommentToPinMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addCommentToPinMutation, { data, loading, error }] = useAddCommentToPinMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddCommentToPinMutation(baseOptions?: Apollo.MutationHookOptions<AddCommentToPinMutation, AddCommentToPinMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddCommentToPinMutation, AddCommentToPinMutationVariables>(AddCommentToPinDocument, options);
      }
export type AddCommentToPinMutationHookResult = ReturnType<typeof useAddCommentToPinMutation>;
export type AddCommentToPinMutationResult = Apollo.MutationResult<AddCommentToPinMutation>;
export type AddCommentToPinMutationOptions = Apollo.BaseMutationOptions<AddCommentToPinMutation, AddCommentToPinMutationVariables>;
export const UpdateCommentToPinDocument = gql`
    mutation updateCommentToPin($id: UUID!, $message: String!) {
  updateCommentToPin(id: UUID, message: $message) {
    message
  }
}
    `;
export type UpdateCommentToPinMutationFn = Apollo.MutationFunction<UpdateCommentToPinMutation, UpdateCommentToPinMutationVariables>;

/**
 * __useUpdateCommentToPinMutation__
 *
 * To run a mutation, you first call `useUpdateCommentToPinMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCommentToPinMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCommentToPinMutation, { data, loading, error }] = useUpdateCommentToPinMutation({
 *   variables: {
 *      id: // value for 'id'
 *      message: // value for 'message'
 *   },
 * });
 */
export function useUpdateCommentToPinMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCommentToPinMutation, UpdateCommentToPinMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCommentToPinMutation, UpdateCommentToPinMutationVariables>(UpdateCommentToPinDocument, options);
      }
export type UpdateCommentToPinMutationHookResult = ReturnType<typeof useUpdateCommentToPinMutation>;
export type UpdateCommentToPinMutationResult = Apollo.MutationResult<UpdateCommentToPinMutation>;
export type UpdateCommentToPinMutationOptions = Apollo.BaseMutationOptions<UpdateCommentToPinMutation, UpdateCommentToPinMutationVariables>;
export const UpdateCommentToBoardDocument = gql`
    mutation updateCommentToBoard($id: UUID!, $message: String!) {
  updateCommentToBoard(id: UUID, message: $message) {
    message
  }
}
    `;
export type UpdateCommentToBoardMutationFn = Apollo.MutationFunction<UpdateCommentToBoardMutation, UpdateCommentToBoardMutationVariables>;

/**
 * __useUpdateCommentToBoardMutation__
 *
 * To run a mutation, you first call `useUpdateCommentToBoardMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCommentToBoardMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCommentToBoardMutation, { data, loading, error }] = useUpdateCommentToBoardMutation({
 *   variables: {
 *      id: // value for 'id'
 *      message: // value for 'message'
 *   },
 * });
 */
export function useUpdateCommentToBoardMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCommentToBoardMutation, UpdateCommentToBoardMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCommentToBoardMutation, UpdateCommentToBoardMutationVariables>(UpdateCommentToBoardDocument, options);
      }
export type UpdateCommentToBoardMutationHookResult = ReturnType<typeof useUpdateCommentToBoardMutation>;
export type UpdateCommentToBoardMutationResult = Apollo.MutationResult<UpdateCommentToBoardMutation>;
export type UpdateCommentToBoardMutationOptions = Apollo.BaseMutationOptions<UpdateCommentToBoardMutation, UpdateCommentToBoardMutationVariables>;
export const DeleteCommentToPinDocument = gql`
    mutation deleteCommentToPin($id: UUID!) {
  deleteCommentToPin(id: $id)
}
    `;
export type DeleteCommentToPinMutationFn = Apollo.MutationFunction<DeleteCommentToPinMutation, DeleteCommentToPinMutationVariables>;

/**
 * __useDeleteCommentToPinMutation__
 *
 * To run a mutation, you first call `useDeleteCommentToPinMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCommentToPinMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCommentToPinMutation, { data, loading, error }] = useDeleteCommentToPinMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteCommentToPinMutation(baseOptions?: Apollo.MutationHookOptions<DeleteCommentToPinMutation, DeleteCommentToPinMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteCommentToPinMutation, DeleteCommentToPinMutationVariables>(DeleteCommentToPinDocument, options);
      }
export type DeleteCommentToPinMutationHookResult = ReturnType<typeof useDeleteCommentToPinMutation>;
export type DeleteCommentToPinMutationResult = Apollo.MutationResult<DeleteCommentToPinMutation>;
export type DeleteCommentToPinMutationOptions = Apollo.BaseMutationOptions<DeleteCommentToPinMutation, DeleteCommentToPinMutationVariables>;
export const DeleteCommentToBoardDocument = gql`
    mutation deleteCommentToBoard($id: UUID!) {
  deleteCommentToBoard(id: $id)
}
    `;
export type DeleteCommentToBoardMutationFn = Apollo.MutationFunction<DeleteCommentToBoardMutation, DeleteCommentToBoardMutationVariables>;

/**
 * __useDeleteCommentToBoardMutation__
 *
 * To run a mutation, you first call `useDeleteCommentToBoardMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCommentToBoardMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCommentToBoardMutation, { data, loading, error }] = useDeleteCommentToBoardMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteCommentToBoardMutation(baseOptions?: Apollo.MutationHookOptions<DeleteCommentToBoardMutation, DeleteCommentToBoardMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteCommentToBoardMutation, DeleteCommentToBoardMutationVariables>(DeleteCommentToBoardDocument, options);
      }
export type DeleteCommentToBoardMutationHookResult = ReturnType<typeof useDeleteCommentToBoardMutation>;
export type DeleteCommentToBoardMutationResult = Apollo.MutationResult<DeleteCommentToBoardMutation>;
export type DeleteCommentToBoardMutationOptions = Apollo.BaseMutationOptions<DeleteCommentToBoardMutation, DeleteCommentToBoardMutationVariables>;
export const AddImageToPinDocument = gql`
    mutation AddImageToPin($input: AddImageInput!) {
  addImageToPin(input: $input) {
    id
    imageUrl
    orderNumber
  }
}
    `;
export type AddImageToPinMutationFn = Apollo.MutationFunction<AddImageToPinMutation, AddImageToPinMutationVariables>;

/**
 * __useAddImageToPinMutation__
 *
 * To run a mutation, you first call `useAddImageToPinMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddImageToPinMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addImageToPinMutation, { data, loading, error }] = useAddImageToPinMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddImageToPinMutation(baseOptions?: Apollo.MutationHookOptions<AddImageToPinMutation, AddImageToPinMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddImageToPinMutation, AddImageToPinMutationVariables>(AddImageToPinDocument, options);
      }
export type AddImageToPinMutationHookResult = ReturnType<typeof useAddImageToPinMutation>;
export type AddImageToPinMutationResult = Apollo.MutationResult<AddImageToPinMutation>;
export type AddImageToPinMutationOptions = Apollo.BaseMutationOptions<AddImageToPinMutation, AddImageToPinMutationVariables>;
export const RemoveImageFromPinDocument = gql`
    mutation RemoveImageFromPin($imageId: UUID!) {
  removeImageFromPin(imageId: $imageId)
}
    `;
export type RemoveImageFromPinMutationFn = Apollo.MutationFunction<RemoveImageFromPinMutation, RemoveImageFromPinMutationVariables>;

/**
 * __useRemoveImageFromPinMutation__
 *
 * To run a mutation, you first call `useRemoveImageFromPinMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveImageFromPinMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeImageFromPinMutation, { data, loading, error }] = useRemoveImageFromPinMutation({
 *   variables: {
 *      imageId: // value for 'imageId'
 *   },
 * });
 */
export function useRemoveImageFromPinMutation(baseOptions?: Apollo.MutationHookOptions<RemoveImageFromPinMutation, RemoveImageFromPinMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveImageFromPinMutation, RemoveImageFromPinMutationVariables>(RemoveImageFromPinDocument, options);
      }
export type RemoveImageFromPinMutationHookResult = ReturnType<typeof useRemoveImageFromPinMutation>;
export type RemoveImageFromPinMutationResult = Apollo.MutationResult<RemoveImageFromPinMutation>;
export type RemoveImageFromPinMutationOptions = Apollo.BaseMutationOptions<RemoveImageFromPinMutation, RemoveImageFromPinMutationVariables>;