import urllib.request
import json

queries = [
    ('Flow A', 'Who can terminate this agreement?'),
    ('Flow B', 'What notice period applies if monthly uptime is chronically below the SLA threshold?'),
    ('Flow C', 'What insurance must the vendor carry?')
]

for label, q in queries:
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/ask',
        data=json.dumps({'query': q, 'selected_jurisdiction': 'United States', 'top_k': 4}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode('utf-8'))
    print(f'=== {label}: "{q}" ===')
    print('evidence_state:', data.get('evidence_state'))
    print('is_abstention:', data.get('is_abstention'))
    print('abstention_reason:', data.get('abstention_reason'))
    print('answer_text:', (data.get('answer_text') or '')[:180], '...')
    print('citations count:', len(data.get('citations', [])))
    for cit in data.get('citations', [])[:2]:
        snippet = cit.get('quote_snippet') or cit.get('claim', '')
        print('  cit:', cit.get('chunk_id'), '->', snippet[:80])
    print('evidence count:', len(data.get('evidence', [])))
    print('relationships count:', len(data.get('relationships', [])))
    for rel in data.get('relationships', [])[:2]:
        print('  rel:', rel.get('source_chunk_id'), rel.get('relation'), rel.get('target_chunk_id'), rel.get('referenced_section'))
    print()
