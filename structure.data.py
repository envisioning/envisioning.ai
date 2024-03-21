import json
import re

def parse_chapter(line):
    match = re.match(r'^(\d+)\.\s+(.+)', line)
    if match:
        chapter_number, chapter_name = match.groups()
        return int(chapter_number), chapter_name
    else:
        return None, None

def parse_concept(line, chapter_number):
    return {'name': line.strip(), 'title': line.strip(), 'description': None, 'chapter': chapter_number}

def process_file(input_filepath, output_filepath):
    with open(input_filepath, 'r') as infile:
        lines = infile.readlines()

    concepts = []
    current_concept = None
    current_chapter_number = None

    for line in lines:
        line = line.strip()
        if line:
            if current_concept is not None:
                current_concept['description'] = line
                concepts.append(current_concept)
                current_concept = None
            else:
                chapter_number, chapter_name = parse_chapter(line)
                if chapter_number is not None:
                    current_chapter_number = chapter_number
                else:
                    current_concept = parse_concept(line, current_chapter_number)

    with open(output_filepath, 'w') as outfile:
        json.dump(concepts, outfile, indent=4)

input_filepath = 'data.plaintext.txt'
output_filepath = 'data.structured.json'

process_file(input_filepath, output_filepath)