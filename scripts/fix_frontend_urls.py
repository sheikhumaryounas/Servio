from pathlib import Path
import re

path = Path('frontend/src/App.jsx')
text = path.read_text(encoding='utf-8')

insert_marker = "import { AuthProvider, useAuth } from './context/AuthContext';\n"
if 'const API_BASE = import.meta.env.VITE_API_URL' not in text:
    text = text.replace(
        insert_marker,
        insert_marker + "const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';\nconst API_URL = `${API_BASE}/api`;\n\n"
    )

text = text.replace('http://localhost:5000/api/', '${API_URL}/')
text = text.replace('http://localhost:5000/api', '${API_URL}')

path.write_text(text, encoding='utf-8')
print('Updated frontend/src/App.jsx with API_URL replacements')
