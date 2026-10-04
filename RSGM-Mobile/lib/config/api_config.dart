import 'package:flutter/foundation.dart';

class ApiConfig {
  static String get baseUrl {
    if (kIsWeb) {
      // Flutter Web running in Chrome / Edge
      return 'http://localhost:5248/api';
    }

    // Android Emulator
    return 'http://10.0.2.2:5248/api';
  }
}