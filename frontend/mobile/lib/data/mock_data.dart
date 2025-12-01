import '../models/pin.dart';

class MockData {
  static final User mockUser1 = User(
    id: '550e8400-e29b-41d4-a716-446655440000',
    username: 'travel_moscow',
    displayName: 'Алексей Путешественник',
    avatarUrl: 'https://i.pravatar.cc/150?img=33',
  );

  static final User mockUser2 = User(
    id: '550e8400-e29b-41d4-a716-446655440010',
    username: 'spb_explorer',
    displayName: 'Мария Петрова',
    avatarUrl: 'https://i.pravatar.cc/150?img=45',
  );

  static final User mockUser3 = User(
    id: '550e8400-e29b-41d4-a716-446655440011',
    username: 'city_photos',
    displayName: 'Иван Иванов',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
  );

  static final List<Pin> mockPins = [
    Pin(
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Красная площадь',
      ownerId: '550e8400-e29b-41d4-a716-446655440000',
      owner: mockUser1,
      address: 'Москва, Красная площадь, 1',
      latitude: 55.7539,
      longitude: 37.6208,
      description: 'Главная площадь Москвы и один из главных символов России. Здесь проходят парады и народные гуляния.',
      rating: 4.8,
      createdAt: DateTime.now().subtract(const Duration(days: 5)),
      images: [
        PinImage(
          id: '1',
          orderNumber: 0,
          imageUrl: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800',
        ),
        PinImage(
          id: '2',
          orderNumber: 1,
          imageUrl: 'https://images.unsplash.com/photo-1547448415-e9f5b28e570d?w=800',
        ),
        PinImage(
          id: '3',
          orderNumber: 2,
          imageUrl: 'https://images.unsplash.com/photo-1520106212299-d99c443e4568?w=800',
        ),
      ],
    ),
    Pin(
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Эрмитаж',
      ownerId: '550e8400-e29b-41d4-a716-446655440010',
      owner: mockUser2,
      address: 'Санкт-Петербург, Дворцовая площадь, 2',
      latitude: 59.9398,
      longitude: 30.3146,
      description: 'Один из крупнейших и наиболее значимых художественных и культурно-исторических музеев мира.',
      rating: 4.9,
      createdAt: DateTime.now().subtract(const Duration(days: 3)),
      images: [
        PinImage(
          id: '4',
          orderNumber: 0,
          imageUrl: 'https://images.unsplash.com/photo-1555794843-28394bd7d9ec?w=800',
        ),
        PinImage(
          id: '5',
          orderNumber: 1,
          imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
        ),
      ],
    ),
    Pin(
      id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'Парк Горького',
      ownerId: '550e8400-e29b-41d4-a716-446655440011',
      owner: mockUser3,
      address: 'Москва, Крымский Вал, 9',
      latitude: 55.7311,
      longitude: 37.6014,
      description: 'Центральный парк культуры и отдыха в Москве с множеством развлечений.',
      rating: 4.6,
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
      images: [
        PinImage(
          id: '6',
          orderNumber: 0,
          imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
        ),
      ],
    ),
    Pin(
      id: '550e8400-e29b-41d4-a716-446655440004',
      name: 'Храм Христа Спасителя',
      ownerId: '550e8400-e29b-41d4-a716-446655440000',
      owner: mockUser1,
      address: 'Москва, ул. Волхонка, 15',
      latitude: 55.7445,
      longitude: 37.6056,
      description: 'Кафедральный собор Русской православной церкви в Москве.',
      rating: 4.7,
      createdAt: DateTime.now().subtract(const Duration(hours: 12)),
      images: [
        PinImage(
          id: '7',
          orderNumber: 0,
          imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
        ),
        PinImage(
          id: '8',
          orderNumber: 1,
          imageUrl: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=800',
        ),
        PinImage(
          id: '9',
          orderNumber: 2,
          imageUrl: 'https://images.unsplash.com/photo-1527631746610-ab02696a0e61?w=800',
        ),
        PinImage(
          id: '10',
          orderNumber: 3,
          imageUrl: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=800',
        ),
      ],
    ),
    Pin(
      id: '550e8400-e29b-41d4-a716-446655440005',
      name: 'ВДНХ',
      ownerId: '550e8400-e29b-41d4-a716-446655440010',
      owner: mockUser2,
      address: 'Москва, проспект Мира, 119',
      latitude: 55.8278,
      longitude: 37.6319,
      description: 'Выставочный комплекс с павильонами, фонтанами и парком.',
      rating: 4.5,
      createdAt: DateTime.now().subtract(const Duration(hours: 6)),
      images: [
        PinImage(
          id: '11',
          orderNumber: 0,
          imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
        ),
      ],
    ),
  ];

  static int getMockReactionsCount(String pinId) {
    // Разные числа реакций для разных пинов
    switch (pinId) {
      case '550e8400-e29b-41d4-a716-446655440001':
        return 1245;
      case '550e8400-e29b-41d4-a716-446655440002':
        return 892;
      case '550e8400-e29b-41d4-a716-446655440003':
        return 567;
      case '550e8400-e29b-41d4-a716-446655440004':
        return 423;
      case '550e8400-e29b-41d4-a716-446655440005':
        return 789;
      default:
        return 0;
    }
  }

  static int getMockCommentsCount(String pinId) {
    // Разные числа комментариев для разных пинов
    switch (pinId) {
      case '550e8400-e29b-41d4-a716-446655440001':
        return 142;
      case '550e8400-e29b-41d4-a716-446655440002':
        return 87;
      case '550e8400-e29b-41d4-a716-446655440003':
        return 54;
      case '550e8400-e29b-41d4-a716-446655440004':
        return 38;
      case '550e8400-e29b-41d4-a716-446655440005':
        return 91;
      default:
        return 0;
    }
  }
}
