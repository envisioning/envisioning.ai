import json
import re

def parse_line(line):
    chapter_match = re.match(r'^(\d+)\.\s+(.*)', line)
    topic_match = re.match(r'^(\d+\.\d+)\s+(.*)', line)
    if chapter_match:
        return 'chapter', chapter_match.groups()
    elif topic_match:
        return 'topic', topic_match.groups()
    else:
        return 'concept', line.strip()

def process_file(input_filepath, output_filepath):
    with open(input_filepath, 'r') as infile:
        lines = infile.readlines()
    
    structure = {"name": "Welcome", "title": "Welcome Text", "description": "provided in the json", "level": 1, "children": []}
    current_chapter = None
    current_topic = None
    chapter_number = 0
    
    for i in range(0, len(lines), 3):
        line_type, content = parse_line(lines[i])
        description = lines[i+1].strip()
        
        if line_type == 'chapter':
            chapter_number += 1
            if current_chapter is not None:
                if current_topic is not None:
                    current_chapter['children'].append(current_topic)
                structure['children'].append(current_chapter)
            current_chapter = {"name": content[1], "title": content[1], "description": description, "level": 2, "chapter": chapter_number, "children": []}
            current_topic = None
        elif line_type == 'topic':
            if current_topic is not None:
                current_chapter['children'].append(current_topic)
            current_topic = {"name": content[1], "title": content[1], "description": description, "level": 3, "chapter": chapter_number, "children": []}
        elif line_type == 'concept':
            if current_topic:
                current_topic['children'].append({"name": content, "title": content, "description": description, "level": 4, "chapter": chapter_number})
    
    # Append the last topic and chapter
    if current_topic is not None:
        current_chapter['children'].append(current_topic)
    if current_chapter is not None:
        structure['children'].append(current_chapter)
    
    # Write the JSON output
    with open(output_filepath, 'w') as outfile:
        json.dump(structure, outfile, indent=4)

input_filepath = 'data.plaintext.txt'
output_filepath = 'data.structured.json'

process_file(input_filepath, output_filepath)
