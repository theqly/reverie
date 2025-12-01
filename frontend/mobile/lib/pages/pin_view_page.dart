import 'dart:ui';
import 'package:flutter/material.dart';
import '../models/pin.dart';
import '../services/pin_service.dart';
import '../data/mock_data.dart';

// TODO: Установите false когда бэкенд готов
const bool USE_MOCK_DATA = true;

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
  bool _isSubscribed = false;
  bool _isLiked = false;
  bool _isBookmarked = false;
  
  // Guest mode - пока всегда true
  final bool _isGuest = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    setState(() {
      _isLoadingStats = true;
    });

    int reactionsCount;
    int commentsCount;

    if (USE_MOCK_DATA) {
      // Используем mock-данные для тестирования UI
      await Future.delayed(const Duration(milliseconds: 300)); // Имитация сетевого запроса
      reactionsCount = MockData.getMockReactionsCount(widget.pin.id);
      commentsCount = MockData.getMockCommentsCount(widget.pin.id);
    } else {
      // Реальный запрос к API
      reactionsCount = await _pinService.getReactionsCount(widget.pin.id);
      final comments = await _pinService.getCommentsByPin(widget.pin.id);
      commentsCount = comments.length;
    }

    setState(() {
      _reactionsCount = reactionsCount;
      _commentsCount = commentsCount;
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

  void _showGuestAuthPrompt(String action) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Требуется авторизация'),
        content: Text('Чтобы $action, необходимо войти в аккаунт'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Отмена'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // TODO: Навигация на страницу авторизации
            },
            child: const Text('Войти'),
          ),
        ],
      ),
    );
  }

  void _handleLike() {
    if (_isGuest) {
      _showGuestAuthPrompt('поставить лайк');
      return;
    }
    setState(() {
      _isLiked = !_isLiked;
      _reactionsCount += _isLiked ? 1 : -1;
    });
  }

  void _handleComment() {
    if (_isGuest) {
      _showGuestAuthPrompt('оставить комментарий');
      return;
    }
    _showCommentsBottomSheet();
  }

  void _handleBookmark() {
    if (_isGuest) {
      _showGuestAuthPrompt('сохранить пин');
      return;
    }
    setState(() {
      _isBookmarked = !_isBookmarked;
    });
  }

  void _handleSubscribe() {
    if (_isGuest) {
      _showGuestAuthPrompt('подписаться на автора');
      return;
    }
    setState(() {
      _isSubscribed = !_isSubscribed;
    });
  }

  void _handleShare() {
    // Генерация UTM ссылки для шаринга
    final String shareUrl = 'https://reverie.app/pin/${widget.pin.id}?utm_source=mobile&utm_medium=share&utm_campaign=pin_share';
    
    // TODO: Использовать share_plus пакет
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Поделиться'),
        content: SelectableText(shareUrl),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Закрыть'),
          ),
        ],
      ),
    );
  }

  void _showMoreMenu() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.report_outlined, color: Colors.red),
                title: const Text('Пожаловаться'),
                onTap: () {
                  Navigator.pop(context);
                  _showReportDialog();
                },
              ),
              ListTile(
                leading: const Icon(Icons.copy),
                title: const Text('Скопировать пин'),
                onTap: () {
                  Navigator.pop(context);
                  if (_isGuest) {
                    _showGuestAuthPrompt('скопировать пин');
                  } else {
                    // TODO: Копирование пина
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showReportDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Пожаловаться'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('Спам'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              title: const Text('Неприемлемый контент'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              title: const Text('Неверная информация'),
              onTap: () => Navigator.pop(context),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Отмена'),
          ),
        ],
      ),
    );
  }

  void _showCommentsBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (context, scrollController) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Комментарии ($_commentsCount)',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: ListView.builder(
                  controller: scrollController,
                  itemCount: 5,
                  itemBuilder: (context, index) => ListTile(
                    leading: const CircleAvatar(
                      child: Icon(Icons.person),
                    ),
                    title: Text('Пользователь ${index + 1}'),
                    subtitle: const Text('Отличное место!'),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _searchByLocation() {
    // TODO: Навигация на страницу поиска с фильтром по локации
    if (widget.pin.address != null) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Поиск по локации'),
          content: Text('Поиск пинов в: ${widget.pin.address}'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('OK'),
            ),
          ],
        ),
      );
    }
  }

  void _showAlsoInThisPlace() {
    // TODO: Показать другие пины в этом месте
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Тоже в этом месте'),
        content: const Text('Здесь будут другие пины поблизости'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
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
                  onTap: _showMoreMenu,
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
                                icon: _isLiked ? Icons.favorite : Icons.favorite_border,
                                label: '$_reactionsCount',
                                onTap: _handleLike,
                                color: _isLiked ? Colors.red : Colors.black87,
                              ),
                              const SizedBox(width: 20),
                              _buildActionButton(
                                icon: Icons.chat_bubble_outline,
                                label: '$_commentsCount',
                                onTap: _handleComment,
                              ),
                              const SizedBox(width: 20),
                              _buildActionButton(
                                icon: _isBookmarked ? Icons.bookmark : Icons.bookmark_border,
                                label: 'Сохранить',
                                onTap: _handleBookmark,
                                color: _isBookmarked ? Colors.blue : Colors.black87,
                              ),
                              const Spacer(),
                              _buildActionButton(
                                icon: Icons.share_outlined,
                                label: '',
                                onTap: _handleShare,
                              ),
                            ],
                          ),
                    
                    const SizedBox(height: 20),
                    
                    // Автор пина
                    Row(
                      children: [
                        GestureDetector(
                          onTap: () {
                            // TODO: Навигация на профиль автора
                            if (_isGuest) {
                              // Guest может просматривать профили
                            }
                          },
                          child: Row(
                            children: [
                              CircleAvatar(
                                radius: 16,
                                backgroundImage: widget.pin.owner?.avatarUrl != null
                                    ? NetworkImage(widget.pin.owner!.avatarUrl!)
                                    : null,
                                child: widget.pin.owner?.avatarUrl == null
                                    ? const Icon(Icons.person, size: 18)
                                    : null,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                widget.pin.owner?.displayName ?? 
                                widget.pin.owner?.username ?? 
                                'Автор пина',
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.black87,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const Spacer(),
                        TextButton(
                          onPressed: _handleSubscribe,
                          style: TextButton.styleFrom(
                            backgroundColor: _isSubscribed ? Colors.grey[300] : Colors.blue,
                            foregroundColor: _isSubscribed ? Colors.black87 : Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                            ),
                          ),
                          child: Text(_isSubscribed ? 'Подписан' : 'Подписаться'),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 16),
                    
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
                      GestureDetector(
                        onTap: _searchByLocation,
                        child: Row(
                          children: [
                            const Icon(Icons.location_on, size: 16, color: Colors.blue),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                widget.pin.address!,
                                style: const TextStyle(
                                  fontSize: 14,
                                  color: Colors.blue,
                                  decoration: TextDecoration.underline,
                                ),
                              ),
                            ),
                          ],
                        ),
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
                    
                    const SizedBox(height: 16),
                    
                    // Кнопка 'Тоже в этом месте'
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        onPressed: _showAlsoInThisPlace,
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          side: const BorderSide(color: Colors.blue),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text(
                          'Тоже в этом месте',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.blue,
                          ),
                        ),
                      ),
                    ),
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
    Color? color,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Row(
        children: [
          Icon(
            icon,
            color: color ?? Colors.black87,
            size: 24,
          ),
          if (label.isNotEmpty) ...[
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 14,
                color: color ?? Colors.black87,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
