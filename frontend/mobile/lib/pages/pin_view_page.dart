import 'dart:ui';
import 'package:flutter/material.dart';
import '../models/pin.dart';
import '../services/pin_service.dart';

class PinViewPage extends StatefulWidget {
  final Pin pin;
  
  const PinViewPage({super.key, required this.pin});

  @override
  State<PinViewPage> createState() => _PinViewPageState();
}

class _PinViewPageState extends State<PinViewPage> {
  final PageController _photoController = PageController();
  final PinService _pinService = PinService();
  int _currentPhotoIndex = 0;
  int _reactionsCount = 0;
  int _commentsCount = 0;
  bool _isLoadingStats = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    setState(() {
      _isLoadingStats = true;
    });

    final reactionsCount = await _pinService.getReactionsCount(widget.pin.id);
    final comments = await _pinService.getCommentsByPin(widget.pin.id);

    setState(() {
      _reactionsCount = reactionsCount;
      _commentsCount = comments.length;
      _isLoadingStats = false;
    });
  }

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
    if (_currentPhotoIndex < widget.pin.images.length - 1) {
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
                child: widget.pin.images.isEmpty
                    ? Container(
                        color: Colors.grey[300],
                        child: const Center(
                          child: Icon(
                            Icons.image_not_supported,
                            size: 64,
                            color: Colors.grey,
                          ),
                        ),
                      )
                    : Stack(
                        children: [
                          // PageView для свайпа
                          PageView.builder(
                            controller: _photoController,
                            onPageChanged: (index) {
                              setState(() {
                                _currentPhotoIndex = index;
                              });
                            },
                            itemCount: widget.pin.images.length,
                            itemBuilder: (context, index) {
                              final image = widget.pin.images[index];
                              return Image.network(
                                image.imageUrl,
                                fit: BoxFit.cover,
                                loadingBuilder: (context, child, loadingProgress) {
                                  if (loadingProgress == null) return child;
                                  return Center(
                                    child: CircularProgressIndicator(
                                      value: loadingProgress.expectedTotalBytes != null
                                          ? loadingProgress.cumulativeBytesLoaded /
                                              loadingProgress.expectedTotalBytes!
                                          : null,
                                    ),
                                  );
                                },
                                errorBuilder: (context, error, stackTrace) {
                                  return Container(
                                    color: Colors.grey[300],
                                    child: const Center(
                                      child: Icon(
                                        Icons.error_outline,
                                        size: 64,
                                        color: Colors.grey,
                                      ),
                                    ),
                                  );
                                },
                              );
                            },
                          ),
                          
                          // Стрелка влево
                          if (widget.pin.images.length > 1 && _currentPhotoIndex > 0)
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
                    if (widget.pin.images.length > 1 && _currentPhotoIndex < widget.pin.images.length - 1)
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
                    if (widget.pin.images.length > 1)
                      Positioned(
                        bottom: 16,
                        left: 0,
                        right: 0,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: List.generate(
                            widget.pin.images.length,
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
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Кнопки взаимодействия
                    _isLoadingStats
                        ? const Center(child: CircularProgressIndicator())
                        : Row(
                            children: [
                              _buildActionButton(
                                icon: Icons.favorite_border,
                                label: '$_reactionsCount',
                                onTap: () {},
                              ),
                              const SizedBox(width: 20),
                              _buildActionButton(
                                icon: Icons.chat_bubble_outline,
                                label: '$_commentsCount',
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
                    
                    // Название и рейтинг
                    Text(
                      widget.pin.name,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: Colors.black87,
                      ),
                    ),
                    
                    if (widget.pin.address != null) ...[
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.location_on, size: 16, color: Colors.grey),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              widget.pin.address!,
                              style: const TextStyle(
                                fontSize: 14,
                                color: Colors.black54,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                    
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.star, size: 18, color: Colors.amber),
                        const SizedBox(width: 4),
                        Text(
                          widget.pin.rating.toStringAsFixed(1),
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.black87,
                          ),
                        ),
                      ],
                    ),
                    
                    if (widget.pin.description != null && widget.pin.description!.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      const Text(
                        'Описание',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        widget.pin.description!,
                        style: const TextStyle(
                          fontSize: 14,
                          color: Colors.black54,
                        ),
                      ),
                    ],
                  ],
                ),
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
