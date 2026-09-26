from uuid import uuid4

from fastapi.testclient import TestClient

from app.coordinator import WorkflowCoordinator
from app.main import app
from app.schemas import CandidateSnapshot, JobSnapshot, Readiness, ReadinessRequest


def snapshot(**changes):
    data = dict(workflow_id=uuid4(), application_id=uuid4(), application_status="UnderReview",
                job=JobSnapshot(id=uuid4(), status="Published", required_skill_ids=[uuid4()]),
                candidate=CandidateSnapshot(has_cv=True, skill_ids=[uuid4()], has_headline=True,
                                            has_bio=True, education_count=0, work_experience_count=0))
    data.update(changes)
    return ReadinessRequest(**data)


def test_eligible_candidate_without_work_history_is_ready():
    result = WorkflowCoordinator().run(snapshot())
    assert result.readiness_status == Readiness.READY
    assert result.workflow_eligible
    assert result.next_step == "SkillMatching"


def test_missing_cv_does_not_modify_business_status():
    request = snapshot(candidate=CandidateSnapshot(has_cv=False, skill_ids=[uuid4()],
        has_headline=True, has_bio=True, education_count=1, work_experience_count=0))
    result = WorkflowCoordinator().run(request)
    assert result.readiness_status == Readiness.ATTENTION
    assert "CV_MISSING" in [w.code for w in result.warnings]
    assert request.application_status == "UnderReview"


def test_withdrawn_is_skipped():
    result = WorkflowCoordinator().run(snapshot(application_status="Withdrawn"))
    assert result.readiness_status == Readiness.SKIPPED
    assert not result.workflow_eligible


def test_service_key_is_required(monkeypatch):
    monkeypatch.setenv("RSGM_AGENT_SERVICE_KEY", "a-local-test-secret")
    client = TestClient(app)
    assert client.post("/internal/workflows/application-readiness", json=snapshot().model_dump(mode="json")).status_code == 401
    response = client.post("/internal/workflows/application-readiness", json=snapshot().model_dump(mode="json"),
                           headers={"X-Agent-Service-Key": "a-local-test-secret"})
    assert response.status_code == 200
    assert response.json()["readinessStatus"] == "ReadyForMatching"


def test_agent_failure_is_safe():
    class BrokenAgent:
        def assess(self, _snapshot):
            raise RuntimeError("internal failure")

    result = WorkflowCoordinator(BrokenAgent()).run(snapshot())
    assert result.readiness_status == Readiness.FAILED
    assert not result.workflow_eligible
    assert result.next_step == "RetryOrManualReview"
