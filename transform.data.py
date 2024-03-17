import json

def transform_to_diagram_format(data, parent_id=None):
    nodes = []
    links = []
    for item in data:
        # Include the 'level' attribute in the node dictionary
        node = {
            'id': item['name'],
            'title': item['title'],
            'description': item['description'],
            'parent_id': parent_id,
            'level': item.get('level', None),  # Use .get() to avoid KeyError if 'level' is missing
            'chapter': item.get('chapter', None)  
        }
        nodes.append(node)
        if parent_id is not None:
            links.append({'source': parent_id, 'target': item['name']})
        if 'children' in item:
            child_nodes, child_links = transform_to_diagram_format(item['children'], item['name'])
            nodes += child_nodes
            links += child_links
    return nodes, links

with open('data.json', 'r') as infile:
    data = json.load(infile)

# Then, when calling this function and saving the data:
nodes, links = transform_to_diagram_format(data['children'], data['name'])
root_node = {
    'id': data['name'],
    'title': data['title'],
    'description': data['description'],
    'parent_id': None,
    'level': data.get('level', None),  # Also include 'level' for the root node
    'chapter': data.get('chapter', None)  # Also include 'level' for the root node

}
transformed_data = {'nodes': [root_node] + nodes, 'links': links}

with open('transformed.data.json', 'w') as outfile:
    json.dump(transformed_data, outfile, indent=4)