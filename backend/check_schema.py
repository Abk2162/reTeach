"""Check database schema for NOT NULL constraints"""
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

print(f"URL: {supabase_url}")
print(f"Key found: {bool(supabase_key)}\n")

client = create_client(supabase_url, supabase_key)

print("=== CHECKING REQUIRED FIELDS IN COURSES TABLE ===\n")

# Try different combinations of fields to find all required ones
test_fields = {
    "title": "Test Course",
    "subject": "General", 
    "course_level": "ug",
    "grade_level": "Undergraduate",
    "description": "Test description",
    "teacher_id": None,  # UUID field
}

required_fields = []

# Test each field by removing it
for field_to_skip in test_fields.keys():
    test_data = {k: v for k, v in test_fields.items() if k != field_to_skip and v is not None}
    
    try:
        # Try to insert
        result = client.table("courses").insert(test_data).execute()
        # If successful, the field is optional
        print(f"✓ {field_to_skip:20} - OPTIONAL (insert succeeded)")
        
        # Delete the test record
        if result.data:
            client.table("courses").delete().eq("id", result.data[0]["id"]).execute()
            
    except Exception as e:
        error_msg = str(e)
        if "null value in column" in error_msg and field_to_skip in error_msg:
            required_fields.append(field_to_skip)
            print(f"❌ {field_to_skip:20} - REQUIRED (NOT NULL constraint)")
        else:
            print(f"? {field_to_skip:20} - Unknown (error: {error_msg[:100]}...)")

print(f"\n=== SUMMARY ===")
print(f"Required fields: {', '.join(required_fields)}")

