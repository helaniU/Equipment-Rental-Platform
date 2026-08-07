import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class AppState extends ChangeNotifier {
  final String _baseUrl = 'http://localhost:3000'; // Android emulator URL
  
  String? _token;
  String? _role;
  bool _isBusy = false;

  bool get isAuthenticated => _token != null;
  bool get isStaff => _role == 'staff' || _role == 'admin' || _role == 'warehouse';
  bool get isBusy => _isBusy;
  String? get token => _token;

  Future<void> login(String email, String password) async {
    _isBusy = true;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        _token = data['token'] ?? data['access_token'];
        _role = data['user']?['role'] ?? data['role'] ?? 'customer';
      } else {
        final errorBody = jsonDecode(response.body);
        throw Exception(errorBody['message'] ?? 'Invalid login credentials');
      }
    } finally {
      _isBusy = false;
      notifyListeners();
    }
  }

  Future<void> register(String fullName, String email, String password, String phone) async {
    _isBusy = true;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'fullName': fullName,
          'email': email,
          'password': password,
          'phone': phone,
          'role': 'customer',
        }),
      );

      if (response.statusCode != 200 && response.statusCode != 201) {
        final errorBody = jsonDecode(response.body);
        throw Exception(errorBody['message'] ?? 'Registration failed. Please try again.');
      }
    } finally {
      _isBusy = false;
      notifyListeners();
    }
  }

  Future<void> forgotPassword(String email) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/auth/forgot-password'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email}),
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      final errorBody = jsonDecode(response.body);
      throw Exception(errorBody['message'] ?? 'Failed to send reset instructions.');
    }
  }

  void logout() {
    _token = null;
    _role = null;
    notifyListeners();
  }
}