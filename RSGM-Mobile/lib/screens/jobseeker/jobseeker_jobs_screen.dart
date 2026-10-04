import 'package:flutter/material.dart';

import '../../models/jobseeker/jobseeker_models.dart';
import '../../services/api_client.dart';
import '../../services/jobseeker/jobseeker_service.dart';
import '../../theme/app_theme.dart';

class JobSeekerJobsScreen extends StatefulWidget {
  const JobSeekerJobsScreen({
    super.key,
    required this.service,
  });

  final JobSeekerService service;

  @override
  State<JobSeekerJobsScreen> createState() => _JobSeekerJobsScreenState();
}

class _JobSeekerJobsScreenState extends State<JobSeekerJobsScreen> {
  List<JobSeekerJob> jobs = [];
  bool loading = true;
  String? error;
  String query = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => loading = true);

    try {
      final result = await widget.service.getJobs();

      if (!mounted) return;

      setState(() {
        jobs = result;
        error = null;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => error = e.message);
    } catch (e) {
      if (!mounted) return;
      setState(() => error = 'Failed to load jobs. Please try again.');
    } finally {
      if (mounted) {
        setState(() => loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final normalizedQuery = query.trim().toLowerCase();

    final shownJobs = jobs.where((job) {
      final searchableText = [
        job.title,
        job.company,
        job.location,
        ...job.requiredSkills,
      ].join(' ').toLowerCase();

      return searchableText.contains(normalizedQuery);
    }).toList();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: TextField(
            onChanged: (value) {
              setState(() => query = value);
            },
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.search_rounded),
              hintText: 'Search jobs, companies, skills...',
            ),
          ),
        ),
        Expanded(
          child: _buildBody(shownJobs),
        ),
      ],
    );
  }

  Widget _buildBody(List<JobSeekerJob> shownJobs) {
    if (loading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (error != null) {
      return _ErrorState(
        message: error!,
        retry: _load,
      );
    }

    if (shownJobs.isEmpty) {
      return RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          children: const [
            SizedBox(height: 180),
            Center(
              child: Text('No jobs found.'),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        physics: const AlwaysScrollableScrollPhysics(),
        itemCount: shownJobs.length,
        separatorBuilder: (_, _) => const SizedBox(height: 10),
        itemBuilder: (context, index) {
          final job = shownJobs[index];

          return Card(
            child: ListTile(
              contentPadding: const EdgeInsets.all(14),
              title: Text(
                job.title,
                style: const TextStyle(
                  fontWeight: FontWeight.w800,
                ),
              ),
              subtitle: Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('${job.company} • ${job.location}'),
                    const SizedBox(height: 6),
                    Text(
                      '${job.workMode} • ${job.employmentType}',
                      style: const TextStyle(
                        color: AppTheme.muted,
                      ),
                    ),
                    if (job.requiredSkills.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Wrap(
                          spacing: 6,
                          runSpacing: 6,
                          children: job.requiredSkills
                              .take(3)
                              .map(
                                (skill) => Chip(
                                  label: Text(skill),
                                  visualDensity: VisualDensity.compact,
                                ),
                              )
                              .toList(),
                        ),
                      ),
                  ],
                ),
              ),
              trailing: const Icon(Icons.chevron_right_rounded),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => JobSeekerJobDetailScreen(
                      job: job,
                      service: widget.service,
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

class JobSeekerJobDetailScreen extends StatefulWidget {
  const JobSeekerJobDetailScreen({
    super.key,
    required this.job,
    required this.service,
  });

  final JobSeekerJob job;
  final JobSeekerService service;

  @override
  State<JobSeekerJobDetailScreen> createState() =>
      _JobSeekerJobDetailScreenState();
}

class _JobSeekerJobDetailScreenState
    extends State<JobSeekerJobDetailScreen> {
  bool applying = false;

  Future<void> _apply() async {
    setState(() => applying = true);

    try {
      await widget.service.apply(widget.job.id);

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Application submitted successfully.'),
        ),
      );
    } on ApiException catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.message),
        ),
      );
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to submit application. Please try again.'),
        ),
      );
    } finally {
      if (mounted) {
        setState(() => applying = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final job = widget.job;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Job details'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Text(
            job.title,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
          ),
          const SizedBox(height: 6),
          Text(
            '${job.company} • ${job.location}',
            style: const TextStyle(
              color: AppTheme.muted,
            ),
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              Chip(label: Text(job.workMode)),
              Chip(label: Text(job.employmentType)),
              Chip(label: Text(job.experienceLevel)),
              Chip(label: Text(job.salaryLabel)),
            ],
          ),
          _Section(
            title: 'Description',
            body: job.description,
          ),
          _Section(
            title: 'Responsibilities',
            body: job.responsibilities,
          ),
          _Section(
            title: 'Requirements',
            body: job.requirements,
          ),
          if (job.requiredSkills.isNotEmpty) ...[
            const SizedBox(height: 18),
            const Text(
              'Required skills',
              style: TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: job.requiredSkills
                  .map(
                    (skill) => Chip(
                      label: Text(skill),
                    ),
                  )
                  .toList(),
            ),
          ],
          const SizedBox(height: 22),
          FilledButton.icon(
            onPressed: applying ? null : _apply,
            icon: applying
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                    ),
                  )
                : const Icon(Icons.send_rounded),
            label: Text(
              applying ? 'Applying...' : 'Apply now',
            ),
          ),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({
    required this.title,
    required this.body,
  });

  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    if (body.trim().isEmpty) {
      return const SizedBox.shrink();
    }

    return Padding(
      padding: const EdgeInsets.only(top: 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontWeight: FontWeight.w800,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 7),
          Text(
            body,
            style: const TextStyle(height: 1.5),
          ),
        ],
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({
    required this.message,
    required this.retry,
  });

  final String message;
  final VoidCallback retry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Padding(
            padding: const EdgeInsets.all(20),
            child: Text(
              message,
              textAlign: TextAlign.center,
            ),
          ),
          FilledButton(
            onPressed: retry,
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}
