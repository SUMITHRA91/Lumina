import os
import logging
from twilio.rest import Client
from .models import EmergencyContact

logger = logging.getLogger(__name__)

# Twilio Credentials (loaded from environment)
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID', 'YOUR_TWILIO_SID')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', 'YOUR_TWILIO_AUTH_TOKEN')
# Real Twilio 'From' number (Official Twilio Number)
TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER', 'YOUR_TWILIO_NUMBER') 

def notify_emergency_contacts(user_message):
    contacts = EmergencyContact.objects.all()
    if not contacts:
        logger.warning("No emergency contacts found to notify.")
        return

    alert_body = f"LUMINA ALERT: A trusted person is in distress. Their last message: \"{user_message}\". Please check on them."

    for contact in contacts:
        try:
            # Attempt Real SMS
            client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            
            # Ensure number has + if needed, or use raw
            from_num = TWILIO_PHONE_NUMBER if TWILIO_PHONE_NUMBER.startswith('+') else f"+{TWILIO_PHONE_NUMBER}"
            to_num = contact.phone if contact.phone.startswith('+') else f"+{contact.phone}"

            client.messages.create(
                body=alert_body,
                from_=from_num,
                to=to_num
            )
            logger.info(f"REAL SMS SENT to {contact.name} ({to_num})")
            print(f"SUCCESS: Real SMS alert sent to {contact.name}")
        except Exception as e:
            error_msg = str(e)
            print("\n" + "!"*60)
            print("TWILIO ERROR DETECTED")
            print(f"Error Detail: {error_msg}")
            
            if "is not a Twilio phone number" in error_msg:
                print("\nIMPORTANT: The 'From' number you provided is not a Twilio-purchased number.")
                print("1. Go to your Twilio Console (twilio.com/console)")
                print("2. Look for 'Twilio Phone Number' on the dashboard.")
                print("3. You MUST use a number bought from Twilio as the sender.")
            elif "not yet verified" in error_msg:
                print("\nIMPORTANT: You are using a Twilio Trial account.")
                print("You must verify the 'To' phone number in your Twilio console before you can send to it.")
                
            print(f"\nMOCK ALERT for {contact.name}: {alert_body}")
            print("!"*60 + "\n")
            logger.error(f"Failed to send SMS to {contact.name}: {e}")
