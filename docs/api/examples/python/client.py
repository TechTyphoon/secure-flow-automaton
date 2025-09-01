#!/usr/bin/env python3
"""
Secure Flow Automaton Python API Client Example
Demonstrates how to interact with the Secure Flow Automaton API using Python
"""

import requests
import json
import time
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime


@dataclass
class APIResponse:
    """API Response wrapper"""
    success: bool
    data: Any = None
    error: Optional[Dict] = None
    status_code: int = 200


class SecureFlowClient:
    """Secure Flow Automaton API Client"""

    def __init__(self, base_url: str = "http://localhost:8080/api/v1"):
        self.base_url = base_url.rstrip('/')
        self.token: Optional[str] = None
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'SecureFlow-Python-Client/4.1.0'
        })

    def set_token(self, token: str) -> None:
        """Set authentication token"""
        self.token = token
        self.session.headers['Authorization'] = f'Bearer {token}'

    def _make_request(self, method: str, endpoint: str,
                     data: Optional[Dict] = None,
                     params: Optional[Dict] = None) -> APIResponse:
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"

        try:
            if data:
                response = self.session.request(method, url, json=data, params=params)
            else:
                response = self.session.request(method, url, params=params)

            if response.status_code >= 400:
                try:
                    error_data = response.json()
                    return APIResponse(
                        success=False,
                        error=error_data.get('error'),
                        status_code=response.status_code
                    )
                except:
                    return APIResponse(
                        success=False,
                        error={'message': response.text},
                        status_code=response.status_code
                    )

            try:
                response_data = response.json()
                return APIResponse(
                    success=response_data.get('success', True),
                    data=response_data,
                    status_code=response.status_code
                )
            except:
                return APIResponse(
                    success=True,
                    data={'message': response.text},
                    status_code=response.status_code
                )

        except requests.RequestException as e:
            return APIResponse(
                success=False,
                error={'message': f'Request failed: {str(e)}'},
                status_code=0
            )

    def login(self, email: str, password: str, mfa_code: Optional[str] = None) -> APIResponse:
        """Authenticate user"""
        payload = {
            "email": email,
            "password": password,
            "deviceId": f"python-client-{int(time.time())}",
            "ipAddress": "127.0.0.1",
            "userAgent": "SecureFlow-Python-Client/4.1.0"
        }

        if mfa_code:
            payload["mfaCode"] = mfa_code

        result = self._make_request('POST', '/auth/login', payload)

        if result.success and result.data and 'token' in result.data:
            self.set_token(result.data['token'])
            print("✅ Authentication successful")

        return result

    def refresh_token(self, refresh_token: str) -> APIResponse:
        """Refresh authentication token"""
        result = self._make_request('POST', '/auth/refresh', {"refreshToken": refresh_token})

        if result.success and result.data and 'token' in result.data:
            self.set_token(result.data['token'])

        return result

    def logout(self) -> APIResponse:
        """Logout user"""
        result = self._make_request('POST', '/auth/logout')

        if result.success:
            self.token = None
            self.session.headers.pop('Authorization', None)
            print("✅ Logout successful")

        return result

    def query_security_assistant(self, query: str,
                               query_type: str = "analysis",
                               parameters: Optional[Dict] = None,
                               filters: Optional[Dict] = None) -> APIResponse:
        """Query security assistant"""
        payload = {
            "text": query,
            "type": query_type,
            "parameters": parameters or {},
            "filters": filters or {}
        }

        return self._make_request('POST', '/security/assistant/query', payload)

    def get_health_status(self) -> APIResponse:
        """Get system health status"""
        return self._make_request('GET', '/health')

    def get_performance_report(self, time_range: str = "24h",
                             include_memory: bool = True,
                             include_cpu: bool = True) -> APIResponse:
        """Get performance report"""
        params = {
            "timeRange": time_range,
            "includeMemory": str(include_memory).lower(),
            "includeCPU": str(include_cpu).lower()
        }

        return self._make_request('GET', '/performance/report', params=params)

    def get_security_events(self, severity: Optional[str] = None,
                          event_type: Optional[str] = None,
                          limit: int = 100,
                          offset: int = 0) -> APIResponse:
        """Get security events"""
        params = {
            "limit": limit,
            "offset": offset
        }

        if severity:
            params["severity"] = severity
        if event_type:
            params["type"] = event_type

        return self._make_request('GET', '/security/events', params=params)

    def run_benchmark(self, name: str, operation: str,
                     iterations: int = 100, baseline: int = 100) -> APIResponse:
        """Run performance benchmark"""
        payload = {
            "name": name,
            "operation": operation,
            "iterations": iterations,
            "baseline": baseline
        }

        return self._make_request('POST', '/performance/benchmark', payload)

    def get_active_alerts(self, status: str = "active", severity: Optional[str] = None) -> APIResponse:
        """Get active security alerts"""
        params = {"status": status}
        if severity:
            params["severity"] = severity

        return self._make_request('GET', '/security/alerts', params=params)

    def acknowledge_alert(self, alert_id: str) -> APIResponse:
        """Acknowledge security alert"""
        return self._make_request('POST', f'/security/alerts/{alert_id}/acknowledge')

    def get_user_details(self, user_id: str) -> APIResponse:
        """Get user details"""
        return self._make_request('GET', f'/identity/users/{user_id}')

    def update_user(self, user_id: str, updates: Dict) -> APIResponse:
        """Update user information"""
        return self._make_request('PUT', f'/identity/users/{user_id}', updates)


def main():
    """Example usage of the Secure Flow API client"""
    client = SecureFlowClient()

    try:
        # 1. Login
        print("🔐 Logging in...")
        login_result = client.login("analyst@company.com", "secure-password")

        if not login_result.success:
            print(f"❌ Login failed: {login_result.error}")
            return

        print("✅ Login successful")

        # 2. Query security assistant
        print("\n🤖 Querying security assistant...")
        security_query = client.query_security_assistant(
            "Show me recent security incidents in production",
            query_type="analysis",
            parameters={"timeRange": "24h", "severity": "high"}
        )

        if security_query.success:
            print("✅ Security analysis received")
            if security_query.data and 'data' in security_query.data:
                data = security_query.data['data']
                if 'anomalies' in data:
                    print(f"📊 Found {len(data['anomalies'])} anomalies")
                if 'threats' in data:
                    print(f"🚨 Found {len(data['threats'])} threats")
        else:
            print(f"❌ Security query failed: {security_query.error}")

        # 3. Check system health
        print("\n❤️ Checking system health...")
        health = client.get_health_status()

        if health.success:
            print("✅ Health check successful")
            if health.data:
                print(f"📊 System status: {health.data.get('overallStatus', 'unknown')}")
                print(f"🔢 Services: {health.data.get('services', [])}")
        else:
            print(f"❌ Health check failed: {health.error}")

        # 4. Get performance report
        print("\n📊 Getting performance report...")
        performance = client.get_performance_report("24h")

        if performance.success:
            print("✅ Performance report received")
            if performance.data:
                summary = performance.data.get('summary', {})
                print(".2f")
        else:
            print(f"❌ Performance report failed: {performance.error}")

        # 5. Get security events
        print("\n🔍 Getting security events...")
        events = client.get_security_events(severity="high", limit=5)

        if events.success:
            print("✅ Security events received")
            if events.data:
                event_list = events.data.get('events', [])
                print(f"📋 Found {len(event_list)} high-severity events")
        else:
            print(f"❌ Security events failed: {events.error}")

        # 6. Run performance benchmark
        print("\n⚡ Running performance benchmark...")
        benchmark = client.run_benchmark(
            "API Response Time Test",
            "GET /health",
            iterations=10
        )

        if benchmark.success:
            print("✅ Benchmark completed")
            if benchmark.data:
                print(f"🏃 Average time: {benchmark.data.get('averageTime', 'N/A')}ms")
                print(f"📈 Status: {benchmark.data.get('status', 'unknown')}")
        else:
            print(f"❌ Benchmark failed: {benchmark.error}")

        # 7. Get active alerts
        print("\n🚨 Getting active alerts...")
        alerts = client.get_active_alerts()

        if alerts.success:
            print("✅ Active alerts received")
            if alerts.data:
                alert_list = alerts.data.get('alerts', [])
                print(f"📢 Found {len(alert_list)} active alerts")
        else:
            print(f"❌ Active alerts failed: {alerts.error}")

        # 8. Logout
        print("\n👋 Logging out...")
        logout_result = client.logout()

        if logout_result.success:
            print("✅ Logout successful")
        else:
            print(f"❌ Logout failed: {logout_result.error}")

    except Exception as e:
        print(f"💥 Unexpected error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
