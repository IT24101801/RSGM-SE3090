from typing import TypedDict

from langgraph.graph import END, START, StateGraph

from agents.career_coach_agent import CareerCoachAgent
from agents.job_matching_agent import JobMatchingAgent
from agents.planner_agent import PlannerAgent
from agents.profile_analysis_agent import ProfileAnalysisAgent
from career_schemas import (
    CareerAdvice,
    CareerStep,
    CareerWorkflowRequest,
    CareerWorkflowResponse,
    JobMatch,
    PlanStep,
    ProfileAnalysis,
    ValidationResult,
)
from tools.career_validation import validate_career_result


class CareerState(TypedDict, total=False):
    request: CareerWorkflowRequest
    plan: list[PlanStep]
    profile_analysis: ProfileAnalysis
    job_matches: list[JobMatch]
    career_advice: CareerAdvice
    validation: ValidationResult
    steps: list[CareerStep]


def _append_step(state: CareerState, agent: str, action: str, status: str = "Completed") -> list[CareerStep]:
    return [*state.get("steps", []), CareerStep(agent=agent, action=action, status=status)]


def planner_node(state: CareerState):
    return {
        "plan": PlannerAgent().run(state["request"].objective),
        "steps": _append_step(state, "PlannerAgent", "CreateStructuredPlan"),
    }


def profile_node(state: CareerState):
    return {
        "profile_analysis": ProfileAnalysisAgent().run(state["request"].candidate),
        "steps": _append_step(state, "ProfileAnalysisAgent", "AnalyseCandidateProfile"),
    }


def matching_node(state: CareerState):
    matches = JobMatchingAgent().run(
        state["request"].candidate,
        state["request"].jobs,
        state["profile_analysis"],
    )
    return {
        "job_matches": matches,
        "steps": _append_step(state, "JobMatchingAgent", "RankPublishedJobs"),
    }


def coach_node(state: CareerState):
    matches = state.get("job_matches", [])
    if not matches:
        return {"steps": _append_step(state, "CareerCoachAgent", "PrepareCareerAdvice", "Skipped")}
    return {
        "career_advice": CareerCoachAgent().run(state["profile_analysis"], matches[0]),
        "steps": _append_step(state, "CareerCoachAgent", "PrepareCareerAdvice"),
    }


def validator_node(state: CareerState):
    result = validate_career_result(
        state["request"].candidate,
        state["request"].jobs,
        state["profile_analysis"],
        state.get("job_matches", []),
        state.get("career_advice"),
    )
    return {
        "validation": result,
        "steps": _append_step(state, "DeterministicValidator", "ValidateAgentOutputs",
                              "Completed" if result.valid else "Failed"),
    }


def build_graph():
    graph = StateGraph(CareerState)
    graph.add_node("planner", planner_node)
    graph.add_node("profile_analysis", profile_node)
    graph.add_node("job_matching", matching_node)
    graph.add_node("career_coach", coach_node)
    graph.add_node("validator", validator_node)
    graph.add_edge(START, "planner")
    graph.add_edge("planner", "profile_analysis")
    graph.add_edge("profile_analysis", "job_matching")
    graph.add_edge("job_matching", "career_coach")
    graph.add_edge("career_coach", "validator")
    graph.add_edge("validator", END)
    return graph.compile()


CAREER_GRAPH = build_graph()


def run_career_workflow(request: CareerWorkflowRequest) -> CareerWorkflowResponse:
    try:
        state = CAREER_GRAPH.invoke({"request": request, "steps": []})
        validation = state["validation"]
        matches = state.get("job_matches", [])
        if not validation.valid:
            return CareerWorkflowResponse(
                workflow_id=request.workflow_id,
                status="SafelyFailed",
                current_step="SafeFailure",
                plan=state.get("plan", []),
                profile_analysis=state.get("profile_analysis"),
                job_matches=matches,
                career_advice=state.get("career_advice"),
                selected_job_id=matches[0].job_id if matches else None,
                validation=validation,
                steps=state.get("steps", []),
                error_summary="Deterministic validation rejected the agent output.",
            )

        if not matches:
            return CareerWorkflowResponse(
                workflow_id=request.workflow_id,
                status="SafelyFailed",
                current_step="SafeFailure",
                plan=state.get("plan", []),
                profile_analysis=state.get("profile_analysis"),
                job_matches=[],
                career_advice=None,
                selected_job_id=None,
                validation=validation,
                steps=state.get("steps", []),
                error_summary="No published jobs were available for recommendation.",
            )

        return CareerWorkflowResponse(
            workflow_id=request.workflow_id,
            status="AwaitingApproval",
            current_step="HumanApproval",
            plan=state["plan"],
            profile_analysis=state["profile_analysis"],
            job_matches=matches,
            selected_job_id=matches[0].job_id,
            career_advice=state.get("career_advice"),
            validation=validation,
            steps=[*state.get("steps", []),
                   CareerStep(agent="HumanApproval", action="AwaitJobSeekerDecision", status="Pending")],
        )
    except Exception:
        # Never leak API keys, prompts, candidate data, or stack traces to ASP.NET.
        return CareerWorkflowResponse(
            workflow_id=request.workflow_id,
            status="SafelyFailed",
            current_step="SafeFailure",
            plan=[],
            profile_analysis=None,
            job_matches=[],
            selected_job_id=None,
            career_advice=None,
            validation=ValidationResult(valid=False, errors=["Agent workflow execution failed."], checks=[]),
            steps=[CareerStep(agent="WorkflowCoordinator", action="RunCareerWorkflow", status="Failed")],
            error_summary="The AI workflow could not finish safely. Check the agent-service logs and configuration.",
        )
