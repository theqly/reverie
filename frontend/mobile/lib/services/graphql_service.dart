import 'package:graphql_flutter/graphql_flutter.dart';
import '../config/app_config.dart';

class GraphQLService {
  static GraphQLService? _instance;
  late GraphQLClient _client;

  GraphQLService._() {
    final HttpLink httpLink = HttpLink(
      AppConfig.graphqlEndpoint,
    );

    _client = GraphQLClient(
      cache: GraphQLCache(),
      link: httpLink,
    );
  }

  static GraphQLService get instance {
    _instance ??= GraphQLService._();
    return _instance!;
  }

  GraphQLClient get client => _client;

  // Query для получения пина по ID
  static const String getPinQuery = r'''
    query GetPin($id: UUID!) {
      pin(id: $id) {
        id
        name
        owner {
          id
        }
        address
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
  ''';

  // Query для получения пинов пользователя
  static const String getPinsByUserQuery = r'''
    query GetPinsByUser($userId: UUID!) {
      pinsByUser(userId: $userId) {
        id
        name
        owner {
          id
        }
        address
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
  ''';

  // Query для получения комментариев к пину
  static const String getCommentsByPinQuery = r'''
    query GetCommentsByPin($pinId: UUID!) {
      commentsByPin(pinId: $pinId) {
        id
        pinId
        message
        createdAt
        owner {
          id
        }
      }
    }
  ''';

  // Query для получения счетчика реакций
  static const String getReactionsCountQuery = r'''
    query GetReactionsCount($pinId: UUID!) {
      countAllReactionsToPin(pinId: $pinId)
    }
  ''';

  // Mutation для добавления комментария
  static const String addCommentMutation = r'''
    mutation AddCommentToPin($pinId: UUID!, $message: String!) {
      commentOnPin(pinId: $pinId, message: $message) {
        id
        pinId
        message
        createdAt
        owner {
          id
        }
      }
    }
  ''';
}
