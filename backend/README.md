# EdTech Diagnostic Backend

AI-powered diagnostic assessment generation using Claude API and Supabase.

## Features

- **Topic Extraction**: Automatically parse course syllabi to extract key topics
- **Question Generation**: Generate high-quality MCQ diagnostic questions using Claude
- **Caching**: LLM responses cached for faster iteration and demo runs
- **Fallback Logic**: Regex-based extraction if LLM fails
- **Database Integration**: Store topics, questions, and responses in Supabase

## Quick Start

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_anon_or_service_role_key
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Get Supabase key from: Dashboard → Settings → API → `anon` key

### 3. Setup Database

Run the SQL migration in your Supabase SQL Editor:
```bash
# Copy contents of supabase/001_initial_schema.sql
# Paste into Supabase Dashboard → SQL Editor → New Query
# Run the query
```

### 4. Run Tests

```bash
# Test topic parsing
python test_topic_parser.py

# Test question generation
python test_question_gen.py

# Test full workflow
python test_full_workflow.py
```

## Project Structure

```
backend/
├── app/
│   ├── config.py              # Configuration & env loading
│   ├── database.py            # Supabase client
│   ├── main.py                # FastAPI app (optional)
│   │
│   ├── models/                # Pydantic schemas
│   │   ├── topic.py
│   │   ├── question.py
│   │   ├── form.py
│   │   └── response.py
│   │
│   ├── services/              # Business logic
│   │   ├── llm_service.py           # Claude API client
│   │   ├── topic_parser.py          # Topic extraction
│   │   └── question_generator.py    # Question generation
│   │
│   └── utils/
│       └── prompts.py         # LLM prompt templates
│
├── test_*.py                  # Test scripts
├── supabase/                  # Database migrations
├── .env                       # Environment config (git-ignored)
└── requirements.txt           # Python dependencies
```

## Usage Examples

### Parse Topics from Syllabus

```python
from app.services.topic_parser import get_topic_parser
from app.models.course import CourseLevel

parser = get_topic_parser()

syllabus = """
# Calculus I
1. Limits and Continuity
2. Derivatives
3. Integration
"""

topics = await parser.parse_topics(
    syllabus_text=syllabus,
    course_level=CourseLevel.UNDERGRADUATE
)

for topic in topics:
    print(f"{topic.id}: {topic.name}")
```

### Generate Questions

```python
from app.services.question_generator import get_question_generator
from app.models.question import Difficulty

generator = get_question_generator()

questions = await generator.generate_questions(
    topics=["Limits", "Derivatives"],
    count_per_topic=5,
    difficulty=Difficulty.MEDIUM,
)

for q in questions:
    print(f"{q.id}. {q.stem}")
    print(f"   Answer: {q.options[q.answerIndex]}")
```

## API Endpoints (Optional)

If you want to run the FastAPI server:

```bash
python app/main.py
# or
uvicorn app.main:app --reload
```

Endpoints:
- `GET /health` - Health check
- `GET /docs` - Interactive API docs

## Caching

LLM responses are automatically cached in `.cache/llm_responses/` to:
- Speed up development iteration
- Reduce API costs
- Enable offline demo runs

Clear cache: `rm -rf .cache/`

Disable cache: Set `CACHE_ENABLED=false` in `.env`

## Configuration

All settings in `.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | Required |
| `SUPABASE_KEY` | Supabase API key (anon/service_role) | Required |
| `ANTHROPIC_API_KEY` | Claude API key | Required |
| `ANTHROPIC_MODEL` | Claude model to use | `claude-3-5-sonnet-20241022` |
| `CACHE_ENABLED` | Enable LLM response caching | `true` |
| `CACHE_DIR` | Cache directory path | `.cache` |
| `DEBUG` | Enable debug logging | `true` |

## Troubleshooting

### "Database health check failed"
- Check `SUPABASE_URL` and `SUPABASE_KEY` in `.env`
- Ensure you've run the SQL migration
- Verify RLS policies allow access

### "LLM extraction failed"
- Check `ANTHROPIC_API_KEY` in `.env`
- Check API rate limits
- Fallback to regex extraction should activate automatically

### "No valid questions generated"
- LLM may return malformed JSON
- Check `.cache/` for raw responses
- Try adjusting prompts in `app/utils/prompts.py`

## Development

### Run with auto-reload
```bash
uvicorn app.main:app --reload --port 8000
```

### Run tests
```bash
pytest tests/
```

### Format code
```bash
black app/
```


