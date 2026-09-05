import uuid

from celery import Celery

from app.application.tasks.task_publisher import TaskPublisher


class CeleryTaskPublisher(TaskPublisher):
    def __init__(self, celery_app: Celery):
        self.celery_app = celery_app

    def publish_process_book(self, book_id: uuid.UUID) -> None:
        self.celery_app.send_task("PROCESS_BOOK", kwargs={"book_id": str(book_id)})