from sqlalchemy.orm import DeclarativeBase, declared_attr
import re

class Base(DeclarativeBase):
    @declared_attr
    def __tablename__(cls):
        # Автоматически генерирует имя таблицы в snake_case
        return re.sub(r'(?<!^)(?=[A-Z])', '_', cls.__name__).lower() + 's'