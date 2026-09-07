import uuid

from celery import Celery

from app.application.tasks.task_publisher import TaskPublisher


class CeleryTaskPublisher(TaskPublisher):
    def __init__(self, celery_app: Celery):
        self.celery_app = celery_app

    def publish_extract_metadata(self, book_id: uuid.UUID) -> None:
        self.celery_app.send_task(
            "EXTRACT_METADATA",
            kwargs={"book_id": str(book_id)},
        )

    def publish_extract_content(self, book_id: uuid.UUID) -> None:
        self.celery_app.send_task(
            "EXTRACT_CONTENT",
            kwargs={"book_id": str(book_id)},
        )