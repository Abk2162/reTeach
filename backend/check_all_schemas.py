"""Check all database tables for NOT NULL constraints"""
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

client = create_client(supabase_url, supabase_key)

# Tables used in the application
tables_to_check = {
    "courses": {
        "title": "Test Course",
        "subject": "General",
        "course_level": "ug",
        "grade_level": "Undergraduate",
        "description": "Test",
        "teacher_id": None,
    },
    "teachers": {
        "name": "Test Teacher",
        "email": "test@example.com",
        "school": "Test School",
        "department": "Computer Science",
    },
    "forms": {
        "form_id": "test_form_123",
        "course_id": None,  # UUID
        "title": "Test Form",
        "slug": "test-form-123",
        "status": "published",
        "teacher_id": None,  # UUID
        "publish_date": "2025-10-31T00:00:00",
    },
    "topics": {
        "topic_id": "test_topic_123",
        "course_id": None,  # UUID
        "name": "Test Topic",
        "weight": 1.0,
        "order_index": 0,
    },
    "questions": {
        "question_id": "test_q_123",
        "topic_id": None,  # UUID
        "stem": "Test question?",
        "options": ["A", "B", "C"],
        "answer_index": 0,
        "correct_answer": "A",
        "rationale": "Test rationale",
        "difficulty": "medium",
        "bloom_level": "remember",
    },
    "form_questions": {
        "form_id": None,  # UUID
        "question_id": None,  # UUID
        "order_index": 0,
    },
    "students": {
        "student_id": "test_student_123",
        "name": "Test Student",
        "email": "student@example.com",
        "form_id": None,  # UUID
    },
    "responses": {
        "response_id": "test_response_123",
        "student_id": None,  # UUID
        "question_id": None,  # UUID
        "answer": "A",
        "is_correct": True,
    },
}

print("=" * 100)
print("CHECKING REQUIRED FIELDS FOR ALL TABLES")
print("=" * 100)

all_required = {}

for table_name, test_fields in tables_to_check.items():
    print(f"\n{'='*100}")
    print(f"TABLE: {table_name}")
    print(f"{'='*100}")
    
    required_fields = []
    optional_fields = []
    unknown_fields = []
    
    # Test each field by removing it
    for field_to_skip in test_fields.keys():
        test_data = {k: v for k, v in test_fields.items() if k != field_to_skip and v is not None}
        
        try:
            # Try to insert
            result = client.table(table_name).insert(test_data).execute()
            optional_fields.append(field_to_skip)
            print(f"  ✓ {field_to_skip:25} - OPTIONAL")
            
            # Delete the test record
            if result.data:
                client.table(table_name).delete().eq("id", result.data[0]["id"]).execute()
                
        except Exception as e:
            error_msg = str(e)
            if "null value in column" in error_msg and field_to_skip in error_msg:
                required_fields.append(field_to_skip)
                print(f"  ❌ {field_to_skip:25} - REQUIRED (NOT NULL constraint)")
            elif "violates foreign key constraint" in error_msg or "is not present in table" in error_msg:
                unknown_fields.append(field_to_skip)
                print(f"  ⚠️  {field_to_skip:25} - FOREIGN KEY (needs valid UUID)")
            else:
                unknown_fields.append(field_to_skip)
                print(f"  ❓ {field_to_skip:25} - ERROR: {error_msg[:80]}")
    
    all_required[table_name] = {
        "required": required_fields,
        "optional": optional_fields,
        "foreign_keys": [f for f in unknown_fields if f.endswith("_id")]
    }

print(f"\n{'='*100}")
print("SUMMARY - REQUIRED FIELDS BY TABLE")
print(f"{'='*100}\n")

for table_name, fields in all_required.items():
    if fields["required"]:
        print(f"\n📋 {table_name}:")
        print(f"   Required: {', '.join(fields['required'])}")
        if fields["foreign_keys"]:
            print(f"   Foreign Keys: {', '.join(fields['foreign_keys'])}")
    else:
        print(f"\n✅ {table_name}: No additional required fields (besides foreign keys)")

print(f"\n{'='*100}\n")
