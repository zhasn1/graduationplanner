import re
from mappings import college_mapping, level_mapping, program_type_mapping, libed_mapping
from models import Constraints, Group, CourseSet, TextRule, Course, Section, Program


def strip_html(text):
    return re.sub(r"<[^>]+>", " ", text).replace("&nbsp;", " ").strip()


def parse_branches(rule):
    """pull course branches from a rule's 'value' field, each branch is (logic, ids)"""
    branches = []
    value = rule.get("value")
    if isinstance(value, dict) and value.get("condition") == "courses":
        for val in value.get("values", []):
            ids = [cid for cid in val.get("value", []) if cid]
            if ids:
                branches.append((val.get("logic"), ids))
    return branches


def branch_to_course_set(logic, ids):
    """convert a branch to a CourseSet. `or` means pick one, anything else means pick all"""
    min_courses = 1 if logic == "or" else len(ids)
    return CourseSet(courses=ids, constraints=Constraints(min_courses=min_courses))


def courses_rule(condition, branches, name, constraints):
    if len(branches) > 1 and any(len(ids) > 1 for _, ids in branches):
        children = [branch_to_course_set(logic, ids) for logic, ids in branches]
        if condition == "completedAtLeastXOf":
            constraints.min_children = constraints.min_courses or 1
            constraints.min_courses = None
        elif condition != "completedAllOf":
            constraints.min_children = 1
        return Group(children=children, constraints=constraints, name=name)

    if len(branches) == 1:
        logic, pool = branches[0]
        default_min = 1 if logic == "or" else len(pool)
    else:
        pool = [ids[0] for _, ids in branches]
        default_min = len(pool) if condition == "completedAllOf" else 1

    if constraints.min_courses is None:
        if condition in ("completedAllOf", "completedAnyOf") or constraints.is_empty():
            constraints.min_courses = default_min
    return CourseSet(courses=pool, constraints=constraints, name=name)


def text_rule(rule):
    value = rule.get("value")
    text = strip_html(value) if isinstance(value, str) else ""
    if not text:
        text = strip_html(rule.get("description") or "")
    if not text:
        text = strip_html(rule.get("notes") or "")
    return " ".join(text.split())


def parse_constraints(rule):
    """read a rule's quantity bounds into a Constraints object. Coursedog spreads these over multiple fields depending on the condition"""
    condition = rule.get("condition")
    min_courses = rule.get("minCourses")
    if min_courses is None and condition in (
        "completedAtLeastXOf",
        "completeVariableCoursesAndVariableCredits",
    ):
        min_courses = rule.get("restriction")
    min_credits = rule.get("minCredits")
    if min_credits is None:
        min_credits = rule.get("credits")
    max_courses = rule.get("maxCourses")
    max_credits = rule.get("maxCredits")
    return Constraints(
        min_courses=int(min_courses) if min_courses is not None else None,
        max_courses=int(max_courses) if max_courses is not None else None,
        min_credits=float(min_credits) if min_credits is not None else None,
        max_credits=float(max_credits) if max_credits is not None else None,
    )


GROUP_CONDITIONS = ("allOf", "anyOf", "numberOf")
LEAF_CONDITIONS = (
    "minimumCredits",
    "completedAnyOf",
    "completedAtLeastXOf",
    "completedAllOf",
    "completeVariableCoursesAndVariableCredits",
    "enrolledIn",
    "freeformText",
)


def normalize_rule(rule):
    """convert one coursedog rule into a RuleNode or None if it's not a valid rule.
    Group conditions recurse into SubRules. Course conditions go through courses_rule.
    Anything left with prose or constraints becomes a display-only TextRule"""

    condition = rule.get("condition")
    name = rule.get("name") or None
    constraints = parse_constraints(rule)

    if condition in GROUP_CONDITIONS:
        children = [
            child
            for child in (normalize_rule(sub) for sub in (rule.get("subRules") or []))
            if child is not None
        ]
        if not children:
            return None
        if condition == "anyOf":
            constraints.min_children = 1
        elif condition == "numberOf":
            num = rule.get("number")
            constraints.min_children = int(num) if num is not None else 1
        return Group(children=children, constraints=constraints, name=name)

    if condition in LEAF_CONDITIONS:
        branches = parse_branches(rule)
        if branches:
            return courses_rule(condition, branches, name, constraints)
        # no courses, keep the rule as a TextRule if it says anything (e.g. "3 credits of CSCI 3XXX/4XXX electives")
        text = text_rule(rule)
        if text or not constraints.is_empty():
            return TextRule(text=text, constraints=constraints, name=name)
        return None
    return None


def has_constraints(node):
    """true if the node has any course/credit bounds (excluding min_children)"""
    c = node.constraints
    return any(
        v is not None
        for v in (c.min_courses, c.max_courses, c.min_credits, c.max_credits)
    )


def simplify_rule(node):
    """clean up artifacts of coursedog's nesting. Splice children of
    unnamed constraint-free "all of" wrappers into their parent, and replace
    single-child groups that add nothing with the child itself"""
    if not isinstance(node, Group):
        return node
    node.children = [simplify_rule(child) for child in node.children]
    if node.constraints.min_children is None:
        splice = []
        for child in node.children:
            if (
                isinstance(child, Group)
                and not child.name
                and child.constraints.is_empty()
            ):
                splice.extend(child.children)
            else:
                splice.append(child)
        node.children = splice

    if len(node.children) == 1 and not has_constraints(node):
        child = node.children[0]
        min_children = node.constraints.min_children
        collapsible = min_children is None or min_children <= 1
        if collapsible and (not node.name or not child.name or node.name == child.name):
            if not child.name:
                child.name = node.name
            return child
    return node


def normalize_program(prog):
    """convert a coursedog program into a Program object with normalized rules.
    returns None for programs that are not active, have no college, career, or unmapped type"""
    program_id = prog.get("programGroupId")
    if not program_id:
        return None
    custom_fields = prog.get("customFields", {})
    if custom_fields.get("cdProgramStatus") != "Active":
        return None
    program_type = program_type_mapping.get(custom_fields.get("cdProgramTypeManual"))
    if program_type is None:
        return None
    career = custom_fields.get("cdProgramCareer") or prog.get("career")
    college = college_mapping.get(custom_fields.get("cdDegreeGrantingCollege"))
    credits_min = custom_fields.get("cdProgramCreditsDegreeMin")
    if not career or not college:
        return None
    program = Program(
        id=program_id,
        name=prog.get("catalogDisplayName") or prog.get("name") or "",
        career=career,
        type=program_type,
        college=college,
        total_credits=float(credits_min) if credits_min else None,
    )

    for group in (prog.get("requisites") or {}).get("requisitesSimple", []):
        if not group.get("showInCatalog"):
            continue
        level = level_mapping.get(group.get("requirementLevel"))
        if level is None:
            continue
        children = [
            node
            for node in (normalize_rule(rule) for rule in group.get("rules", []))
            if node is not None
        ]
        if not children:
            continue
        section_name = group.get("name") or ""
        if len(children) == 1:
            root = children[0]
        else:
            root = Group(children=children)

        if root.name == section_name:
            root.name = None
        root = simplify_rule(root)
        if root.name == section_name:
            root.name = None
        program.sections.append(
            Section(name=group.get("name", ""), level=level, rule=root)
        )
    return program


def normalize_programs(progs):
    """convert a list of coursedog programs into a list of normalized Program objects"""
    programs = []
    for prog in progs.values():
        program = normalize_program(prog)
        if program is not None:
            programs.append(program)
    print(f"kept {len(programs)} of {len(progs)} programs")
    return programs


def backfill_course(course):
    group_id = course.get("courseGroupId")
    dept = course.get("subjectCode")
    course_num = course.get("courseNumber")
    if not group_id or not dept or not course_num:
        return None
    credits = (course.get("credits") or {}).get("creditHours") or {}
    cred_min = credits.get("min")
    cred_max = credits.get("max")

    libeds = []
    for attr in course.get("attributes") or []:
        name = libed_mapping.get(attr)
        if name and name not in libeds:
            libeds.append(name)

    return Course(
        id=group_id,
        dept=dept,
        course_num=course_num,
        name=course.get("longName") or course.get("name") or "",
        descr=course.get("description") or None,
        cred_min=float(cred_min) if cred_min is not None else None,
        cred_max=float(cred_max) if cred_max is not None else None,
        active=course.get("status") == "active",
        libeds=libeds,
    )
