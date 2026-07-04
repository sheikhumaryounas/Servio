from pathlib import Path
path = Path('frontend/src/App.jsx')
text = path.read_text(encoding='utf-8')
text = text.replace('`\${API_URL}', '`${API_URL}')
path.write_text(text, encoding='utf-8')
print('Repaired escaped API_URL strings in App.jsx')
