import 'dart:ui';
import 'package:flutter/material.dart';
import 'pages/collections_page.dart';
import 'pages/pins_page.dart';
import 'pages/search_page.dart';
import 'pages/create_page.dart';
import 'pages/notifications_page.dart';
import 'pages/profile_page.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Reverie',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.white),
        useMaterial3: true,
      ),
      home: const MainScreen(),
    );
  }
}

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;
  final PageController _pageController = PageController();
  int _sharedTabIndex = 0; // Общее состояние для Рекомендации/Подписки
  int _lastContentPage = 0; // Последняя просмотренная страница контента (0 - Коллекции, 1 - Пины)

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _navigateToPage(int index) {
    setState(() {
      _currentIndex = index;
      // Сохраняем последнюю страницу контента (Коллекции или Пины)
      if (index == 0 || index == 1) {
        _lastContentPage = index;
      }
    });
    _pageController.jumpToPage(index);
  }

  // Список страниц для навигации
  List<Widget> get _pages => [
    CollectionsPage(
      key: const PageStorageKey('collections'),
      onSearchTap: () => _navigateToPage(2),
      initialTab: _sharedTabIndex,
      onTabChanged: (index) {
        setState(() {
          _sharedTabIndex = index;
        });
      },
    ),
    PinsPage(
      key: const PageStorageKey('pins'),
      onSearchTap: () => _navigateToPage(2),
      initialTab: _sharedTabIndex,
      onTabChanged: (index) {
        setState(() {
          _sharedTabIndex = index;
        });
      },
    ),
    const SearchPage(),
    const CreatePage(),
    const NotificationsPage(),
    const ProfilePage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      extendBodyBehindAppBar: true,
      body: PageView(
        controller: _pageController,
        onPageChanged: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        children: _pages,
      ),
      extendBody: true,
      bottomNavigationBar: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Индикатор точками (только для Коллекций и Пинов)
          if (_currentIndex == 0 || _currentIndex == 1)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: _buildPageIndicator(),
            ),
          _buildDockStation(),
        ],
      ),
    );
  }

  Widget _buildPageIndicator() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _buildDot(0),
        const SizedBox(width: 8),
        _buildDot(1),
      ],
    );
  }

  Widget _buildDot(int index) {
    final isActive = _currentIndex == index;
    return Container(
      width: 8,
      height: 8,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: isActive ? Colors.white : Colors.grey[400],
      ),
    );
  }

  Widget _buildDockStation() {
    return Container(
      margin: const EdgeInsets.only(left: 16, right: 16, bottom: 16),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(30),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 12),
            decoration: BoxDecoration(
              color: const Color(0xFF2C2C2E).withOpacity(0.3),
              borderRadius: BorderRadius.circular(30),
              border: Border.all(
                color: Colors.white.withOpacity(0.1),
                width: 0.5,
              ),
            ),
            child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _buildDockItem(Icons.grid_view_rounded, 0),
            _buildDockItem(Icons.search, 1),
            _buildDockItem(Icons.add, 2),
            _buildDockItem(Icons.notifications_outlined, 3),
            _buildDockItem(Icons.person_outline, 4),
          ],
        ),
          ),
        ),
      ),
    );
  }

  Widget _buildDockItem(IconData icon, int index) {
    // Первая иконка активна если мы на Коллекциях (0) или Пинах (1)
    final isSelected = (index == 0 && (_currentIndex == 0 || _currentIndex == 1)) || 
                       (index != 0 && _currentIndex == index + 1);
    
    return GestureDetector(
      onTap: () {
        if (index == 0) {
          // Первая иконка ведет на последнюю просмотренную страницу (Коллекции или Пины)
          _navigateToPage(_lastContentPage);
        } else {
          // Остальные иконки: +1 к индексу из-за добавленной страницы Пинов
          _navigateToPage(index + 1);
        }
      },
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected 
              ? Colors.white.withOpacity(0.2) 
              : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(
          icon,
          color: Colors.white,
          size: 26,
        ),
      ),
    );
  }
}
