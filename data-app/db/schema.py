from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
    UniqueConstraint,
    Index,
    Float,
    create_engine,
)

from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

course_libeds = Table(
    "course_libeds",
    Base.metadata,
    Column("course_id", String, ForeignKey("courses.id"), primary_key=True),
    Column("libed_name", String, ForeignKey("libeds.name"), primary_key=True),
)

requirement_courses = Table(
    "requirement_courses",
    Base.metadata,
    Column(
        "section_id", Integer, ForeignKey("requirement_sections.id"), primary_key=True
    ),
    Column("course_id", String, ForeignKey("courses.id"), primary_key=True),
    Index("ix_requirement_courses_course_id", "course_id"),
)


class Course(Base):
    __tablename__ = "courses"
    __table_args__ = (UniqueConstraint("dept", "course_num"),)
    id = Column(String, primary_key=True)
    dept = Column(String, nullable=False)
    course_num = Column(String, nullable=False)
    name = Column(String, nullable=False)
    descr = Column(Text, nullable=True)
    cred_min = Column(Float, nullable=True)
    cred_max = Column(Float, nullable=True)
    active = Column(Boolean, nullable=False, default=True)
    libeds = relationship("LibEd", secondary=course_libeds, back_populates="courses")


class LibEd(Base):
    __tablename__ = "libeds"
    name = Column(String, primary_key=True)
    courses = relationship("Course", secondary=course_libeds, back_populates="libeds")


class Program(Base):
    __tablename__ = "programs"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    college = Column(String, nullable=False)
    career = Column(String, nullable=False)
    type = Column(String, nullable=False)
    total_credits = Column(Float, nullable=True)
    sections = relationship(
        "RequirementSection",
        back_populates="program",
        cascade="all, delete-orphan",
        order_by="RequirementSection.id",
    )


class RequirementSection(Base):
    __tablename__ = "requirement_sections"
    id = Column(Integer, primary_key=True, autoincrement=True)
    program_id = Column(String, ForeignKey("programs.id"), nullable=False)
    name = Column(String, nullable=False)
    level = Column(String, nullable=False)
    rule = Column(JSON, nullable=False)
    program = relationship("Program", back_populates="sections")


def make_engine(path):
    return create_engine(f"sqlite:///{path}", echo=False, future=True)
