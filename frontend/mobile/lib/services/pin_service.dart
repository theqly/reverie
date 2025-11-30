import 'package:graphql_flutter/graphql_flutter.dart';
import '../models/pin.dart';
import 'graphql_service.dart';

class PinService {
  final GraphQLClient _client = GraphQLService.instance.client;

  // Получить пин по ID
  Future<Pin?> getPinById(String pinId) async {
    try {
      final QueryOptions options = QueryOptions(
        document: gql(GraphQLService.getPinQuery),
        variables: {'id': pinId},
      );

      final QueryResult result = await _client.query(options);

      if (result.hasException) {
        print('GraphQL Error: ${result.exception.toString()}');
        return null;
      }

      if (result.data?['pin'] == null) {
        return null;
      }

      return Pin.fromJson(result.data!['pin'] as Map<String, dynamic>);
    } catch (e) {
      print('Error fetching pin: $e');
      return null;
    }
  }

  // Получить пины пользователя
  Future<List<Pin>> getPinsByUser(String userId) async {
    try {
      final QueryOptions options = QueryOptions(
        document: gql(GraphQLService.getPinsByUserQuery),
        variables: {'userId': userId},
      );

      final QueryResult result = await _client.query(options);

      if (result.hasException) {
        print('GraphQL Error: ${result.exception.toString()}');
        return [];
      }

      final List<dynamic>? pinsData = result.data?['pinsByUser'] as List<dynamic>?;
      if (pinsData == null) {
        return [];
      }

      return pinsData
          .map((pin) => Pin.fromJson(pin as Map<String, dynamic>))
          .toList();
    } catch (e) {
      print('Error fetching pins: $e');
      return [];
    }
  }

  // Получить комментарии к пину
  Future<List<CommentToPin>> getCommentsByPin(String pinId) async {
    try {
      final QueryOptions options = QueryOptions(
        document: gql(GraphQLService.getCommentsByPinQuery),
        variables: {'pinId': pinId},
      );

      final QueryResult result = await _client.query(options);

      if (result.hasException) {
        print('GraphQL Error: ${result.exception.toString()}');
        return [];
      }

      final List<dynamic>? commentsData =
          result.data?['commentsByPin'] as List<dynamic>?;
      if (commentsData == null) {
        return [];
      }

      return commentsData
          .map((comment) =>
              CommentToPin.fromJson(comment as Map<String, dynamic>))
          .toList();
    } catch (e) {
      print('Error fetching comments: $e');
      return [];
    }
  }

  // Получить количество реакций
  Future<int> getReactionsCount(String pinId) async {
    try {
      final QueryOptions options = QueryOptions(
        document: gql(GraphQLService.getReactionsCountQuery),
        variables: {'pinId': pinId},
      );

      final QueryResult result = await _client.query(options);

      if (result.hasException) {
        print('GraphQL Error: ${result.exception.toString()}');
        return 0;
      }

      return result.data?['countAllReactionsToPin'] as int? ?? 0;
    } catch (e) {
      print('Error fetching reactions count: $e');
      return 0;
    }
  }

  // Добавить комментарий
  Future<CommentToPin?> addComment(String pinId, String message) async {
    try {
      final MutationOptions options = MutationOptions(
        document: gql(GraphQLService.addCommentMutation),
        variables: {
          'pinId': pinId,
          'message': message,
        },
      );

      final QueryResult result = await _client.mutate(options);

      if (result.hasException) {
        print('GraphQL Error: ${result.exception.toString()}');
        return null;
      }

      if (result.data?['commentOnPin'] == null) {
        return null;
      }

      return CommentToPin.fromJson(
          result.data!['commentOnPin'] as Map<String, dynamic>);
    } catch (e) {
      print('Error adding comment: $e');
      return null;
    }
  }
}
