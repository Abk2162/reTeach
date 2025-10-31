"""Check what the correct_answer constraint expects"""
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

client = create_client(supabase_url, supabase_key)

# First, create a real topic to use
print("Creating test topic...\n")
try:
    # Get or create a course first
    course_result = client.table("courses").select("id").limit(1).execute()
    if course_result.data:
        course_id = course_result.data[0]["id"]
    else:
        course_result = client.table("courses").insert({
            "title": "Test Course",
            "subject": "Test",
            "grade_level": "Test"
        }).execute()
        course_id = course_result.data[0]["id"]
    
    # Create a test topic
    topic_result = client.table("topics").insert({
        "course_id": course_id,
        "topic_id": "test_topic_constraint",
        "name": "Test Topic"
    }).execute()
    
    topic_id = topic_result.data[0]["id"]
    print(f"✓ Created topic with UUID: {topic_id}\n")
    
except Exception as e:
    print(f"Error creating topic: {e}")
    topic_id = None

if not topic_id:
    print("Cannot proceed without valid topic_id")
    exit(1)

print("Testing different formats for correct_answer field...\n")

test_cases = [
    {
        "name": "Integer 0",
        "correct_answer": 0,
    },
    {
        "name": "String 'Yes' (actual option text)",
        "correct_answer": "Yes",
    },
    {
        "name": "Integer as string '0'",
        "correct_answer": "0",
    },
    {
        "name": "None/null",
        "correct_answer": None,
    },
]

base_data = {
    "question_id": "test_q_constraint",
    "topic_id": topic_id,
    "stem": "Test question?",
    "options": ["Yes", "Maybe", "No"],
    "answer_index": 0,
    "rationale": "Test",
    "difficulty": "easy",
    "bloom_level": "remember",
}

for idx, test_case in enumerate(test_cases):
    test_data = {**base_data, "question_id": f"test_q_{idx}", "correct_answer": test_case["correct_answer"]}
    
    print(f"Testing: {test_case['name']}")
    print(f"  correct_answer = {repr(test_case['correct_answer'])} (type: {type(test_case['correct_answer']).__name__})")
    
    try:
        result = client.table("questions").insert(test_data).execute()
        print(f"  ✅ SUCCESS - This format works!")
        print(f"  Data inserted: {result.data[0]}")
        
        # Clean up
        if result.data:
            client.table("questions").delete().eq("id", result.data[0]["id"]).execute()
        break  # Found working format, stop testing
        
    except Exception as e:
        error_msg = str(e)
        if "questions_correct_answer_check" in error_msg:
            print(f"  ❌ FAILED - Check constraint violated")
        else:
            print(f"  ❌ FAILED - {error_msg[:150]}")
    
    print()

# Cleanup
try:
    client.table("topics").delete().eq("id", topic_id).execute()
    print(f"\n✓ Cleaned up test topic")
except:
    pass

print("\n" + "="*80)
print("Check your database schema to see the actual constraint definition")
print("="*80)

