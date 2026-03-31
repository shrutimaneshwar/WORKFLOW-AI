"""
Backend API Tests for WorkflowAI
Tests: Auth endpoints, Workflow history, Public sharing
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://workflow-insights-ai.preview.emergentagent.com').rstrip('/')

# Test credentials from test_credentials.md
ADMIN_EMAIL = "admin@workflowai.com"
ADMIN_PASSWORD = "admin123"


class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_api_root(self):
        """Test API root endpoint returns success"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "WorkflowAI" in data["message"]
        print(f"✓ API root: {data['message']}")


class TestAuthLogin:
    """Authentication login tests"""
    
    def test_login_success_with_admin(self):
        """Test login with admin credentials returns user and sets cookies"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        assert "_id" in data, "Response should contain _id"
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        assert "name" in data
        
        # Check cookies are set
        cookies = session.cookies.get_dict()
        assert "access_token" in cookies, "access_token cookie should be set"
        assert "refresh_token" in cookies, "refresh_token cookie should be set"
        print(f"✓ Login success: {data['email']}, role: {data['role']}")
    
    def test_login_invalid_credentials(self):
        """Test login with wrong password returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": "wrongpassword"}
        )
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ Invalid login rejected: {data['detail']}")
    
    def test_login_nonexistent_user(self):
        """Test login with non-existent email returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "nonexistent@test.com", "password": "anypassword"}
        )
        assert response.status_code == 401
        print("✓ Non-existent user login rejected")


class TestAuthRegister:
    """Authentication registration tests"""
    
    def test_register_new_user(self):
        """Test registering a new user returns user and sets cookies"""
        session = requests.Session()
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        
        response = session.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "name": "Test User",
                "email": unique_email,
                "password": "testpass123"
            }
        )
        assert response.status_code == 200, f"Register failed: {response.text}"
        
        data = response.json()
        assert "_id" in data
        assert data["email"] == unique_email.lower()
        assert data["name"] == "Test User"
        assert data["role"] == "user"
        
        # Check cookies are set
        cookies = session.cookies.get_dict()
        assert "access_token" in cookies
        assert "refresh_token" in cookies
        print(f"✓ Register success: {data['email']}")
    
    def test_register_duplicate_email(self):
        """Test registering with existing email returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "name": "Duplicate User",
                "email": ADMIN_EMAIL,
                "password": "testpass123"
            }
        )
        assert response.status_code == 400
        data = response.json()
        assert "already registered" in data["detail"].lower()
        print(f"✓ Duplicate email rejected: {data['detail']}")


class TestAuthMe:
    """Test /auth/me endpoint"""
    
    def test_get_me_authenticated(self):
        """Test /me returns user when authenticated"""
        session = requests.Session()
        # Login first
        login_resp = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert login_resp.status_code == 200
        
        # Get current user
        me_resp = session.get(f"{BASE_URL}/api/auth/me")
        assert me_resp.status_code == 200
        
        data = me_resp.json()
        assert data["email"] == ADMIN_EMAIL
        assert "password_hash" not in data, "password_hash should not be returned"
        print(f"✓ /me returns user: {data['email']}")
    
    def test_get_me_unauthenticated(self):
        """Test /me returns 401 when not authenticated"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✓ /me rejects unauthenticated request")


class TestAuthLogout:
    """Test logout endpoint"""
    
    def test_logout_clears_cookies(self):
        """Test logout clears auth cookies"""
        session = requests.Session()
        # Login first
        login_resp = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert login_resp.status_code == 200
        
        # Logout
        logout_resp = session.post(f"{BASE_URL}/api/auth/logout")
        assert logout_resp.status_code == 200
        data = logout_resp.json()
        assert data["message"] == "Logged out"
        
        # Verify /me now fails
        me_resp = session.get(f"{BASE_URL}/api/auth/me")
        assert me_resp.status_code == 401
        print("✓ Logout clears cookies and /me fails after")


class TestAuthRefresh:
    """Test token refresh endpoint"""
    
    def test_refresh_token(self):
        """Test refresh token endpoint"""
        session = requests.Session()
        # Login first
        login_resp = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert login_resp.status_code == 200
        
        # Refresh token
        refresh_resp = session.post(f"{BASE_URL}/api/auth/refresh")
        assert refresh_resp.status_code == 200
        data = refresh_resp.json()
        assert data["message"] == "Token refreshed"
        print("✓ Token refresh successful")
    
    def test_refresh_without_token(self):
        """Test refresh without refresh token returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/refresh")
        assert response.status_code == 401
        print("✓ Refresh without token rejected")


class TestForgotPassword:
    """Test forgot password endpoint"""
    
    def test_forgot_password_existing_email(self):
        """Test forgot password with existing email"""
        response = requests.post(
            f"{BASE_URL}/api/auth/forgot-password",
            json={"email": ADMIN_EMAIL}
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        # Should not reveal if email exists
        assert "reset link" in data["message"].lower() or "email" in data["message"].lower()
        print(f"✓ Forgot password: {data['message']}")
    
    def test_forgot_password_nonexistent_email(self):
        """Test forgot password with non-existent email (should not reveal)"""
        response = requests.post(
            f"{BASE_URL}/api/auth/forgot-password",
            json={"email": "nonexistent@test.com"}
        )
        # Should return 200 to not reveal if email exists
        assert response.status_code == 200
        print("✓ Forgot password doesn't reveal non-existent email")


class TestWorkflowHistory:
    """Test workflow history endpoints (require auth)"""
    
    @pytest.fixture
    def auth_session(self):
        """Create authenticated session"""
        session = requests.Session()
        resp = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert resp.status_code == 200
        return session
    
    def test_get_workflow_history_authenticated(self, auth_session):
        """Test getting workflow history when authenticated"""
        response = auth_session.get(f"{BASE_URL}/api/workflow-history")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Workflow history: {len(data)} items")
    
    def test_get_workflow_history_unauthenticated(self):
        """Test workflow history returns 401 when not authenticated"""
        response = requests.get(f"{BASE_URL}/api/workflow-history")
        assert response.status_code == 401
        print("✓ Workflow history rejects unauthenticated request")


class TestWorkflowHistoryOperations:
    """Test workflow history CRUD operations"""
    
    @pytest.fixture
    def auth_session(self):
        """Create authenticated session"""
        session = requests.Session()
        resp = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert resp.status_code == 200
        return session
    
    def test_toggle_public_nonexistent(self, auth_session):
        """Test toggle public on non-existent analysis returns 404"""
        response = auth_session.post(f"{BASE_URL}/api/workflow-history/000000000000000000000000/toggle-public")
        assert response.status_code == 404
        print("✓ Toggle public on non-existent returns 404")
    
    def test_delete_nonexistent(self, auth_session):
        """Test delete non-existent analysis returns 404"""
        response = auth_session.delete(f"{BASE_URL}/api/workflow-history/000000000000000000000000")
        assert response.status_code == 404
        print("✓ Delete non-existent returns 404")


class TestSharedAnalysis:
    """Test public shared analysis endpoint"""
    
    def test_shared_invalid_token(self):
        """Test shared analysis with invalid token returns 404"""
        response = requests.get(f"{BASE_URL}/api/shared/invalid_token_12345")
        assert response.status_code == 404
        data = response.json()
        assert "not found" in data["detail"].lower() or "private" in data["detail"].lower()
        print("✓ Invalid share token returns 404")


class TestBruteForceProtection:
    """Test brute force protection (5 failed attempts = lockout)"""
    
    @pytest.mark.skip(reason="Brute force protection uses IP+email, may not work through proxy/load balancer")
    def test_brute_force_lockout(self):
        """Test that 5 failed login attempts triggers lockout"""
        unique_email = f"bruteforce_{uuid.uuid4().hex[:8]}@test.com"
        
        # Make 5 failed attempts
        for i in range(5):
            response = requests.post(
                f"{BASE_URL}/api/auth/login",
                json={"email": unique_email, "password": "wrongpass"}
            )
            assert response.status_code == 401, f"Attempt {i+1} should return 401"
        
        # 6th attempt should be rate limited
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": unique_email, "password": "wrongpass"}
        )
        assert response.status_code == 429, f"Expected 429 after 5 failed attempts, got {response.status_code}"
        data = response.json()
        assert "too many" in data["detail"].lower()
        print("✓ Brute force protection: lockout after 5 failed attempts")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
