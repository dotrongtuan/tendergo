from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

from import_topic_docx import (
    OPTION_RE,
    QUESTION_RE,
    normalize_key,
    parse_answer_table,
    read_docx_body_items,
)

INLINE_OPTIONS_RE = re.compile(
    r'^(?P<question>.+?)\s+A\.\s+(?P<A>.+?)\s+B\.\s+(?P<B>.+?)\s+C\.\s+(?P<C>.+?)\s+D\.\s+(?P<D>.+)$',
    re.IGNORECASE | re.DOTALL,
)
ANSWER_LETTER_RE = re.compile(r'^[A-D]$', re.IGNORECASE)
RANGE_MINUTES_RE = re.compile(r'(\d+)\s*[–-]\s*(\d+)\s*phút', re.IGNORECASE)
SINGLE_MINUTE_RE = re.compile(r'(\d+)\s*phút', re.IGNORECASE)


def clean_text(text: str) -> str:
    return re.sub(r'\s+', ' ', text).strip()


def difficulty_for(index: int, total: int) -> str:
    if index < max(6, total // 3):
        return 'easy'
    if index < max(12, (total * 2) // 3):
        return 'medium'
    return 'hard'


def build_title(items: list[Any], fallback: str) -> str:
    heading_candidates = [
        clean_text(item.text)
        for item in items[:12]
        if item.kind == 'paragraph'
        and len(clean_text(item.text)) <= 120
        and (
            'bai thi thu' in normalize_key(item.text)
            or 'kien thuc chung' in normalize_key(item.text)
            or 'trac nghiem' in normalize_key(item.text)
        )
    ]
    if heading_candidates:
        return ' '.join(heading_candidates[:2])
    return fallback


def build_description(items: list[Any], source_file: str) -> str:
    for item in items[:12]:
        if item.kind != 'paragraph':
            continue
        text = clean_text(item.text)
        normalized = normalize_key(text)
        if len(text) < 50:
            continue
        if QUESTION_RE.match(text):
            continue
        if 'cau hoi' in normalized or 'dap an' in normalized or 'thang tu cham' in normalized:
            continue
        return text
    return f'Bộ đề được nhập từ file {source_file} để mô phỏng đề thi sát tài liệu nguồn.'


def extract_duration_minutes(items: list[Any]) -> int:
    for item in items[:10]:
        text = clean_text(item.text)
        range_match = RANGE_MINUTES_RE.search(text)
        if range_match:
            return int(range_match.group(2))
        single_match = SINGLE_MINUTE_RE.search(text)
        if single_match:
            return int(single_match.group(1))
    return 30


def parse_exam_questions(items: list[Any], source_file: str) -> tuple[list[dict[str, Any]], list[str]]:
    raw_questions: list[dict[str, Any]] = []
    answer_map: dict[str, str] = {}
    sequential_answers: list[str] = []
    scoring_guide: list[str] = []
    current: dict[str, Any] | None = None
    current_option: str | None = None
    in_question_section = False
    in_answer_section = False
    in_scoring_section = False

    def finalize_current() -> None:
        nonlocal current, current_option
        if current and len(current.get('options', {})) == 4:
            raw_questions.append(current)
        current = None
        current_option = None

    for item in items:
        text = clean_text(item.text)
        normalized = normalize_key(text)

        if 'phan' in normalized and 'cau hoi' in normalized:
            finalize_current()
            in_question_section = True
            in_answer_section = False
            in_scoring_section = False
            continue

        if normalized == 'dap an' or ('phan' in normalized and 'dap an' in normalized):
            finalize_current()
            in_question_section = False
            in_answer_section = True
            in_scoring_section = False
            continue

        if 'thang tu cham' in normalized:
            finalize_current()
            in_question_section = False
            in_answer_section = False
            in_scoring_section = True
            continue

        if in_scoring_section and item.kind == 'paragraph' and len(text) >= 10:
            scoring_guide.append(text)
            continue

        if in_answer_section:
            if item.kind == 'table' and item.rows:
                table_answers, _ = parse_answer_table(item.rows)
                answer_map.update(table_answers)
                continue

            if item.kind == 'paragraph' and ANSWER_LETTER_RE.fullmatch(text):
                sequential_answers.append(text.upper())
            continue

        if not in_question_section or item.kind != 'paragraph':
            continue

        question_match = QUESTION_RE.match(text)
        option_match = OPTION_RE.match(text)

        if question_match:
            finalize_current()
            question_number = question_match.group(1)
            question_body = clean_text(question_match.group(2))
            inline_match = INLINE_OPTIONS_RE.match(question_body)

            if inline_match:
                raw_questions.append(
                    {
                        'number': question_number,
                        'question': clean_text(inline_match.group('question')),
                        'options': {
                            option_id: clean_text(inline_match.group(option_id))
                            for option_id in ('A', 'B', 'C', 'D')
                        },
                    }
                )
                continue

            current = {
                'number': question_number,
                'question': question_body,
                'options': {},
            }
            current_option = None
            continue

        if option_match and current:
            current_option = option_match.group(1).upper()
            current['options'][current_option] = clean_text(option_match.group(2))
            continue

        if current:
            if current_option:
                current['options'][current_option] = clean_text(f"{current['options'][current_option]} {text}")
            else:
                current['question'] = clean_text(f"{current['question']} {text}")

    finalize_current()

    if sequential_answers and not answer_map:
        answer_map.update({str(index): answer for index, answer in enumerate(sequential_answers, start=1)})

    questions: list[dict[str, Any]] = []
    for index, question in enumerate(raw_questions):
        correct_answer = answer_map.get(question['number'])
        if correct_answer not in question['options']:
            continue

        option_label = question['options'][correct_answer]
        questions.append(
            {
                'number': int(question['number']),
                'question': question['question'],
                'options': question['options'],
                'correctAnswer': correct_answer,
                'explanation': (
                    f'Đáp án đúng theo đề nguồn {source_file} là {correct_answer}. '
                    f'{option_label} Cần tiếp tục đối chiếu văn bản hiện hành khi sử dụng chính thức.'
                ),
                'difficulty': difficulty_for(index, len(raw_questions)),
                'source': f'Tài liệu đề thi {source_file} do người dùng cung cấp',
            }
        )

    return questions, scoring_guide


def parse_exam_file(path: Path, index: int) -> dict[str, Any]:
    items = read_docx_body_items(path)
    questions, scoring_guide = parse_exam_questions(items, path.name)

    return {
        'id': f'general-source-{index + 1:02d}',
        'sourceFile': path.name,
        'title': build_title(items, f'Đề thi tổng quát {index + 1}'),
        'description': build_description(items, path.name),
        'durationMinutes': extract_duration_minutes(items),
        'scoringGuide': scoring_guide,
        'questions': questions,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description='Import general exam DOCX files into JSON seed data.')
    parser.add_argument('--input-dir', required=True, help='Directory containing general exam DOCX files.')
    parser.add_argument(
        '--output',
        default='src/mock/imported/tenderExamSets.json',
        help='Output JSON file path.',
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    input_dir = Path(args.input_dir)
    output_path = Path(args.output)

    candidate_names = [
        'bai_thi_thu_trac_nghiem_kien_thuc_chung_dau_thau.docx',
        'Bài kiểm tra trắc nghiệm chứng chỉ đấu thầu tổng quát.docx',
    ]
    docx_paths = [input_dir / name for name in candidate_names if (input_dir / name).exists()]
    if not docx_paths:
        raise SystemExit(f'No general exam DOCX files found in {input_dir}')

    parsed_exams = [parse_exam_file(path, index) for index, path in enumerate(docx_paths)]
    payload = {
        'generatedFrom': str(input_dir),
        'examCount': len(parsed_exams),
        'exams': parsed_exams,
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')

    for exam in parsed_exams:
        message = (
            f"Imported exam {exam['id']}: "
            f"{len(exam['questions'])} questions from {exam['sourceFile']}"
        )
        print(message.encode('ascii', 'backslashreplace').decode('ascii'))
    print(f'Wrote {output_path}')


if __name__ == '__main__':
    main()
