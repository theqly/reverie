import 'dart:ui';
import 'package:flutter/material.dart';
import 'pages/collections_page.dart';
import 'pages/pins_page.dart';
import 'pages/search_page.dart';
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

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  // Список страниц для навигации
  final List<Widget> _pages = [
    const CollectionsPage(),
    const PinsPage(),
    const SearchPage(),
    const NotificationsPage(),
    const ProfilePage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: PageView(
        controller: _pageController,
        onPageChanged: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        children: _pages,
      ),
      extendBody: true, // Позволяет контенту быть под док-станцией
      bottomNavigationBar: _buildDockStation(),
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
                _buildDockItem(Icons.push_pin_outlined, 1),
                _buildDockItem(Icons.search, 2),
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
    final isSelected = _currentIndex == index;
    return GestureDetector(
      onTap: () {
        setState(() {
          _currentIndex = index;
        });
        _pageController.jumpToPage(index);
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
