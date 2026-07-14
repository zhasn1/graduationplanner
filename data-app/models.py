from __future__ import annotations
from dataclasses import dataclass, field, fields


@dataclass
class Constraints:
    """
    How much of a node must be satisfied. None means "no bound".
    min_children applies only to group nodes.
    the number of child rules that must be satisfied, where None means all of them
    """

    min_courses: int | None = None
    max_courses: int | None = None
    min_credits: float | None = None
    max_credits: float | None = None
    min_children: int | None = None

    def is_empty(self):
        return all(getattr(self, f.name) is None for f in fields(self))

    def to_json(self):
        return {
            f.name: val
            for f, val in fields(self)
            if (val := getattr(self, f.name)) is not None
        }


@dataclass
class Group:
    """satisfy `constraints.min_children` of `children` (None = all)."""

    children: list[RuleNode] = field(default_factory=list)
    constraints: Constraints = field(default_factory=Constraints)
    name: str | None = None

    def to_json(self):
        return {
            "kind": "group",
            "name": self.name,
            "constraints": self.constraints.to_json(),
            "children": [child.to_json() for child in self.children],
        }


@dataclass
class CourseSet:
    """pick courses from the `courses` pool until `constraints` are met."""

    courses: list[str] = field(default_factory=list)
    constraints: Constraints = field(default_factory=Constraints)
    name: str | None = None

    def to_json(self):
        return {
            "kind": "course_set",
            "name": self.name,
            "constraints": self.constraints.to_json(),
            "courses": self.courses,
        }


@dataclass
class TextRule:
    """a requirement that can't be checked, but can be displayed instead."""

    text: str = ""
    constraints: Constraints = field(default_factory=Constraints)
    name: str | None = None

    def to_json(self):
        return {
            "kind": "text",
            "name": self.name,
            "constraints": self.constraints.to_json(),
            "text": self.text,
        }


RuleNode = Group | CourseSet | TextRule


@dataclass
class Course:
    id: str
    dept: str
    course_num: str
    name: str
    descr: str | None = None
    cred_min: float | None = None
    cred_max: float | None = None
    active: bool = True
    libeds: list[str] = field(default_factory=list)


@dataclass
class Section:
    name: str
    level: str
    rule: RuleNode


@dataclass
class Program:
    id: str
    name: str
    career: str
    type: str
    college: str
    total_credits: float | None = None # some minors and certificates dont have total credits
    sections: list[Section] = field(default_factory=list)


def iter_course_ids(node):
    if isinstance(node, Group):
        for child in node.children:
            yield from iter_course_ids(child)
    elif isinstance(node, CourseSet):
        yield from node.courses


def remap_course_ids(node, mapping):
    if isinstance(node, Group):
        for child in node.children:
            remap_course_ids(child, mapping)
    elif isinstance(node, CourseSet):
        node.courses = [mapping.get(course_id, course_id) for course_id in node.courses]
