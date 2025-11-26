class AppConfig {
  // TODO: Заменить на реальный URL Apollo Router
  // Для разработки используйте локальный адрес или ngrok
  static const String graphqlEndpoint = 'http://localhost:4000/graphql';
  
  // Альтернативные варианты:
  // Для эмулятора Android: 'http://10.0.2.2:4000/graphql'
  // Для физического устройства в одной сети: 'http://192.168.x.x:4000/graphql'
  // Для production: 'https://api.reverie.app/graphql'
}
