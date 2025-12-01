import 'dart:ui';
import 'package:flutter/material.dart';
import 'pin_view_page.dart';
import '../services/pin_service.dart';
import '../models/pin.dart';
import '../data/mock_data.dart';

// TODO: Установите false когда бэкенд готов
const bool USE_MOCK_DATA = true;

class PinsPage extends StatefulWidget {
  final VoidCallback? onSearchTap;
  final int initialTab;
  final ValueChanged<int>? onTabChanged;
  
  const PinsPage({
    super.key,
    this.onSearchTap,
    this.initialTab = 0,
    this.onTabChanged,
  });

  @override
  State<PinsPage> createState() => _PinsPageState();
}

class _PinsPageState extends State<PinsPage> with AutomaticKeepAliveClientMixin {
  late int _selectedTab;
  final PinService _pinService = PinService();
  List<Pin> _pins = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _selectedTab = widget.initialTab;
    _loadPins();
  }

  Future<void> _loadPins() async {
    setState(() {
      _isLoading = true;
    });

    List<Pin> pins;
    
    if (USE_MOCK_DATA) {
      // Используем mock-данные для тестирования UI
      await Future.delayed(const Duration(milliseconds: 500)); // Имитация сетевого запроса
      pins = MockData.mockPins;
    } else {
      // Реальный запрос к API
      // TODO: Заменить на реальный userId из auth
      final String mockUserId = '00000000-0000-0000-0000-000000000000';
      pins = await _pinService.getPinsByUser(mockUserId);
    }

    setState(() {
      _pins = pins;
      _isLoading = false;
    });
  }

  @override
  void didUpdateWidget(PinsPage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initialTab != _selectedTab) {
      setState(() {
        _selectedTab = widget.initialTab;
      });
    }
  }

  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context); // Важно для AutomaticKeepAliveClientMixin
    return Stack(
      children: [
        // Контент страницы
        _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _pins.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.push_pin_outlined, size: 64, color: Colors.grey),
                        const SizedBox(height: 16),
                        Text(
                          'Пока нет пинов',
                          style: TextStyle(
                            fontSize: 18,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  )
                : RefreshIndicator(
                    onRefresh: _loadPins,
                    child: ListView.builder(
                      padding: EdgeInsets.only(
                        top: MediaQuery.of(context).padding.top + 70,
                        left: 16,
                        right: 16,
                        bottom: 100, // Отступ для док-станции
                      ),
                      itemCount: _pins.length,
                      itemBuilder: (context, index) {
                        final pin = _pins[index];
                        return GestureDetector(
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (context) => PinViewPage(pin: pin),
                              ),
                            );
                          },
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.grey[200],
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                // Превью изображения если есть
                                if (pin.images.isNotEmpty)
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(8),
                                    child: Image.network(
                                      pin.images.first.imageUrl,
                                      width: 60,
                                      height: 60,
                                      fit: BoxFit.cover,
                                      errorBuilder: (context, error, stackTrace) {
                                        return Container(
                                          width: 60,
                                          height: 60,
                                          color: Colors.grey[300],
                                          child: const Icon(Icons.image_not_supported),
                                        );
                                      },
                                    ),
                                  ),
                                if (pin.images.isNotEmpty) const SizedBox(width: 12),
                                // Информация о пине
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        pin.name,
                                        style: const TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w600,
                                          color: Colors.black,
                                        ),
                                      ),
                                      if (pin.address != null) ...[
                                        const SizedBox(height: 4),
                                        Text(
                                          pin.address!,
                                          style: TextStyle(
                                            fontSize: 14,
                                            color: Colors.grey[600],
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ],
                                      const SizedBox(height: 4),
                                      Row(
                                        children: [
                                          const Icon(Icons.star, size: 16, color: Colors.amber),
                                          const SizedBox(width: 4),
                                          Text(
                                            pin.rating.toStringAsFixed(1),
                                            style: TextStyle(
                                              fontSize: 14,
                                              color: Colors.grey[700],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
        // Плавающая верхняя панель
        Positioned(
          top: 0,
          left: 0,
          right: 0,
          child: Container(
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top + 12,
              left: 16,
              right: 16,
              bottom: 12,
            ),
            child: Row(
              children: [
                const SizedBox(width: 40), // Отступ для симметрии
                Expanded(
                  child: Center(
                    child: _buildTabSwitcher(),
                  ),
                ),
                // Кнопка поиска
                IconButton(
                  icon: const Icon(Icons.search, size: 28),
                  onPressed: widget.onSearchTap,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTabSwitcher() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: Colors.grey[400]?.withOpacity(0.3),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: Colors.white.withOpacity(0.2),
              width: 0.5,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildTab('Рекомендации', 0),
              const SizedBox(width: 4),
              _buildTab('Подписки', 1),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTab(String title, int index) {
    final isSelected = _selectedTab == index;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedTab = index;
        });
        widget.onTabChanged?.call(index);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Text(
          title,
          style: TextStyle(
            fontSize: 14,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
            color: isSelected ? Colors.black : Colors.grey[600],
          ),
        ),
      ),
    );
  }
}
