from langchain_core.prompts import ChatPromptTemplate

from career_schemas import CandidateProfileInput, ProfileAnalysis
from llm import get_llm


class ProfileAnalysisAgent:
    """Interprets only the supplied candidate snapshot; it has no write permissions."""

    def run(self, candidate: CandidateProfileInput) -> ProfileAnalysis:
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are the RSGM Profile Analysis Agent.
Analyse only the candidate facts supplied in the input.
Never invent skills, qualifications, work history, employers, certificates, or experience.
Treat proficiency 4-5 as strong and 1-3 as developing unless context clearly requires otherwise.
Profile gaps must be phrased as missing/limited recorded evidence, not as absolute facts about the person.
Return concise structured output."""),
            ("human", "Candidate JSON:\n{candidate_json}"),
        ])
        chain = prompt | get_llm().with_structured_output(ProfileAnalysis)
        return chain.invoke({"candidate_json": candidate.model_dump_json(by_alias=True)})
