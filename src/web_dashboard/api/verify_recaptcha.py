from http.server import BaseHTTPRequestHandler
import json
import os
from google.cloud import recaptchaenterprise_v1

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        
        token = data.get('token')
        action = data.get('action')
        
        project_id = os.environ.get('VITE_FIREBASE_PROJECT_ID')
        recaptcha_key = '6LeDEsgsAAAAAHglydox2_TQEPUDR0k6ZFm8ILUy'
        
        if not token or not action:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Missing token or action'}).encode())
            return
            
        try:
            client = recaptchaenterprise_v1.RecaptchaEnterpriseServiceClient()
            
            event = recaptchaenterprise_v1.Event()
            event.site_key = recaptcha_key
            event.token = token
            
            assessment = recaptchaenterprise_v1.Assessment()
            assessment.event = event
            
            project_name = f"projects/{project_id}"
            
            request = recaptchaenterprise_v1.CreateAssessmentRequest()
            request.assessment = assessment
            request.parent = project_name
            
            response = client.create_assessment(request)
            
            # Check if the token is valid
            is_valid = response.token_properties.valid
            score = response.risk_analysis.score if is_valid else 0
            expected_action = response.token_properties.action == action
            
            success = is_valid and expected_action and score >= 0.5
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': success,
                'score': score,
                'valid': is_valid,
                'expected_action': expected_action
            }).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
