import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Equipment Rental Home'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => state.logout(),
          ),
        ],
      ),
      body: Center(
        child: Text(
          'Welcome! You are logged in.',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }
}