from django.core.mail import send_mail
from django.conf import settings
from .models import EmergencyContact
import logging

logger = logging.getLogger(__name__)

def notify_emergency_contacts_email(user_message):
    contacts = EmergencyContact.objects.all()
    if not contacts:
        return

    subject = "LUMINA CRISIS ALERT"
    message_body = f"Hello,\n\nThis is an automated alert from the Lumina Mental Health Platform.\n\nA trusted person in your circle is showing signs of extreme distress.\n\nLast Message: \"{user_message}\"\n\nPlease check on them immediately.\n\nStay safe,\nLumina AI"
    
    for contact in contacts:
        if not contact.email:
            continue
            
        try:
            if settings.EMAIL_HOST_USER and settings.EMAIL_HOST_USER != 'your-email@gmail.com':
                send_mail(
                    subject,
                    message_body,
                    settings.EMAIL_HOST_USER,
                    [contact.email],
                    fail_silently=False,
                )
                logger.info(f"REAL Email Sent to {contact.name} ({contact.email})")
            else:
                # MOCK MODE
                print("\n" + "-"*50)
                print("SIMULATED EMAIL ALERT SENT")
                print(f"TO: {contact.name} ({contact.email})")
                print(f"SUBJECT: {subject}")
                print(f"BODY: {message_body}")
                print("-"*50 + "\n")
                logger.info(f"MOCK Email Sent to {contact.name}")
        except Exception as e:
            logger.error(f"Failed to send email to {contact.name}: {e}")
