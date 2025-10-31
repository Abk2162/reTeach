import os
import sys
import logging
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv('.env')

api_key = os.getenv("GOOGLE_API_KEY")
logger.info(f"API Key found: {bool(api_key)}")
if api_key:
    logger.info(f"API Key preview: {api_key[:20]}...")

if not api_key:
    logger.error("❌ No GOOGLE_API_KEY found in .env file!")
    sys.exit(1)

try:
    import google.generativeai as genai
    logger.info("✓ google.generativeai imported successfully")
    
    genai.configure(api_key=api_key)
    logger.info("✓ API configured")
    
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    logger.info("✓ Model initialized")
    
    logger.info("\n🧪 Testing Gemini API call...")
    response = model.generate_content("Say hello in one sentence")
    
    logger.info(f"\n✅ SUCCESS!")
    logger.info(f"Response: {response.text}")
    
except Exception as e:
    logger.error(f"\n❌ ERROR: {type(e).__name__}")
    logger.error(f"Details: {str(e)}")
    import traceback
    traceback.print_exc()
