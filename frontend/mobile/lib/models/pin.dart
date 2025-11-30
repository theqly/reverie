class Pin {
  final String id;
  final String name;
  final String ownerId;
  final String? address;
  final double latitude;
  final double longitude;
  final String? description;
  final double rating;
  final DateTime createdAt;
  final List<PinImage> images;

  Pin({
    required this.id,
    required this.name,
    required this.ownerId,
    this.address,
    required this.latitude,
    required this.longitude,
    this.description,
    required this.rating,
    required this.createdAt,
    this.images = const [],
  });

  factory Pin.fromJson(Map<String, dynamic> json) {
    return Pin(
      id: json['id'] as String,
      name: json['name'] as String,
      ownerId: json['owner']['id'] as String,
      address: json['address'] as String?,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      description: json['description'] as String?,
      rating: (json['rating'] as num).toDouble(),
      createdAt: DateTime.parse(json['createdAt'] as String),
      images: (json['images'] as List<dynamic>?)
              ?.map((img) => PinImage.fromJson(img as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

class PinImage {
  final String id;
  final int orderNumber;
  final String imageUrl;

  PinImage({
    required this.id,
    required this.orderNumber,
    required this.imageUrl,
  });

  factory PinImage.fromJson(Map<String, dynamic> json) {
    return PinImage(
      id: json['id'] as String,
      orderNumber: json['orderNumber'] as int,
      imageUrl: json['imageUrl'] as String,
    );
  }
}

class CommentToPin {
  final String id;
  final String pinId;
  final String message;
  final DateTime createdAt;
  final String ownerId;

  CommentToPin({
    required this.id,
    required this.pinId,
    required this.message,
    required this.createdAt,
    required this.ownerId,
  });

  factory CommentToPin.fromJson(Map<String, dynamic> json) {
    return CommentToPin(
      id: json['id'] as String,
      pinId: json['pinId'] as String,
      message: json['message'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      ownerId: json['owner']['id'] as String,
    );
  }
}
