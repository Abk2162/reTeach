"""
Database Connection
Supabase client initialization and connection management
"""

from functools import lru_cache
from typing import Optional
import httpx

from supabase import Client, create_client, ClientOptions

from app.config import settings


class Database:
    """Supabase database client wrapper"""

    def __init__(self):
        self._client: Optional[Client] = None

    @property
    def client(self) -> Client:
        """Get or create Supabase client with extended timeout"""
        if self._client is None:
            # Create httpx client with longer timeout for slow networks
            http_client = httpx.Client(timeout=30.0)
            
            self._client = create_client(
                supabase_url=settings.supabase_url,
                supabase_key=settings.supabase_key,
                options=ClientOptions(
                    postgrest_client_timeout=30,  # 30 second timeout for queries
                    storage_client_timeout=30,
                )
            )
        return self._client

    async def health_check(self) -> bool:
        """Check if database connection is healthy"""
        try:
            # Simple query to check connection
            result = self.client.table("courses").select("id").limit(1).execute()
            return True
        except Exception as e:
            print(f"Database health check failed: {e}")
            return False


@lru_cache()
def get_database() -> Database:
    """Get cached database instance"""
    return Database()


# Convenience access
db = get_database()
