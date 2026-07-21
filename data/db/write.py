import os
from db import schema
from models import iter_course_ids
from sqlalchemy.orm import sessionmaker


def write(session, courses, programs):
    libed_rows = {
        name: schema.LibEd(name=name) for course in courses for name in course.libeds
    }
    session.add_all(libed_rows.values())
    print(f"libeds written: {len(libed_rows)}")

    for course in courses:
        row = schema.Course(
            id=course.id,
            dept=course.dept,
            course_num=course.course_num,
            name=course.name,
            descr=course.descr,
            cred_min=course.cred_min,
            cred_max=course.cred_max,
            active=course.active,
        )
        row.libeds = [libed_rows[name] for name in course.libeds]
        session.add(row)
    print(f"courses written: {len(courses)}")

    known_ids = {course.id for course in courses}
    index_rows = []
    for program in programs:
        session.add(
            schema.Program(
                id=program.id,
                name=program.name,
                college=program.college,
                career=program.career,
                type=program.type,
                total_credits=program.total_credits,
            )
        )
        for section in program.sections:
            row = schema.RequirementSection(
                program_id=program.id,
                name=section.name,
                level=section.level,
                rule=section.rule.to_json(),
            )
            session.add(row)
            session.flush()
            referenced_ids = sorted(set(iter_course_ids(section.rule)) & known_ids)
            index_rows.extend(
                {"section_id": row.id, "course_id": course_id}
                for course_id in referenced_ids
            )
    print(f"programs written: {len(programs)}")
    if index_rows:
        session.execute(schema.requirement_courses.insert(), index_rows)


def build_db(db_path, courses, programs):
    tmp_db = f"{db_path}.tmp"
    if os.path.exists(tmp_db):
        os.remove(tmp_db)
    engine = schema.make_engine(tmp_db)
    schema.Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    try:
        with Session() as session:
            write(session, courses, programs)
            session.commit()
    except Exception as e:
        print(f"error writing to db: {e}")
        session.rollback()
        raise
    finally:
        session.close()
        engine.dispose()
    os.replace(tmp_db, db_path)
