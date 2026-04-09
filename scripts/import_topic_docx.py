from __future__ import annotations

import argparse
import json
import math
import re
import unicodedata
import xml.etree.ElementTree as ET
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any

WORD_NAMESPACE = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
NS = {'w': WORD_NAMESPACE}

QUESTION_RE = re.compile(r'^Câu\s+(\d+)[\.:]\s*(.+)$', re.IGNORECASE)
OPTION_RE = re.compile(r'^([A-D])[\.\)]\s*(.+)$')
ANSWER_RE = re.compile(r'^Đáp án\s*[:\-]\s*([A-D])', re.IGNORECASE)
TOPIC_NUMBER_RE = re.compile(r'chuyen_de_(\d+)', re.IGNORECASE)
SECTION_NUMBER_RE = re.compile(r'^(?:[IVXLC]+|\d+(?:\.\d+)*)[\.\)]\s*', re.IGNORECASE)
COMPACT_ANSWER_RE = re.compile(r'(\d+)\.\s*([A-D])')

STOP_WORDS = {
    've',
    'va',
    'trong',
    'cua',
    'mot',
    'nhung',
    'cac',
    'cho',
    'theo',
    'doi',
    'voi',
    'nhau',
    'khi',
    'sau',
    'truoc',
    'tai',
    'tu',
    'den',
    'la',
    'duoc',
    'khong',
    'can',
    'phan',
    'muc',
    'noi',
    'dung',
    'chi',
    'tiet',
    'quy',
    'dinh',
    'mua',
    'sam',
    'thau',
    'lua',
    'chon',
    'nha',
}


@dataclass
class BodyItem:
    kind: str
    text: str
    style_name: str = 'NoStyle'
    heading_level: int | None = None
    is_list: bool = False
    rows: list[list[str]] | None = None


def normalize_key(text: str) -> str:
    normalized = unicodedata.normalize('NFD', text.lower().replace('đ', 'd'))
    no_marks = ''.join(ch for ch in normalized if unicodedata.category(ch) != 'Mn')
    return re.sub(r'[^a-z0-9\s]', ' ', no_marks).strip()


def clean_text(text: str) -> str:
    return (
        text.replace('\u00a0', ' ')
        .replace('\u200b', '')
        .replace('\ufeff', '')
        .replace('\n', ' ')
        .strip()
    )


def strip_section_numbering(text: str) -> str:
    return SECTION_NUMBER_RE.sub('', text).strip()


def strip_bullet_prefix(text: str) -> str:
    return re.sub(r'^[•\-–\+\*]+\s*', '', text).strip()


def slugify(text: str) -> str:
    return re.sub(r'\s+', '-', normalize_key(text)).strip('-')[:48] or 'section'


def split_sentences(text: str) -> list[str]:
    parts = re.split(r'(?<=[\.\!\?])\s+', text)
    return [part.strip() for part in parts if len(part.strip()) >= 24]


def get_style_name(style_id: str | None, style_map: dict[str, str]) -> str:
    if not style_id:
        return 'NoStyle'
    return style_map.get(style_id, style_id)


def get_heading_level(style_name: str) -> int | None:
    style_key = style_name.lower().replace(' ', '')
    if style_key == 'title':
        return 0
    match = re.search(r'heading(\d+)', style_key)
    if match:
        return int(match.group(1))
    match = re.search(r'myheading(\d+)', style_key)
    if match:
        return int(match.group(1))
    if style_name.lower() == 'subtitle':
        return 0
    return None


def paragraph_text(paragraph: ET.Element) -> str:
    parts: list[str] = []
    for node in paragraph.iter():
        tag = node.tag.rsplit('}', 1)[-1]
        if tag == 't':
            parts.append(node.text or '')
        elif tag == 'tab':
            parts.append('\t')
        elif tag == 'br':
            parts.append('\n')
    return clean_text(re.sub(r'\s+', ' ', ''.join(parts)))


def table_rows(table: ET.Element) -> list[list[str]]:
    rows: list[list[str]] = []
    for row in table.findall('w:tr', NS):
        values: list[str] = []
        for cell in row.findall('w:tc', NS):
            cell_texts: list[str] = []
            for node in cell.iter():
                if node.tag.rsplit('}', 1)[-1] == 't':
                    cell_texts.append(node.text or '')
            value = clean_text(re.sub(r'\s+', ' ', ''.join(cell_texts)))
            values.append(value)
        if any(values):
            rows.append(values)
    return rows


def read_docx_body_items(path: Path) -> list[BodyItem]:
    with zipfile.ZipFile(path) as archive:
        style_map: dict[str, str] = {}
        if 'word/styles.xml' in archive.namelist():
            styles_root = ET.fromstring(archive.read('word/styles.xml'))
            for style in styles_root.findall('w:style', NS):
                style_id = style.get(f'{{{WORD_NAMESPACE}}}styleId')
                style_name = style.find('w:name', NS)
                if style_id and style_name is not None:
                    style_map[style_id] = style_name.get(f'{{{WORD_NAMESPACE}}}val', style_id)

        document_root = ET.fromstring(archive.read('word/document.xml'))
        body = document_root.find('w:body', NS)
        if body is None:
            return []

        items: list[BodyItem] = []
        for child in body:
            local_name = child.tag.rsplit('}', 1)[-1]
            if local_name == 'p':
                text = paragraph_text(child)
                if not text:
                    continue

                paragraph_properties = child.find('w:pPr', NS)
                style_name = 'NoStyle'
                is_list = False
                if paragraph_properties is not None:
                    paragraph_style = paragraph_properties.find('w:pStyle', NS)
                    if paragraph_style is not None:
                        style_name = get_style_name(
                            paragraph_style.get(f'{{{WORD_NAMESPACE}}}val'),
                            style_map,
                        )
                    is_list = paragraph_properties.find('w:numPr', NS) is not None

                items.append(
                    BodyItem(
                        kind='paragraph',
                        text=text,
                        style_name=style_name,
                        heading_level=get_heading_level(style_name),
                        is_list=is_list,
                    ),
                )
            elif local_name == 'tbl':
                rows = table_rows(child)
                if not rows:
                    continue
                items.append(
                    BodyItem(
                        kind='table',
                        text=' '.join(' | '.join(row) for row in rows),
                        rows=rows,
                    ),
                )

        return items


def topic_number_from_path(path: Path) -> int:
    match = TOPIC_NUMBER_RE.search(path.name)
    if not match:
        raise ValueError(f'Cannot determine topic number from {path.name}')
    return int(match.group(1))


def is_section_marker(text: str, markers: tuple[str, ...]) -> bool:
    normalized = normalize_key(text)
    return any(marker in normalized for marker in markers)


def looks_like_heading(item: BodyItem) -> bool:
    if item.kind != 'paragraph':
        return False
    normalized = normalize_key(item.text)
    return (
        item.heading_level is not None
        or bool(SECTION_NUMBER_RE.match(item.text))
        or normalized.startswith('tinh huong ')
        or normalized.startswith('nguyen tac ')
    )


def body_lines_from_table(rows: list[list[str]]) -> list[dict[str, str]]:
    if not rows:
        return []

    if len(rows) == 1 and len(rows[0]) == 1:
        return [{'kind': 'paragraph', 'text': rows[0][0]}]

    header = rows[0]
    if len(header) >= 2 and len(rows) > 1:
        rendered: list[dict[str, str]] = []
        for row in rows[1:]:
            row = [cell for cell in row if cell]
            if not row:
                continue
            if len(row) == 1:
                rendered.append({'kind': 'bullet', 'text': row[0]})
            else:
                rendered.append({'kind': 'bullet', 'text': f'{row[0]}: {" | ".join(row[1:])}'})
        return rendered

    return [{'kind': 'bullet', 'text': ' | '.join(row)} for row in rows]


def build_markdown_content(title: str, body_lines: list[dict[str, str]]) -> str:
    if not body_lines:
        return (
            f'## Trọng tâm\n'
            f'Nội dung "{title}" được trích theo cấu trúc chuyên đề gốc. '
            'Người học nên đọc trực tiếp tài liệu nguồn và đối chiếu quy định pháp lý hiện hành.'
        )

    rendered: list[str] = ['## Trọng tâm']
    for line in body_lines:
        text = line['text'].strip()
        if not text:
            continue
        if line['kind'] == 'subheading':
            rendered.append(f'### {strip_section_numbering(text)}')
        elif line['kind'] == 'bullet':
            rendered.append(f'- {strip_bullet_prefix(text)}')
        else:
            rendered.append(text)
    return '\n\n'.join(rendered)


def build_key_points(lines: list[str], fallback_title: str) -> list[str]:
    candidates: list[str] = []
    for line in lines:
        cleaned = strip_bullet_prefix(line)
        if len(cleaned) >= 28:
            candidates.append(cleaned)
        else:
            candidates.extend(split_sentences(cleaned))

    key_points: list[str] = []
    seen: set[str] = set()
    for candidate in candidates:
        signature = normalize_key(candidate)
        if len(candidate) < 24 or signature in seen:
            continue
        seen.add(signature)
        key_points.append(candidate)
        if len(key_points) == 3:
            break

    while len(key_points) < 3:
        key_points.append(f'Tập trung ôn tập nội dung "{fallback_title}" theo tài liệu chuyên đề.')
    return key_points[:3]


def build_quick_notes(lines: list[str], key_points: list[str]) -> list[str]:
    priority_keywords = (
        'luu y',
        'ky nang',
        'goi y',
        'diem de nham',
        'meo',
        'can phan biet',
        'uu tien',
        'khong suy dien',
    )

    notes: list[str] = []
    seen: set[str] = set()
    for line in lines:
        normalized = normalize_key(line)
        if any(keyword in normalized for keyword in priority_keywords):
            cleaned = strip_bullet_prefix(line)
            signature = normalize_key(cleaned)
            if len(cleaned) >= 24 and signature not in seen:
                seen.add(signature)
                notes.append(cleaned)
        if len(notes) == 3:
            break

    if len(notes) < 3:
        for key_point in key_points:
            signature = normalize_key(key_point)
            if signature in seen:
                continue
            seen.add(signature)
            notes.append(key_point)
            if len(notes) == 3:
                break

    while len(notes) < 3:
        notes.append('Đối chiếu kỹ điều kiện áp dụng và thẩm quyền trong văn bản hiện hành.')
    return notes[:3]


def estimate_minutes(text: str) -> int:
    word_count = len(text.split())
    return max(12, min(45, int(math.ceil(word_count / 120.0) * 5)))


def collect_tags(title: str, key_points: list[str]) -> list[str]:
    tokens = re.findall(r'[a-zA-ZÀ-ỹ0-9]+', f'{title} {" ".join(key_points)}')
    tags: list[str] = []
    seen: set[str] = set()
    for token in tokens:
        key = normalize_key(token)
        if len(key) < 4 or key in STOP_WORDS or key in seen:
            continue
        seen.add(key)
        tags.append(token)
        if len(tags) == 4:
            break
    return tags


def parse_examples(items: list[BodyItem], start_index: int) -> list[str]:
    examples: list[str] = []
    current_title: str | None = None
    current_body: list[str] = []

    for item in items[start_index:]:
        if item.kind == 'paragraph' and item.heading_level is not None:
            if is_section_marker(item.text, ('cau hoi trac nghiem', 'trac nghiem', 'dap an', 'ghi nho cuoi chuyen de')):
                break
            if normalize_key(item.text).startswith('tinh huong'):
                if current_title:
                    example = current_title
                    if current_body:
                        example += ': ' + ' '.join(current_body)
                    examples.append(example)
                current_title = item.text
                current_body = []
                continue

        if current_title:
            if item.kind == 'paragraph':
                current_body.append(item.text)
            elif item.kind == 'table' and item.rows:
                current_body.extend(' | '.join(row) for row in item.rows)

    if current_title:
        example = current_title
        if current_body:
            example += ': ' + ' '.join(current_body)
        examples.append(example)

    return examples


def parse_answer_table(rows: list[list[str]]) -> tuple[dict[str, str], dict[str, str]]:
    answer_map: dict[str, str] = {}
    explanation_map: dict[str, str] = {}
    if not rows:
        return answer_map, explanation_map

    first_row = [normalize_key(cell) for cell in rows[0]]
    if len(first_row) >= 2 and first_row[0].startswith('cau') and (
        first_row[1].startswith('dap an') or first_row[1] == 'da'
    ):
        for row in rows[1:]:
            for offset in range(0, min(len(row), 4), 2):
                if offset + 1 >= len(row):
                    continue
                question_number_match = re.search(r'(\d+)', row[offset])
                answer_match = re.search(r'([A-D])', row[offset + 1])
                if question_number_match and answer_match:
                    key = question_number_match.group(1)
                    answer_map[key] = answer_match.group(1)
            if len(row) >= 3 and row[-1] and not re.fullmatch(r'[A-D]', row[-1]):
                first_number = re.search(r'(\d+)', row[0])
                if first_number:
                    explanation_map[first_number.group(1)] = row[-1]
        return answer_map, explanation_map

    for row in rows:
        paired = False
        for offset in range(0, len(row) - 1, 2):
            question_number_match = re.search(r'(\d+)', row[offset])
            answer_match = re.fullmatch(r'\s*([A-D])\s*', row[offset + 1] or '')
            if question_number_match and answer_match:
                answer_map[question_number_match.group(1)] = answer_match.group(1)
                paired = True
        if paired:
            continue
        for cell in row:
            for question_number, answer in COMPACT_ANSWER_RE.findall(cell):
                answer_map[question_number] = answer

    return answer_map, explanation_map


def parse_questions(
    items: list[BodyItem],
    start_index: int,
    topic_number: int,
    source_label: str,
) -> list[dict[str, Any]]:
    parsed_questions: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None
    current_option: str | None = None
    answer_map: dict[str, str] = {}
    explanation_map: dict[str, str] = {}
    mode = 'questions'

    def finalize_question() -> None:
        nonlocal current
        if not current:
            return
        options = current.get('options', {})
        if len(options) == 4:
            parsed_questions.append(current)
        current = None

    for item in items[start_index:]:
        if item.kind == 'paragraph' and item.heading_level is not None:
            if is_section_marker(item.text, ('ghi nho cuoi chuyen de', 'phu luc', 'van ban tham khao')):
                break
            if is_section_marker(item.text, ('dap an',)):
                finalize_question()
                mode = 'answers'
                current_option = None
                continue

        if mode == 'questions':
            if item.kind != 'paragraph':
                continue

            question_match = QUESTION_RE.match(item.text)
            option_match = OPTION_RE.match(item.text)
            answer_match = ANSWER_RE.match(item.text)

            if question_match:
                finalize_question()
                current = {
                    'number': question_match.group(1),
                    'question': question_match.group(2).strip(),
                    'options': {},
                    'correctAnswer': None,
                }
                current_option = None
                continue

            if option_match and current:
                option_id = option_match.group(1)
                current['options'][option_id] = option_match.group(2).strip()
                current_option = option_id
                continue

            if answer_match and current:
                current['correctAnswer'] = answer_match.group(1).upper()
                current_option = None
                continue

            if current:
                if current_option:
                    current['options'][current_option] = f"{current['options'][current_option]} {item.text}".strip()
                else:
                    current['question'] = f"{current['question']} {item.text}".strip()

        else:
            if item.kind == 'table' and item.rows:
                table_answers, table_explanations = parse_answer_table(item.rows)
                answer_map.update(table_answers)
                explanation_map.update(table_explanations)
            elif item.kind == 'paragraph':
                compact_matches = COMPACT_ANSWER_RE.findall(item.text)
                if compact_matches:
                    for number, answer in compact_matches:
                        answer_map[number] = answer
                else:
                    question_number_match = re.search(r'(\d+)', item.text)
                    answer_match = ANSWER_RE.search(item.text)
                    if question_number_match and answer_match:
                        answer_map[question_number_match.group(1)] = answer_match.group(1).upper()

    finalize_question()

    finalized: list[dict[str, Any]] = []
    for index, question in enumerate(parsed_questions):
        correct_answer = question['correctAnswer'] or answer_map.get(question['number'])
        if correct_answer not in question['options']:
            continue

        option_label = question['options'][correct_answer]
        explanation = explanation_map.get(question['number']) or (
            f'Đáp án đúng theo tài liệu chuyên đề là {correct_answer}. '
            f'{option_label} Cần tiếp tục đối chiếu với văn bản pháp luật hiện hành khi áp dụng thực tế.'
        )

        finalized.append(
            {
                'question': question['question'],
                'options': question['options'],
                'correctAnswer': correct_answer,
                'explanation': explanation,
                'difficulty': 'easy' if index < 7 else 'medium' if index < 14 else 'hard',
                'tags': [f'CD{topic_number}'],
                'source': source_label,
            },
        )

    return finalized


def parse_document(path: Path) -> dict[str, Any]:
    items = read_docx_body_items(path)
    topic_number = topic_number_from_path(path)
    source_label = f'Tài liệu {path.name} do người dùng cung cấp'

    title_candidates = [item.text for item in items[:8] if item.kind == 'paragraph' and len(item.text) > 8]
    doc_title = ''
    for candidate in title_candidates:
        normalized = normalize_key(candidate)
        if 'chuyen de' in normalized:
            continue
        if 'tai lieu' in normalized or 'bien soan' in normalized or 'bo bai giang' in normalized:
            continue
        doc_title = candidate
        break
    if not doc_title and title_candidates:
        doc_title = title_candidates[0]

    learning_objectives: list[str] = []
    legal_references: list[str] = []
    lessons: list[dict[str, Any]] = []
    lesson_title: str | None = None
    lesson_lines: list[dict[str, str]] = []
    examples: list[str] = []
    questions: list[dict[str, Any]] = []
    section = 'intro'

    def finalize_lesson() -> None:
        nonlocal lesson_title, lesson_lines
        if not lesson_title:
            return

        content = build_markdown_content(lesson_title, lesson_lines)
        flattened_lines = [line['text'] for line in lesson_lines]
        key_points = build_key_points(flattened_lines, lesson_title)
        quick_notes = build_quick_notes(flattened_lines, key_points)
        lessons.append(
            {
                'title': strip_section_numbering(lesson_title),
                'content': content,
                'keyPoints': key_points,
                'quickNotes': quick_notes,
                'estimatedStudyTime': estimate_minutes(content),
                'tags': collect_tags(lesson_title, key_points),
            },
        )
        lesson_title = None
        lesson_lines = []

    for index, item in enumerate(items):
        if item.kind == 'paragraph' and item.heading_level is not None:
            if is_section_marker(item.text, ('muc tieu hoc tap',)):
                finalize_lesson()
                section = 'objectives'
                continue
            if is_section_marker(item.text, ('can cu phap ly', 'co so phap ly')):
                finalize_lesson()
                section = 'legal'
                continue
            if is_section_marker(item.text, ('bang so sanh', 'so do tom tat quy trinh', 'tom tat ghi nho nhanh')):
                finalize_lesson()
                section = 'comparison'
                continue
            if is_section_marker(item.text, ('vi du tinh huong', 'vi du')):
                finalize_lesson()
                section = 'examples'
                examples = parse_examples(items, index + 1)
                continue
            if is_section_marker(item.text, ('cau hoi trac nghiem', 'trac nghiem', 'bo 20 cau')):
                finalize_lesson()
                section = 'questions'
                questions = parse_questions(items, index + 1, topic_number, source_label)
                break
            if is_section_marker(item.text, ('noi dung chi tiet',)):
                finalize_lesson()
                section = 'detail'
                continue

            if section in {'objectives', 'legal'}:
                section = 'detail'

        if section == 'objectives':
            if item.kind == 'paragraph' and item.heading_level is not None:
                continue
            if item.kind == 'paragraph':
                cleaned = strip_bullet_prefix(item.text)
                if len(cleaned) >= 20:
                    learning_objectives.append(cleaned)
            continue

        if section == 'legal':
            if item.kind == 'paragraph' and item.heading_level is not None:
                continue
            if item.kind == 'paragraph':
                cleaned = strip_bullet_prefix(item.text)
                if len(cleaned) >= 20:
                    legal_references.append(cleaned)
            elif item.kind == 'table' and item.rows:
                for row in item.rows[1:] if len(item.rows) > 1 else item.rows:
                    if row:
                        legal_references.append(' | '.join(cell for cell in row if cell))
            continue

        if section in {'intro', 'detail', 'comparison'}:
            if item.kind == 'paragraph' and looks_like_heading(item):
                normalized = normalize_key(item.text)
                if normalized.startswith('tinh huong ') or 'cau hoi trac nghiem' in normalized:
                    continue
                if is_section_marker(item.text, ('muc tieu hoc tap', 'can cu phap ly', 'co so phap ly', 'bang so sanh')):
                    continue
                section = 'detail'
                finalize_lesson()
                lesson_title = item.text
                lesson_lines = []
                continue

            if lesson_title:
                if item.kind == 'paragraph':
                    lesson_lines.append(
                        {
                            'kind': 'bullet' if item.is_list or item.text.startswith(('•', '-', '–')) else 'paragraph',
                            'text': item.text,
                        },
                    )
                elif item.kind == 'table' and item.rows:
                    lesson_lines.extend(body_lines_from_table(item.rows))

    finalize_lesson()

    summary_source = learning_objectives[:2] or [lesson['title'] for lesson in lessons[:2]]
    summary = ' '.join(summary_source).strip()
    flash_summary = (
        [objective.rstrip('.') for objective in learning_objectives[:3]]
        if learning_objectives
        else [lesson['title'] for lesson in lessons[:3]]
    )

    for lesson_index, lesson in enumerate(lessons):
        if examples:
            lesson['example'] = examples[min(lesson_index, len(examples) - 1)]
        lesson['references'] = [*legal_references[:3], f'Nguồn: {path.name}']

    return {
        'topicNumber': topic_number,
        'sourceFile': path.name,
        'docTitle': doc_title,
        'learningObjectives': learning_objectives,
        'legalReferences': legal_references,
        'summary': summary,
        'flashSummary': flash_summary,
        'lessons': lessons,
        'questions': questions,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description='Import topic DOCX files into JSON seed data.')
    parser.add_argument('--input-dir', required=True, help='Directory containing topic DOCX files.')
    parser.add_argument(
        '--output',
        default='src/mock/imported/tenderTrainingData.json',
        help='Output JSON file path.',
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    input_dir = Path(args.input_dir)
    output_path = Path(args.output)

    docx_paths = sorted(input_dir.glob('chuyen_de_*.docx'), key=topic_number_from_path)
    if not docx_paths:
        raise SystemExit(f'No topic DOCX files found in {input_dir}')

    parsed_topics = [parse_document(path) for path in docx_paths]
    payload = {
        'generatedFrom': str(input_dir),
        'topicCount': len(parsed_topics),
        'topics': parsed_topics,
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')

    for topic in parsed_topics:
        print(
            f"Imported topic {topic['topicNumber']}: "
            f"{len(topic['lessons'])} lessons, {len(topic['questions'])} questions"
        )
    print(f'Wrote {output_path}')


if __name__ == '__main__':
    main()
