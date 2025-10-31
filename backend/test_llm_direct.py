"""
Direct test of LLM service with topic extraction
"""
import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env')

# Now import after env is loaded
from app.services.llm_service import get_llm_service
from app.utils.prompts import topic_extraction_prompt

async def test_topic_extraction():
    print("=" * 60)
    print("Testing Topic Extraction with Gemini")
    print("=" * 60)
    
    # Sample syllabus
    syllabus = """
    Course: Introduction to Calculus I
    
    Prerequisites: 
    - Algebra II with strong understanding of functions
    - Trigonometry
    - Pre-calculus recommended
    
    Topics Covered:
    - Limits and continuity
    - Derivatives
    - Applications of derivatives
    - Integration basics
    """
    
    print(f"\n📚 Syllabus ({len(syllabus)} chars):\n{syllabus}\n")
    
    try:
        # Get LLM service
        llm = get_llm_service()
        print("✓ LLM service initialized\n")
        
        # Generate prompt
        prompt = topic_extraction_prompt(
            syllabus_text=syllabus,
            course_level="undergraduate"
        )
        print(f"📝 Prompt generated ({len(prompt)} chars)\n")
        
        # Call LLM
        print("🤖 Calling Gemini API...\n")
        response = await llm.generate_json(prompt, max_tokens=2048)
        
        print("\n✅ SUCCESS!")
        print(f"Response type: {type(response)}")
        print(f"Response:\n{response}\n")
        
        if isinstance(response, list):
            print(f"✓ Extracted {len(response)} topics:")
            for i, topic in enumerate(response[:5], 1):
                print(f"  {i}. {topic.get('name', 'Unknown')}")
        
    except Exception as e:
        print(f"\n❌ ERROR: {type(e).__name__}")
        print(f"Details: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_topic_extraction())
