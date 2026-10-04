import '../../models/panelist/panelist_shortlist.dart';
import '../api_client.dart';
import '../../models/panelist/panelist_candidate.dart';

/// Read-only shortlist service for the Hiring Panelist mobile app.
///
/// Uses the existing backend endpoint:
/// GET /api/hiring/panelist/shortlists
///
/// Scheduling and Agentic AI actions remain web-only.
class PanelistShortlistService {
  PanelistShortlistService({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient();

  final ApiClient _apiClient;

  Future<List<PanelistShortlist>> getShortlists() async {
    final response =
        await _apiClient.get('hiring/panelist/shortlists');

    if (response is List) {
      return response
          .whereType<Map<String, dynamic>>()
          .map(PanelistShortlist.fromJson)
          .toList();
    }

    return const [];
  }

  /// Fetches the full read-only profile of a shortlisted candidate.
  ///
  /// [applicationId] is the shortlist candidate/application ID.
  Future<PanelistCandidate> getCandidate(String applicationId) async {
    final response = await _apiClient.get(
      'hiring/panelist/shortlists/applications/$applicationId/candidate',
    );

    if (response is Map<String, dynamic>) {
      return PanelistCandidate.fromJson(response);
    }

    throw const ApiException(
      message: 'Unexpected server response when loading candidate details.',
    );
  }
}