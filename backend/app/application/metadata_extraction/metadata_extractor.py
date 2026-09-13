import re


class MetadataExtractor:
    """Extract metadata from book files and text."""

    _ISBN_RE = re.compile(
        r"(?:ISBN[-:]?\s*)?"
        r"(97[89][- ]?\d{1,5}[- ]?\d{1,7}[- ]?\d{1,7}[- ]?\d)",
        re.IGNORECASE,
    )

    @staticmethod
    def extract_title_hint_from_filename(filename: str) -> str:
        name = filename.rsplit(".", 1)[0]
        name = re.sub(r"[_\-]+", " ", name)

        return name.strip()

    @staticmethod
    def find_isbn(text: str) -> str | None:
        match = MetadataExtractor._ISBN_RE.search(text)

        if not match:
            return None

        return re.sub(r"[- ]", "", match.group(1))