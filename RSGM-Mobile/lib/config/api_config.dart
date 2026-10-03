import 'package:flutter/foundation.dart';

class ApiConfig {
  static String get baseUrl =>
      kIsWeb ? 'http://localhost:5248/api' : 'http://10.0.2.2:5248/api';
}