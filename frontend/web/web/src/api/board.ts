const GRAPHQL_ENDPOINT = "/graphql";
const PROFILE_ENDPOINT = "/profile/graphql";

//ДОБАВИТЬ ЛОГИРОВАНИЕ

// api/board.ts 
import type { 
  BoardResponse, 
  FullBoardResponse, 
  GraphQLResponse, 
  PinsByLocationResponse, 
  Pin,
  UserByIdResponse,
  CommentsByBoardResponse,
  ReactionsCountByBoardResponse,
  Reaction,
  Comment,
  AddCommentResponse,
  AddCommentInput,
  ComplaintInput,
  CopyBoardResponse,
  User 
} from "../types/board";


// api/board.ts
export async function copyBoard(
  boardId: string, 
  userId: string
): Promise<string | null> {
  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation ($boardId: UUID!, $userId: UUID!) {
            copyBoard(boardId: $boardId, userId: $userId) {
              id
            }
          }
        `,
        variables: { boardId, userId },
      }),
    });

    const json: GraphQLResponse<CopyBoardResponse> = await res.json();

    if (json.errors?.length) {
      console.error("GraphQL errors:", json.errors.map(e => e.message).join(", "));
      return null;
    }

    return json.data?.copyBoard.id || null;
  } catch (err) {
    console.error("Ошибка copyBoard:", err);
    return null;
  }
}

export async function complainAboutBoard(
  creatorId: string, 
  boardId: string, 
  complaint: ComplaintInput
): Promise<boolean> {
  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation ($creatorId: UUID!, $boardId: UUID!, $complaint: ComplaintInput) {
            complainAboutBoard(creatorId: $creatorId, boardId: $boardId, complaint: $complaint)
          }
        `,
        variables: { creatorId, boardId, complaint },
      }),
    });

    const json: GraphQLResponse<{ complainAboutBoard: boolean }> = await res.json();

    if (json.errors?.length) {
      console.error("GraphQL errors:", json.errors.map(e => e.message).join(", "));
      return false;
    }

    return json.data?.complainAboutBoard || false;
  } catch (err) {
    console.error("Ошибка complainAboutBoard:", err);
    return false;
  }
}

export async function addBoardToBookmarks(
  boardId: string, 
  userId: string
): Promise<boolean> {
  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation ($boardId: UUID!, $userId: UUID!) {
            boardToBookmarks(boardId: $boardId, userId: $userId)
          }
        `,
        variables: { boardId, userId },
      }),
    });

    const json: GraphQLResponse<{ boardToBookmarks: boolean }> = await res.json();

    if (json.errors?.length) {
      console.error("GraphQL errors:", json.errors.map(e => e.message).join(", "));
      return false;
    }

    return json.data?.boardToBookmarks || false;
  } catch (err) {
    console.error("Ошибка addBoardToBookmarks:", err);
    return false;
  }
}

export async function removeBoardFromBookmarks(
  boardId: string, 
  userId: string
): Promise<boolean> {
  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation ($boardId: UUID!, $userId: UUID!) {
            removeBoardFromBookmarks(boardId: $boardId, userId: $userId)
          }
        `,
        variables: { boardId, userId },
      }),
    });

    const json: GraphQLResponse<{ removeBoardFromBookmarks: boolean }> = await res.json();

    if (json.errors?.length) {
      console.error("GraphQL errors:", json.errors.map(e => e.message).join(", "));
      return false;
    }

    return json.data?.removeBoardFromBookmarks || false;
  } catch (err) {
    console.error("Ошибка removeBoardFromBookmarks:", err);
    return false;
  }
}

export async function addCommentToBoard(input: AddCommentInput): Promise<Comment | null> {
  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation ($input: AddCommentInput!) {
            addCommentToBoard(input: $input) {
              id
              content
              createdAt
              author {
                id
                username
                email
              }
            }
          }
        `,
        variables: { input },
      }),
    });

    const json: GraphQLResponse<AddCommentResponse> = await res.json();

    if (json.errors?.length) {
      console.error("GraphQL errors:", json.errors.map(e => e.message).join(", "));
      return null;
    }

    const newComment = json.data?.addCommentToBoard;
    
    return newComment || null;
  } catch (err) {
    console.error("Ошибка addCommentToBoard:", err);
    return null;
  }
}

export async function fetchCommentsByBoard(groupId: string): Promise<Comment[] | null> {
  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query ($groupId: UUID!) {
            commentsByBoard(groupId: $groupId) {
              id
              content
              createdAt
              author {
                id
                username
                email
              }
            }
          }
        `,
        variables: { groupId },
      }),
    });

    const json: GraphQLResponse<CommentsByBoardResponse> = await res.json();

    if (json.errors?.length) {
      console.error("GraphQL errors:", json.errors.map(e => e.message).join(", "));
      return null;
    }

    return json.data?.commentsByBoard || null;
  } catch (err) {
    console.error("Ошибка fetchCommentsByBoard:", err);
    return null;
  }
}

export async function fetchReactionsCountByBoard(
  reaction: Reaction, 
  boardId: string
): Promise<number | null> {
  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query ($reaction: Reaction!, $boardId: UUID!) {
            reactionsCountByBoard(reaction: $reaction, boardId: $boardId)
          }
        `,
        variables: { reaction, boardId },
      }),
    });

    const json: GraphQLResponse<ReactionsCountByBoardResponse> = await res.json();

    if (json.errors?.length) {
      console.error("GraphQL errors:", json.errors.map(e => e.message).join(", "));
      return null;
    }

    return json.data?.reactionsCountByBoard || null;
  } catch (err) {
    console.error("Ошибка fetchReactionsCountByBoard:", err);
    return null;
  }
}

export async function addReactionToBoard(
  boardId: string, 
  reactionId: string, 
  userId: string
): Promise<boolean> {
  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation ($boardId: UUID!, $reactionId: UUID!, $userId: UUID!) {
            addReactionToBoard(boardId: $boardId, reactionId: $reactionId, userId: $userId)
          }
        `,
        variables: { boardId, reactionId, userId },
      }),
    });

    const json: GraphQLResponse<{ addReactionToBoard: boolean }> = await res.json();

    if (json.errors?.length) {
      console.error("GraphQL errors:", json.errors.map(e => e.message).join(", "));
      return false;
    }

    return json.data?.addReactionToBoard || false;
  } catch (err) {
    console.error("Ошибка addReactionToBoard:", err);
    return false;
  }
}

export async function removeReactionToBoard(
  boardId: string, 
  reactionId: string, 
  userId: string
): Promise<boolean> {
  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation ($boardId: UUID!, $reactionId: UUID!, $userId: UUID!) {
            removeReactionToBoard(boardId: $boardId, reactionId: $reactionId, userId: $userId)
          }
        `,
        variables: { boardId, reactionId, userId },
      }),
    });

    const json: GraphQLResponse<{ removeReactionToBoard: boolean }> = await res.json();

    if (json.errors?.length) {
      console.error("GraphQL errors:", json.errors.map(e => e.message).join(", "));
      return false;
    }
    return json.data?.removeReactionToBoard || false;
  } catch (err) {
    console.error("Ошибка removeReactionToBoard:", err);
    return false;
  }
}

export async function followUser(userId: string, followerId: string): Promise<boolean> {
  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation ($userId: ID!, $followerId: ID!) {
            followUser(userId: $userId, followerId: $followerId)
          }
        `,
        variables: { userId, followerId },
      }),
    });

    const json: GraphQLResponse<{ followUser: boolean }> = await res.json();

    if (json.errors?.length) {
      console.error("GraphQL errors:", json.errors.map(e => e.message).join(", "));
      return false;
    }
    return json.data?.followUser || false;
  } catch (err) {
    console.error("Ошибка followUser:", err);
    return false;
  }
}

export async function unfollowUser(userId: string, followerId: string): Promise<boolean> {
  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation ($userId: ID!, $followerId: ID!) {
            unfollowUser(userId: $userId, followerId: $followerId)
          }
        `,
        variables: { userId, followerId },
      }),
    });

    const json: GraphQLResponse<{ unfollowUser: boolean }> = await res.json();

    if (json.errors?.length) {
      console.error("GraphQL errors:", json.errors.map(e => e.message).join(", "));
      return false;
    }

    return json.data?.unfollowUser || false;
  } catch (err) {
    console.error("Ошибка unfollowUser:", err);
    return false;
  }
}

export async function fetchUserById(userId: string): Promise<User | null> {
  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query ($userId: ID!) {
            userById(userId: $userId) {
              id
              username
              email
            }
          }
        `,
        variables: { userId },
      }),
    });

    const json: GraphQLResponse<UserByIdResponse> = await res.json();

    if (json.errors?.length) {
      console.error("GraphQL errors:", json.errors.map(e => e.message).join(", "));
      return null;
    }

    return json.data?.userById || null;
  } catch (err) {
    console.error("Ошибка fetchUserById:", err);
    return null;
  }
}

export async function fetchPinsByLocation(query: string): Promise<Pin[] | null> {
  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query ($query: String!) {
            pinsByLocation(query: $query) {
              id
              title
              content
            }
          }
        `,
        variables: { query },
      }),
    });

    const json: GraphQLResponse<PinsByLocationResponse> = await res.json();

    if (json.errors?.length) {
      console.error("GraphQL errors:", json.errors.map(e => e.message).join(", "));
      return null;
    }

    return json.data?.pinsByLocation || null;
  } catch (err) {
    console.error("Ошибка fetchPinsByLocation:", err);
    return null;
  }
}


export async function fetchBoardBasic(id: string): Promise<BoardResponse["board"] | null> {
  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query ($id: UUID!) {
            board(id: $id) {
              id
              accessLevel { type }
              owner { id }
              groupId
            }
          }
        `,
        variables: { id },
      }),
    });

    const json: GraphQLResponse<BoardResponse> = await res.json();

    if (json.errors?.length) {
      console.error("GraphQL errors:", json.errors.map(e => e.message).join(", "));
      return null;
    }

    return json.data?.board || null;
  } catch (err) {
    console.error("Ошибка fetchBoardBasic:", err);
    return null;
  }
}

export async function fetchFullBoard(id: string): Promise<FullBoardResponse["board"] | null> {
  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query ($id: UUID!) {
            board(id: $id) {
              id
              name
              accessLevel { type }
              owner { id }
              groupId
              createdAt
              pins {
                id
                title
                content
              }
            }
          }
        `,
        variables: { id },
      }),
    });

    const json: GraphQLResponse<FullBoardResponse> = await res.json();

    if (json.errors?.length) {
      console.error("GraphQL errors:", json.errors.map(e => e.message).join(", "));
      return null;
    }

    return json.data?.board || null;
  } catch (err) {
    console.error("Ошибка fetchFullBoard:", err);
    return null;
  }
}

export async function checkUserInGroup(userId: string, groupId: string): Promise<boolean> {
  try {
    const res = await fetch(PROFILE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query ($userId: ID!, $groupId: ID!) {
            isUserInGroup(user_id: $userId, group_id: $groupId)
          }
        `,
        variables: { userId, groupId },
      }),
    });

    const json: { data?: { isUserInGroup: boolean } } = await res.json();
    return json.data?.isUserInGroup || false;
  } catch (err) {
    console.error("Ошибка checkUserInGroup:", err);
    return false;
  }
}





