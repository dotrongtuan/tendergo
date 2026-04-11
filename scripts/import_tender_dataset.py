from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from import_mock_exam_docx import parse_exam_file
from import_topic_docx import parse_document, topic_number_from_path


def build_report_payload(input_dir: Path, topics: list[dict], exams: list[dict]) -> dict:
    topic_rows = [
        {
            'topicNumber': topic['topicNumber'],
            'sourceFile': topic['sourceFile'],
            'documentTitle': topic['docTitle'],
            'lessonCount': len(topic['lessons']),
            'questionCount': len(topic['questions']),
            'learningObjectiveCount': len(topic['learningObjectives']),
            'legalReferenceCount': len(topic['legalReferences']),
            'flashSummaryCount': len(topic['flashSummary']),
        }
        for topic in topics
    ]

    exam_rows = [
        {
            'id': exam['id'],
            'sourceFile': exam['sourceFile'],
            'title': exam['title'],
            'durationMinutes': exam['durationMinutes'],
            'questionCount': len(exam['questions']),
        }
        for exam in exams
    ]

    topic_lessons = sum(row['lessonCount'] for row in topic_rows)
    topic_questions = sum(row['questionCount'] for row in topic_rows)
    exam_questions = sum(row['questionCount'] for row in exam_rows)

    return {
        'generatedAt': datetime.now(timezone.utc).isoformat(),
        'sourceDirectory': str(input_dir),
        'topicCount': len(topic_rows),
        'examCount': len(exam_rows),
        'totals': {
            'lessons': topic_lessons,
            'topicQuestions': topic_questions,
            'examQuestions': exam_questions,
            'totalQuestions': topic_questions + exam_questions,
            'legalReferences': sum(row['legalReferenceCount'] for row in topic_rows),
        },
        'topics': topic_rows,
        'exams': exam_rows,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description='Import all tender training DOCX files into JSON seed data and a coverage report.'
    )
    parser.add_argument('--input-dir', required=True, help='Directory containing topic and exam DOCX files.')
    parser.add_argument(
        '--topics-output',
        default='src/mock/imported/tenderTrainingData.json',
        help='Output JSON path for topic data.',
    )
    parser.add_argument(
        '--exams-output',
        default='src/mock/imported/tenderExamSets.json',
        help='Output JSON path for general exam data.',
    )
    parser.add_argument(
        '--report-output',
        default='src/mock/imported/tenderImportReport.json',
        help='Output JSON path for the import coverage report.',
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    input_dir = Path(args.input_dir)
    topics_output = Path(args.topics_output)
    exams_output = Path(args.exams_output)
    report_output = Path(args.report_output)

    topic_docx_paths = sorted(input_dir.glob('chuyen_de_*.docx'), key=topic_number_from_path)
    if not topic_docx_paths:
        raise SystemExit(f'No topic DOCX files found in {input_dir}')

    exam_candidates = [
        'bai_thi_thu_trac_nghiem_kien_thuc_chung_dau_thau.docx',
        'Bài kiểm tra trắc nghiệm chứng chỉ đấu thầu tổng quát.docx',
    ]
    exam_docx_paths = [input_dir / name for name in exam_candidates if (input_dir / name).exists()]
    if not exam_docx_paths:
        raise SystemExit(f'No general exam DOCX files found in {input_dir}')

    parsed_topics = [parse_document(path) for path in topic_docx_paths]
    parsed_exams = [parse_exam_file(path, index) for index, path in enumerate(exam_docx_paths)]

    topics_payload = {
        'generatedFrom': str(input_dir),
        'topicCount': len(parsed_topics),
        'topics': parsed_topics,
    }
    exams_payload = {
        'generatedFrom': str(input_dir),
        'examCount': len(parsed_exams),
        'exams': parsed_exams,
    }
    report_payload = build_report_payload(input_dir, parsed_topics, parsed_exams)

    topics_output.parent.mkdir(parents=True, exist_ok=True)
    topics_output.write_text(json.dumps(topics_payload, ensure_ascii=False, indent=2), encoding='utf-8')
    exams_output.parent.mkdir(parents=True, exist_ok=True)
    exams_output.write_text(json.dumps(exams_payload, ensure_ascii=False, indent=2), encoding='utf-8')
    report_output.parent.mkdir(parents=True, exist_ok=True)
    report_output.write_text(json.dumps(report_payload, ensure_ascii=False, indent=2), encoding='utf-8')

    print(
        'Imported dataset: '
        f"{report_payload['topicCount']} topics, "
        f"{report_payload['totals']['lessons']} lessons, "
        f"{report_payload['totals']['totalQuestions']} questions."
    )
    print(f'Wrote {topics_output}')
    print(f'Wrote {exams_output}')
    print(f'Wrote {report_output}')


if __name__ == '__main__':
    main()
