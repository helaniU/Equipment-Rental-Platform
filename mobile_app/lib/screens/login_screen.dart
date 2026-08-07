import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  String _error = '';
  bool _loading = false;

  // Forgot Password States
  bool _isForgotOpen = false;
  final _forgotEmailController = TextEditingController();
  bool _forgotLoading = false;
  bool _forgotSuccess = false;
  String _forgotError = '';

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _forgotEmailController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    setState(() {
      _error = '';
      _loading = true;
    });

    try {
      final state = context.read<AppState>();
      await state.login(_emailController.text.trim(), _passwordController.text.trim());
    } catch (err) {
      setState(() {
        _error = err.toString().replaceAll('Exception: ', '');
      });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _handleForgotPasswordSubmit() async {
    setState(() {
      _forgotError = '';
      _forgotLoading = true;
    });

    try {
      final state = context.read<AppState>();
      await state.forgotPassword(_forgotEmailController.text.trim());
      setState(() => _forgotSuccess = true);
    } catch (err) {
      setState(() {
        _forgotError = err.toString().replaceAll('Exception: ', '');
      });
    } finally {
      if (mounted) setState(() => _forgotLoading = false);
    }
  }

  void _handleDemoLogin(String demoEmail) {
    _emailController.text = demoEmail;
    _passwordController.text = 'Admin@12345';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A), // bg-slate-900
      body: Stack(
        children: [
          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Container(
                constraints: const BoxConstraints(maxWidth: 400),
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 20)],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text(
                      'Equipment Rental Portal',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.black87),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Sign in to manage equipment and bookings',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 13, color: Colors.grey),
                    ),
                    const SizedBox(height: 20),

                    if (_error.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.all(10),
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: Colors.red.shade50,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.red.shade200),
                        ),
                        child: Text(_error, style: const TextStyle(color: Colors.red, fontSize: 13)),
                      ),

                    // Email Field
                    const Text('Email Address', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: Colors.black87)),
                    const SizedBox(height: 4),
                    TextField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      decoration: const InputDecoration(
                        hintText: 'admin@rental.com',
                        prefixIcon: Icon(Icons.mail_outline, size: 20),
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Password Label & Forgot button
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Password', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: Colors.black87)),
                        GestureDetector(
                          onTap: () {
                            setState(() {
                              _isForgotOpen = true;
                              _forgotSuccess = false;
                              _forgotEmailController.text = _emailController.text;
                              _forgotError = '';
                            });
                          },
                          child: const Text('Forgot password?', style: TextStyle(fontSize: 12, color: Colors.blue, fontWeight: FontWeight.w500)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    TextField(
                      controller: _passwordController,
                      obscureText: true,
                      decoration: const InputDecoration(
                        hintText: '••••••••',
                        prefixIcon: Icon(Icons.lock_outline, size: 20),
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Sign In Button
                    ElevatedButton(
                      onPressed: _loading ? null : _handleSubmit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue.shade600,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: Text(_loading ? 'Authenticating...' : 'Sign In', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                    ),
                    const SizedBox(height: 16),

                    // Register Link
                    Center(
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Text("Don't have an account? ", style: TextStyle(fontSize: 12, color: Colors.grey)),
                          GestureDetector(
                            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterScreen())),
                            child: const Text('Register as a Customer', style: TextStyle(fontSize: 12, color: Colors.blue, fontWeight: FontWeight.w600)),
                          ),
                        ],
                      ),
                    ),

                    const Divider(height: 30),

                    // Quick Demo Accounts Section
                    const Text('QUICK DEMO ACCOUNTS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                    const SizedBox(height: 8),
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      childAspectRatio: 3,
                      crossAxisSpacing: 8,
                      mainAxisSpacing: 8,
                      children: [
                        _demoButton('👑 Admin', 'admin@rental.com'),
                        _demoButton('👔 Staff', 'staff@rental.com'),
                        _demoButton('📦 Warehouse', 'warehouse@rental.com'),
                        _demoButton('👤 Customer', 'customer@rental.com'),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Forgot Password Modal Popup overlay
          if (_isForgotOpen)
            Container(
              color: Colors.black54,
              child: Center(
                child: Container(
                  constraints: const BoxConstraints(maxWidth: 340),
                  margin: const EdgeInsets.all(20),
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
                  child: _forgotSuccess
                      ? Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.check_circle, color: Colors.green, size: 48),
                            const SizedBox(height: 10),
                            const Text('Instructions Sent!', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            const SizedBox(height: 6),
                            Text('Check your inbox for reset details sent to ${_forgotEmailController.text}', textAlign: TextAlign.center, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: () => setState(() => _isForgotOpen = false),
                              style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white, minimumSize: const Size.fromHeight(40)),
                              child: const Text('Back to Sign In'),
                            ),
                          ],
                        )
                      : Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Reset Password', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                IconButton(icon: const Icon(Icons.close, size: 20), onPressed: () => setState(() => _isForgotOpen = false)),
                              ],
                            ),
                            const Text("Enter your account email and we'll send you recovery instructions.", style: TextStyle(fontSize: 12, color: Colors.grey)),
                            const SizedBox(height: 12),
                            if (_forgotError.isNotEmpty)
                              Container(
                                padding: const EdgeInsets.all(8),
                                margin: const EdgeInsets.only(bottom: 10),
                                color: Colors.red.shade50,
                                child: Text(_forgotError, style: const TextStyle(color: Colors.red, fontSize: 12)),
                              ),
                            const Text('Email Address', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
                            const SizedBox(height: 4),
                            TextField(
                              controller: _forgotEmailController,
                              decoration: const InputDecoration(hintText: 'name@example.com', border: OutlineInputBorder(), contentPadding: EdgeInsets.all(10)),
                            ),
                            const SizedBox(height: 16),
                            Row(
                              children: [
                                Expanded(
                                  child: OutlinedButton(
                                    onPressed: () => setState(() => _isForgotOpen = false),
                                    child: const Text('Cancel'),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: ElevatedButton(
                                    onPressed: _forgotLoading ? null : _handleForgotPasswordSubmit,
                                    style: ElevatedButton.styleFrom(backgroundColor: Colors.blue.shade600, foregroundColor: Colors.white),
                                    child: Text(_forgotLoading ? 'Sending...' : 'Send Link'),
                                  ),
                                ),
                              ],
                            )
                          ],
                        ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _demoButton(String label, String email) {
    return OutlinedButton(
      onPressed: () => _handleDemoLogin(email),
      style: OutlinedButton.styleFrom(
        backgroundColor: Colors.grey.shade50,
        alignment: Alignment.centerLeft,
        padding: const EdgeInsets.symmetric(horizontal: 8),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
      ),
      child: Text(label, style: const TextStyle(fontSize: 11, color: Colors.black87)),
    );
  }
}