import 'dart:ui';
import 'package:flutter/material.dart';
import 'pin_view_page.dart';

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

  @override
  void initState() {
    super.initState();
    _selectedTab = widget.initialTab;
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
        ListView.builder(
          padding: EdgeInsets.only(
            top: MediaQuery.of(context).padding.top + 70,
            left: 16,
            right: 16,
            bottom: 100, // Отступ для док-станции
          ),
          itemCount: 20,
          itemBuilder: (context, index) {
            return GestureDetector(
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => const PinViewPage(),
                  ),
                );
              },
              child: Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${_selectedTab == 0 ? 'Рекомендация' : 'Подписка'} пина ${index + 1}',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: Colors.black,
                  ),
                ),
              ),
            );
          },
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
