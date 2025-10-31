"""Add missing database functions"""
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

client = create_client(supabase_url, supabase_key)

# SQL for the functions
sql_functions = """
-- Function to get form topic statistics
CREATE OR REPLACE FUNCTION get_form_topic_stats(form_uuid UUID)
RETURNS TABLE (
    topic_id UUID,
    topic_name TEXT,
    total_questions BIGINT,
    correct_answers BIGINT,
    accuracy_percentage DECIMAL(5,2),
    total_responses BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id AS topic_id,
        t.name AS topic_name,
        COUNT(DISTINCT r.question_id) AS total_questions,
        SUM(CASE WHEN r.is_correct THEN 1 ELSE 0 END) AS correct_answers,
        CASE 
            WHEN COUNT(r.id) > 0 THEN 
                ROUND((SUM(CASE WHEN r.is_correct THEN 1 ELSE 0 END)::DECIMAL / COUNT(r.id)::DECIMAL) * 100, 2)
            ELSE 0 
        END AS accuracy_percentage,
        COUNT(r.id) AS total_responses
    FROM topics t
    INNER JOIN questions q ON q.topic_id = t.id
    INNER JOIN form_questions fq ON fq.question_id = q.id
    LEFT JOIN responses r ON r.question_id = q.id AND r.form_id = form_uuid
    WHERE fq.form_id = form_uuid
    GROUP BY t.id, t.name
    ORDER BY t.name;
END;
$$ LANGUAGE plpgsql;
"""

print("=" * 80)
print("ADDING DATABASE FUNCTIONS")
print("=" * 80)

print("\n⚠️  Note: Cannot execute SQL directly via Supabase client.")
print("Please run the SQL in migrations/add_stats_functions.sql")
print("\nOptions:")
print("1. Go to Supabase Dashboard → SQL Editor")
print("2. Copy the SQL from: backend/migrations/add_stats_functions.sql")
print("3. Paste and run it")
print("\nOR use psql:")
print(f"   psql -h db.ycovmdegaprgwmuhtsdb.supabase.co -U postgres -d postgres -f migrations/add_stats_functions.sql")

print("\n" + "=" * 80)
print("WORKAROUND: Using direct database query")
print("=" * 80)

# Alternative: Try using Supabase's query endpoint
try:
    # This won't work for CREATE FUNCTION, but let's document what's needed
    print("\n✓ SQL file created at: backend/migrations/add_stats_functions.sql")
    print("✓ Please execute it in Supabase SQL Editor")
    
    # Show what form needs the stats
    forms_result = client.table("forms").select("id, slug, title").eq("status", "published").execute()
    if forms_result.data:
        print(f"\n📋 Published forms that need stats:")
        for form in forms_result.data:
            print(f"   - {form['title']} (slug: {form['slug']})")
    
except Exception as e:
    print(f"\nError: {e}")

print("\n" + "=" * 80)
