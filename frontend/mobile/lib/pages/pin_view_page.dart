import 'dart:ui';
import 'package:flutter/material.dart';

class PinViewPage extends StatefulWidget {
  const PinViewPage({super.key});

  @override
  State<PinViewPage> createState() => _PinViewPageState();
}

class _PinViewPageState extends State<PinViewPage> {
  final PageController _photoController = PageController();
  int _currentPhotoIndex = 0;
  
  // Временные данные для демонстрации
  final List<Color> _demoPhotos = [
    Colors.blue.shade300,
    Colors.purple.shade300,
    Colors.pink.shade300,
    Colors.orange.shade300,
  ];

  @override
  void dispose() {
    _photoController.dispose();
    super.dispose();
  }

  void _previousPhoto() {
    if (_currentPhotoIndex > 0) {
      _photoController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _nextPhoto() {
    if (_currentPhotoIndex < _demoPhotos.length - 1) {
      _photoController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          // Верхняя навигационная панель
          Container(
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top + 12,
              bottom: 12,
              left: 16,
              right: 16,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Кнопка назад
                GestureDetector(
                  onTap: () => Navigator.of(context).pop(),
                  child: const Icon(
                    Icons.arrow_back_ios_new,
                    color: Colors.black87,
                    size: 24,
                  ),
                ),
                
                // Текст "Пин" по центру
                const Text(
                  'Пин',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ),
                ),
                
                // Кнопка меню (троеточие)
                GestureDetector(
                  onTap: () {
                    // TODO: Открыть меню дополнительных функций
                  },
                  child: const Icon(
                    Icons.more_horiz,
                    color: Colors.black87,
                    size: 28,
                  ),
                ),
              ],
            ),
          ),
          
          // Карусель фото
          Expanded(
            flex: 7,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(30),
                child: Stack(
                  children: [
                    // PageView для свайпа
                    PageView.builder(
                      controller: _photoController,
                      onPageChanged: (index) {
                        setState(() {
                          _currentPhotoIndex = index;
                        });
                      },
                      itemCount: _demoPhotos.length,
                      itemBuilder: (context, index) {
                        return Container(
                          color: _demoPhotos[index],
                          child: Center(
                            child: Text(
                              'Фото ${index + 1}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 24,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                    
                    // Стрелка влево
                    if (_currentPhotoIndex > 0)
                      Positioned(
                        left: 16,
                        top: 0,
                        bottom: 0,
                        child: Center(
                          child: GestureDetector(
                            onTap: _previousPhoto,
                            child: Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: Colors.black.withOpacity(0.3),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.chevron_left,
                                color: Colors.white,
                                size: 28,
                              ),
                            ),
                          ),
                        ),
                      ),
                    
                    // Стрелка вправо
                    if (_currentPhotoIndex < _demoPhotos.length - 1)
                      Positioned(
                        right: 16,
                        top: 0,
                        bottom: 0,
                        child: Center(
                          child: GestureDetector(
                            onTap: _nextPhoto,
                            child: Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: Colors.black.withOpacity(0.3),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.chevron_right,
                                color: Colors.white,
                                size: 28,
                              ),
                            ),
                          ),
                        ),
                      ),
                    
                    // Индикатор страниц
                    Positioned(
                      bottom: 16,
                      left: 0,
                      right: 0,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(
                          _demoPhotos.length,
                          (index) => Container(
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: _currentPhotoIndex == index
                                  ? Colors.white
                                  : Colors.white.withOpacity(0.4),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          
          // Панель с кнопками взаимодействия
          Expanded(
            flex: 3,
            child: Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Кнопки взаимодействия
                  Row(
                    children: [
                      _buildActionButton(
                        icon: Icons.favorite_border,
                        label: '245',
                        onTap: () {},
                      ),
                      const SizedBox(width: 20),
                      _buildActionButton(
                        icon: Icons.chat_bubble_outline,
                        label: '32',
                        onTap: () {},
                      ),
                      const SizedBox(width: 20),
                      _buildActionButton(
                        icon: Icons.bookmark_border,
                        label: 'Сохранить',
                        onTap: () {},
                      ),
                      const Spacer(),
                      _buildActionButton(
                        icon: Icons.share_outlined,
                        label: '',
                        onTap: () {},
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 20),
                  
                  // Описание пина
                  const Text(
                    'Описание пина',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Здесь будет описание пина с дополнительной информацией о контенте',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.black54,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Row(
        children: [
          Icon(
            icon,
            color: Colors.black87,
            size: 24,
          ),
          if (label.isNotEmpty) ...[
            const SizedBox(width: 6),
            Text(
              label,
              style: const TextStyle(
                fontSize: 14,
                color: Colors.black87,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
