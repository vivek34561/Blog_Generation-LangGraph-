# AI Blog Generator

Beautiful HTML/CSS/JS frontend powered by FastAPI + LangGraph + Groq.

## Quick Start

- Install dependencies:

```bash
pip install -r requirements.txt
```

- (Optional) Configure environment variables in a `.env` file:

```
LANGCHAIN_API_KEY=your_langsmith_key
GROQ_API_KEY=your_groq_api_key
```

- Run the server:

```bash
python app.py
```

- Open the app in your browser:

```
http://localhost:8000/
```

## Frontend

- Location: `static/`
	- `index.html`: Main page
	- `style.css`: Modern, responsive styling with light/dark theme
	- `app.js`: Handles form submission, loading states, markdown rendering
	- `alt.html` / `alt.css` / `alt.js`: Alternate UI with sidebar layout, language chips, copy and download actions

## API

- `POST /blogs`
	- Body: `{ "topic": "...", "language": "hindi|french|" }`
	- Returns: `{ "data": { "blog": { "title": string, "content": string | { content: string } } } }`

## Notes

- Content is returned in Markdown and rendered via `marked.js` CDN.
- When `language` is empty, content is generated in English.
 - Use the download buttons to save generated blogs as `.md` files.
 - Alternate UI route: `http://localhost:8000/alt`
