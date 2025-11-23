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
  join__DirectiveArguments: { input: any; output: any; }
  join__FieldSet: { input: any; output: any; }
  link__Import: { input: any; output: any; }
};

export type AccessLevel = {
  __typename?: 'AccessLevel';
  id: Scalars['UUID']['output'];
  type: Scalars['String']['output'];
};

export type AddCommentInput = {
  content: Scalars['String']['input'];
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
  accessLevel: AccessLevel;
  createdAt: Scalars['Time']['output'];
  groupId: Group;
  id: Scalars['UUID']['output'];
  name: Scalars['String']['output'];
  pins?: Maybe<Array<Pin>>;
};

export type Comment = {
  __typename?: 'Comment';
  author: User;
  content: Scalars['String']['output'];
  createdAt: Scalars['Time']['output'];
  id: Scalars['UUID']['output'];
};

export type CommonParams = {
  kind?: InputMaybe<Scalars['String']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  resultsQ?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateBoardInput = {
  accessLevelId: Scalars['UUID']['input'];
  groupId: Scalars['UUID']['input'];
  name: Scalars['String']['input'];
};

export type CreateGroupInput = {
  memberIds: Array<Scalars['ID']['input']>;
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
  nickname: Scalars['String']['input'];
  password: Scalars['String']['input'];
  profilePicture?: InputMaybe<Scalars['String']['input']>;
};

export type Group = {
  __typename?: 'Group';
  id: Scalars['ID']['output'];
  members: Array<User>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addCommentToPin: Comment;
  addImageToPin: PinImage;
  addPinToBoard: Board;
  addUserToGroup: Scalars['Boolean']['output'];
  createBoard: Board;
  createGroup: Group;
  createPin: Pin;
  createUser: User;
  deleteComment: Scalars['Boolean']['output'];
  deleteGroup: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  followUser: Scalars['Boolean']['output'];
  removeImageFromPin: Scalars['Boolean']['output'];
  removePinFromBoard: Board;
  removeUserFromGroup: Scalars['Boolean']['output'];
  unfollowUser: Scalars['Boolean']['output'];
  updateBoard: Board;
  updateComment: Comment;
  updateImageOrder: PinImage;
  updatePin: Pin;
  updateUser: User;
};


export type MutationAddCommentToPinArgs = {
  input: AddCommentInput;
};


export type MutationAddImageToPinArgs = {
  input: AddImageInput;
};


export type MutationAddPinToBoardArgs = {
  boardId: Scalars['UUID']['input'];
  pinId: Scalars['UUID']['input'];
};


export type MutationAddUserToGroupArgs = {
  groupId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
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


export type MutationDeleteCommentArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationDeleteGroupArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationFollowUserArgs = {
  followerId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationRemoveImageFromPinArgs = {
  imageId: Scalars['UUID']['input'];
};


export type MutationRemovePinFromBoardArgs = {
  boardId: Scalars['UUID']['input'];
  pinId: Scalars['UUID']['input'];
};


export type MutationRemoveUserFromGroupArgs = {
  groupId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationUnfollowUserArgs = {
  followerId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationUpdateBoardArgs = {
  id: Scalars['UUID']['input'];
  input: UpdateBoardInput;
};


export type MutationUpdateCommentArgs = {
  content: Scalars['String']['input'];
  id: Scalars['UUID']['input'];
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
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
};

export type Pin = {
  __typename?: 'Pin';
  comments?: Maybe<Array<Comment>>;
  createdAt: Scalars['Time']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  images?: Maybe<Array<PinImage>>;
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  owner: User;
  rating: Scalars['Float']['output'];
};

export type PinImage = {
  __typename?: 'PinImage';
  id: Scalars['UUID']['output'];
  imageUrl: Scalars['String']['output'];
  orderNumber: Scalars['Int']['output'];
};

export type PlaceData = {
  __typename?: 'PlaceData';
  addr: Scalars['String']['output'];
  descr: Scalars['String']['output'];
  id: Scalars['String']['output'];
  kind: Scalars['String']['output'];
  lat: Scalars['Float']['output'];
  lon: Scalars['Float']['output'];
};

export type Point = {
  __typename?: 'Point';
  lat: Scalars['Float']['output'];
  lon: Scalars['Float']['output'];
};

export type PointInput = {
  lat: Scalars['Float']['input'];
  lon: Scalars['Float']['input'];
};

export type Query = {
  __typename?: 'Query';
  board?: Maybe<Board>;
  boardByName?: Maybe<Array<Board>>;
  boardsByGroup?: Maybe<Array<Board>>;
  feed: Array<Pin>;
  followersOf: Array<User>;
  followingOf: Array<User>;
  groupById?: Maybe<Array<User>>;
  groupsOfUser: Array<Group>;
  isUserInGroup: Scalars['Boolean']['output'];
  pin?: Maybe<Pin>;
  pinsByLocation?: Maybe<Array<Pin>>;
  pinsByName?: Maybe<Array<Pin>>;
  pinsByUser?: Maybe<Array<Pin>>;
  placeInfo: Array<PlaceData>;
  userByEmail?: Maybe<User>;
  userById?: Maybe<User>;
  userByNickname?: Maybe<User>;
};


export type QueryBoardArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryBoardByNameArgs = {
  name: Scalars['String']['input'];
};


export type QueryBoardsByGroupArgs = {
  groupId: Scalars['UUID']['input'];
};


export type QueryFollowersOfArgs = {
  userId: Scalars['ID']['input'];
};


export type QueryFollowingOfArgs = {
  userId: Scalars['ID']['input'];
};


export type QueryGroupByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGroupsOfUserArgs = {
  userId: Scalars['ID']['input'];
};


export type QueryIsUserInGroupArgs = {
  group_id: Scalars['ID']['input'];
  user_id: Scalars['ID']['input'];
};


export type QueryPinArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryPinsByLocationArgs = {
  query: Scalars['String']['input'];
};


export type QueryPinsByNameArgs = {
  name: Scalars['String']['input'];
};


export type QueryPinsByUserArgs = {
  userId: Scalars['UUID']['input'];
};


export type QueryPlaceInfoArgs = {
  params?: InputMaybe<CommonParams>;
  point: PointInput;
};


export type QueryUserByEmailArgs = {
  email: Scalars['String']['input'];
};


export type QueryUserByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUserByNicknameArgs = {
  nickname: Scalars['String']['input'];
};

export type UpdateBoardInput = {
  accessLevelId?: InputMaybe<Scalars['UUID']['input']>;
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
  nickname?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  profilePicture?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  description?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  followers: Array<User>;
  following: Array<User>;
  id: Scalars['ID']['output'];
  nickname: Scalars['String']['output'];
  profilePicture?: Maybe<Scalars['String']['output']>;
  userRating: Scalars['Float']['output'];
};

export enum Join__Graph {
  Geoapi = 'GEOAPI'
}

export enum Link__Purpose {
  /** `EXECUTION` features provide metadata necessary for operation execution. */
  Execution = 'EXECUTION',
  /** `SECURITY` features provide metadata necessary to securely resolve fields. */
  Security = 'SECURITY'
}

export type GetPinBasicByIdQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type GetPinBasicByIdQuery = { __typename?: 'Query', pin?: { __typename?: 'Pin', id: any, name: string, owner: { __typename?: 'User', id: string, nickname: string, profilePicture?: string | null }, images?: Array<{ __typename?: 'PinImage', id: any, orderNumber: number, imageUrl: string }> | null } | null };

export type GetPinFullByIdQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type GetPinFullByIdQuery = { __typename?: 'Query', pin?: { __typename?: 'Pin', id: any, name: string, latitude: number, longitude: number, description?: string | null, rating: number, createdAt: any, owner: { __typename?: 'User', id: string, nickname: string, profilePicture?: string | null }, images?: Array<{ __typename?: 'PinImage', id: any, orderNumber: number, imageUrl: string }> | null, comments?: Array<{ __typename?: 'Comment', id: any, content: string, createdAt: any, author: { __typename?: 'User', id: string, nickname: string, profilePicture?: string | null } }> | null } | null };

export type CreatePinMutationVariables = Exact<{
  input: CreatePinInput;
}>;


export type CreatePinMutation = { __typename?: 'Mutation', createPin: { __typename?: 'Pin', id: any, name: string, latitude: number, longitude: number, description?: string | null, rating: number, createdAt: any, images?: Array<{ __typename?: 'PinImage', id: any, orderNumber: number, imageUrl: string }> | null } };

export type UpdatePinMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  input: UpdatePinInput;
}>;


export type UpdatePinMutation = { __typename?: 'Mutation', updatePin: { __typename?: 'Pin', id: any, name: string, latitude: number, longitude: number, description?: string | null, rating: number, createdAt: any, comments?: Array<{ __typename?: 'Comment', id: any, content: string, createdAt: any, author: { __typename?: 'User', id: string, nickname: string, profilePicture?: string | null } }> | null } };

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
  input: AddCommentInput;
}>;


export type AddCommentToPinMutation = { __typename?: 'Mutation', addCommentToPin: { __typename?: 'Comment', id: any, content: string, createdAt: any, author: { __typename?: 'User', id: string } } };

export type UpdateCommentMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  content: Scalars['String']['input'];
}>;


export type UpdateCommentMutation = { __typename?: 'Mutation', updateComment: { __typename?: 'Comment', id: any, content: string, createdAt: any } };

export type DeleteCommentMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type DeleteCommentMutation = { __typename?: 'Mutation', deleteComment: boolean };

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
    comments {
      id
      content
      createdAt
      author {
        id
        nickname
        profilePicture
      }
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
    comments {
      id
      content
      createdAt
      author {
        id
        nickname
        profilePicture
      }
    }
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
    mutation AddCommentToPin($input: AddCommentInput!) {
  addCommentToPin(input: $input) {
    id
    content
    createdAt
    author {
      id
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
export const UpdateCommentDocument = gql`
    mutation UpdateComment($id: UUID!, $content: String!) {
  updateComment(id: $id, content: $content) {
    id
    content
    createdAt
  }
}
    `;
export type UpdateCommentMutationFn = Apollo.MutationFunction<UpdateCommentMutation, UpdateCommentMutationVariables>;

/**
 * __useUpdateCommentMutation__
 *
 * To run a mutation, you first call `useUpdateCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCommentMutation, { data, loading, error }] = useUpdateCommentMutation({
 *   variables: {
 *      id: // value for 'id'
 *      content: // value for 'content'
 *   },
 * });
 */
export function useUpdateCommentMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCommentMutation, UpdateCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCommentMutation, UpdateCommentMutationVariables>(UpdateCommentDocument, options);
      }
export type UpdateCommentMutationHookResult = ReturnType<typeof useUpdateCommentMutation>;
export type UpdateCommentMutationResult = Apollo.MutationResult<UpdateCommentMutation>;
export type UpdateCommentMutationOptions = Apollo.BaseMutationOptions<UpdateCommentMutation, UpdateCommentMutationVariables>;
export const DeleteCommentDocument = gql`
    mutation DeleteComment($id: UUID!) {
  deleteComment(id: $id)
}
    `;
export type DeleteCommentMutationFn = Apollo.MutationFunction<DeleteCommentMutation, DeleteCommentMutationVariables>;

/**
 * __useDeleteCommentMutation__
 *
 * To run a mutation, you first call `useDeleteCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCommentMutation, { data, loading, error }] = useDeleteCommentMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteCommentMutation(baseOptions?: Apollo.MutationHookOptions<DeleteCommentMutation, DeleteCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteCommentMutation, DeleteCommentMutationVariables>(DeleteCommentDocument, options);
      }
export type DeleteCommentMutationHookResult = ReturnType<typeof useDeleteCommentMutation>;
export type DeleteCommentMutationResult = Apollo.MutationResult<DeleteCommentMutation>;
export type DeleteCommentMutationOptions = Apollo.BaseMutationOptions<DeleteCommentMutation, DeleteCommentMutationVariables>;
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