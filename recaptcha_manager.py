import os
from google.cloud import recaptchaenterprise_v1
from google.cloud.recaptchaenterprise_v1 import Assessment
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_assessment(
    token: str, 
    recaptcha_action: str,
    project_id: str = None, 
    recaptcha_key: str = None
) -> Assessment:
    """
    Create an assessment to analyse the risk of a UI action.
    
    Args:
        token: The generated token obtained from the client.
        recaptcha_action: Action name corresponding to the token.
        project_id: Your Google Cloud project ID. Defaults to environment variable.
        recaptcha_key: The reCAPTCHA key associated with the site/app. Defaults to environment variable.
    """
    
    # Use environment variables if not provided
    project_id = project_id or os.getenv("GOOGLE_CLOUD_PROJECT_ID")
    recaptcha_key = recaptcha_key or os.getenv("RECAPTCHA_SITE_KEY")

    if not project_id or not recaptcha_key:
        raise ValueError("GOOGLE_CLOUD_PROJECT_ID and RECAPTCHA_SITE_KEY must be set in environment or passed as arguments.")

    client = recaptchaenterprise_v1.RecaptchaEnterpriseServiceClient()

    # Set the properties of the event to be tracked.
    event = recaptchaenterprise_v1.Event()
    event.site_key = recaptcha_key
    event.token = token

    assessment = recaptchaenterprise_v1.Assessment()
    assessment.event = event

    project_name = f"projects/{project_id}"

    # Build the assessment request.
    request = recaptchaenterprise_v1.CreateAssessmentRequest()
    request.assessment = assessment
    request.parent = project_name

    try:
        response = client.create_assessment(request)
    except Exception as e:
        print(f"Error creating assessment: {e}")
        return None

    # Check if the token is valid.
    if not response.token_properties.valid:
        print(
            "The CreateAssessment call failed because the token was "
            + "invalid for the following reasons: "
            + str(response.token_properties.invalid_reason)
        )
        return None

    # Check if the expected action was executed.
    if response.token_properties.action != recaptcha_action:
        print(
            f"The action attribute in your reCAPTCHA tag ({response.token_properties.action}) "
            + f"does not match the action you are expecting ({recaptcha_action})"
        )
        return None
    
    # Log the risk score and the reason(s).
    for reason in response.risk_analysis.reasons:
        print(f"Risk reason: {reason}")
    
    print(f"The reCAPTCHA score for this token is: {response.risk_analysis.score}")
    
    # Get the assessment name (ID).
    assessment_name = client.parse_assessment_path(response.name).get("assessment")
    print(f"Assessment name: {assessment_name}")
    
    return response

if __name__ == "__main__":
    # Example usage for testing
    import sys
    if len(sys.argv) > 2:
        test_token = sys.argv[1]
        test_action = sys.argv[2]
        create_assessment(test_token, test_action)
    else:
        print("Usage: python recaptcha_manager.py <token> <action>")
