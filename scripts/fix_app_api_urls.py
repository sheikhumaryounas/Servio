from pathlib import Path
import re

path = Path('frontend/src/App.jsx')
text = path.read_text(encoding='utf-8')
# Replace single-quoted or double-quoted template placeholders with actual template literals
text = re.sub(r"'\$\{API_URL\}(/[^']*)'", r'`\${API_URL}\1`', text)
text = re.sub(r'"\$\{API_URL\}([^\"]*)"', r'`\${API_URL}\1`', text)
# Also fix any direct non-interpolated ${API_URL} inside single/double quotes
text = text.replace("'${API_URL}'", '`\${API_URL}`')
text = text.replace('"${API_URL}"', '`\${API_URL}`')
path.write_text(text, encoding='utf-8')
print('Fixed App.jsx API URL template strings')
