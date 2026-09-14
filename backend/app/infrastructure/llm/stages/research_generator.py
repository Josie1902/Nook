from pydantic import BaseModel

from app.application.generation.ports import ResearchDetails, ResearchGenerator
from app.core.settings import StageConfig
from app.infrastructure.llm.providers.base import BaseLLMClient
from app.infrastructure.llm.schemas import LLMMessage


class ResearchPromptResponse(BaseModel):
    topic: str
    description: str


class LLMResearchGenerator(ResearchGenerator):
    def __init__(self, llm_client: BaseLLMClient, stage_config: StageConfig):
        self._client = llm_client
        self._stage_config = stage_config

    def generate(self, request: str) -> ResearchDetails:
        prompt = (
            "Turn the user's request into a precise research topic and a short description "
            "that clarifies the scope, audience, and learning goal.\n\n"
            "Rules:\n"
            "- Keep the topic concise and specific.\n"
            "- Keep the description to 1-3 sentences.\n"
            "- Do not mention that you are an AI.\n\n"
            f"User request: {request}"
        )

        result = self._client.run_stage_structured(
            self._stage_config,
            messages=[LLMMessage(role="user", content=prompt)],
            schema=ResearchPromptResponse,
        )

        topic = (result.topic or "Untitled").strip()
        description = (result.description or topic).strip()
        if not topic:
            topic = "Untitled"
        if not description:
            description = topic
        return ResearchDetails(topic=topic, description=description)

    def refine(
        self,
        topic: str,
        description: str,
        comments: str,
    ) -> ResearchDetails:
        prompt = (
            "Refine the current research topic and description using the user comments.\n\n"
            "Keep the final topic focused and specific, and keep the final description clear and informative.\n"
            "Return JSON with 'topic' and 'description'.\n\n"
            f"Current topic: {topic}\n"
            f"Current description: {description}\n"
            f"Comments: {comments or 'No additional comments.'}"
        )

        result = self._client.run_stage_structured(
            self._stage_config,
            messages=[LLMMessage(role="user", content=prompt)],
            schema=ResearchPromptResponse,
        )

        refined_topic = (result.topic or topic).strip()
        refined_description = (result.description or description).strip()
        return ResearchDetails(topic=refined_topic or topic, description=refined_description or description)
