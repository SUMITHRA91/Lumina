from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import random
from .model_utils import model_manager, esconv_manager
from .emotion_utils import emotion_detector
from .models import EmergencyContact, ChatSession, ChatMessage
from .serializers import EmergencyContactSerializer
from .sms_utils import notify_emergency_contacts
from .email_utils import notify_emergency_contacts_email
from rest_framework.generics import ListCreateAPIView, DestroyAPIView
from .translation_utils import translate_text, detect_language_intent, generate_audio_base64

RESPONSES = {
    "sad": [
        "I can see something heavy is sitting with you right now. You don't have to name it yet — just being here is enough. What's the smallest piece of this you'd like to put down first?",
        "Sadness has a way of making everything feel slower. Let's stay with it gently. When did you first notice this feeling today?",
    ],
    "happy": [
        "There's a lightness in you right now — I can feel it. Tell me what's behind that smile.",
        "It's beautiful to see you arrive here with some warmth. What's been going well?",
    ],
    "angry": [
        "Something is pushing back against you. Anger is information — it usually points to a value being crossed. What feels unfair right now?",
        "I notice tension. Let's take one slow breath together before we name it. What happened just before this feeling?",
    ],
    "fearful": [
        "Your nervous system is on alert. That's not weakness — it's protection. Can you tell me what your body is bracing for?",
        "Fear narrows the world. Let's widen it a little. Name three things you can see in the room right now.",
    ],
    "surprised": [
        "Something caught you off guard. Surprise often hides another feeling underneath — what comes up next when you sit with it?",
    ],
    "neutral": [
        "You feel steady right now. That's a good place to think from. What would you like to explore today?",
        "There's a calm in the room. Let's use it. What's on your mind?",
    ],
    "disgusted": [
        "Something doesn't sit right with you. That reaction is honest. What is it pointing toward?",
    ],
}

TASK_HOOKS = {
    "sad": "Before we go further, let's take a slow, deep breath together. Breathe in... and out. You're doing great.",
    "fearful": "I can see the tension. Let's do a quick grounding exercise: drop your shoulders, and take one long exhale with me.",
    "angry": "Let's try to release a bit of that heavy tension first. Take a deep breath in... and let it out slowly.",
}

class EmotionDetectionView(APIView):
    def post(self, request):
        image_base64 = request.data.get('image', '')
        if not image_base64:
            return Response({"error": "No image provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        scores, label, posture = emotion_detector.predict_emotion(image_base64)
        if scores is None:
            return Response({"error": label, "posture": posture}, status=status.HTTP_200_OK)
            
        return Response({
            "scores": scores,
            "dominant": label,
            "posture": posture
        }, status=status.HTTP_200_OK)

CRISIS_KEYWORDS = ['suicide', 'kill myself', 'hurt myself', 'end my life', 'want to die', 'self harm']

PANIC_KEYWORDS = ['cannot breathe', "can't breathe", 'heart racing', 'heart pounding',
                   'chest tight', 'panic', 'dizzy', 'shaking', 'trembling', 'overwhelmed']
LETHARGY_KEYWORDS = ['tired', 'pointless', 'heavy', 'hopeless', 'exhausted', 'numb',
                      'empty', 'worthless', 'give up', 'no energy', 'what\'s the point']

PANIC_LOOP_PROMPT = (
    "IMPORTANT: The user appears to be in a HIGH ANXIETY / PANIC state. "
    "Your response MUST: "
    "1. Immediately acknowledge the physical tension you sense. "
    "2. Suggest ONE specific Vagus Nerve Stimulation technique. For example: "
    "   - 'Ice Water' technique: splash cold water on the face or hold an ice cube "
    "   - 'Box Breath': 4s inhale, 4s hold, 4s exhale, 4s hold "
    "3. Keep your message short, calm, and grounding. Do not overwhelm the user with text."
)

LETHARGY_PROMPT = (
    "IMPORTANT: The user appears to be in a HIGH SADNESS / LETHARGY state. "
    "Your response MUST: "
    "1. Validate that things feel very heavy right now. "
    "2. Use Behavioral Activation: give ONE tiny, physical micro-goal. For example: "
    "   - 'Can we try just standing up and stretching for 10 seconds? I'll do it with you.' "
    "   - 'Can you walk to the window and look outside for a moment?' "
    "3. Do NOT suggest lengthy talk therapy or reflection right now. Action first."
)

def detect_alert_state(text: str, scores: dict) -> str | None:
    """Auto-detect panic-loop or lethargy from text keywords + vision scores."""
    text_lower = text.lower()
    fear_score = scores.get('fearful', 0)
    surprised_score = scores.get('surprised', 0)
    sad_score = scores.get('sad', 0)

    has_panic_keyword = any(k in text_lower for k in PANIC_KEYWORDS)
    has_lethargy_keyword = any(k in text_lower for k in LETHARGY_KEYWORDS)

    if has_panic_keyword or (fear_score + surprised_score) > 0.7:
        return 'panic_loop'
    if has_lethargy_keyword or sad_score > 0.7:
        return 'lethargy'
    return None

def check_crisis(text, scores):
    text_lower = text.lower()
    if any(k in text_lower for k in CRISIS_KEYWORDS):
        return True
    if scores:
        distress = scores.get('sad', 0) * 0.7 + scores.get('fearful', 0) * 0.3
        if distress > 0.85:
            return True
    return False

class EmergencyContactView(ListCreateAPIView):
    queryset = EmergencyContact.objects.all()
    serializer_class = EmergencyContactSerializer

class ContactDeleteView(DestroyAPIView):
    queryset = EmergencyContact.objects.all()
    serializer_class = EmergencyContactSerializer

WARM_HOOKS = {
    "sad": [
        "I'm sensing things feel a bit heavy right now... I'm right here with you.",
        "It sounds like you're carrying a lot today. Let's take it slow.",
        "I can feel the weight in your heart. You're not alone in this.",
    ],
    "happy": [
        "It's so wonderful to see that light in you!",
        "I'm catching some of that positive energy! Tell me more.",
        "Your smile is contagious! What's bringing you joy?",
    ],
    "angry": [
        "I can hear the frustration, and it's completely valid.",
        "It sounds like things are really pushing your buttons right now. I'm listening.",
        "I notice that spark of anger. Let's explore what it's trying to tell us.",
    ],
    "fearful": [
        "I'm right here. You're safe to share whatever is on your mind.",
        "It's okay to feel a bit shaky. We can navigate this together.",
        "I notice you're feeling a bit on edge. Let's find some grounding.",
    ],
    "neutral": [
        "I'm listening... tell me more about that.",
        "I'm here with you. What's on your mind?",
        "It's good to be here with you. How are things really going?",
    ],
}

USER_CONTEXT = {}

def get_personalized_response(user_id, text, emotion, name="friend"):
    context = USER_CONTEXT.get(user_id, {"keywords": {}, "name": name, "language": "english"})
    context["name"] = name
    
    new_lang = detect_language_intent(text)
    if new_lang:
        context["language"] = new_lang
    
    text_lower = text.lower()
    hook = random.choice(WARM_HOOKS.get(emotion, WARM_HOOKS["neutral"]))
    
    if name != "friend" and random.random() > 0.5:
        hook = f"{name}, {hook[0].lower()}{hook[1:]}"
    
    important_keywords = ['exams', 'work', 'family', 'relationship', 'sleep', 'money', 'health', 'stress', 'anxiety']
    recall_msg = None
    
    for word in important_keywords:
        if word in text_lower:
            count = context["keywords"].get(word, 0) + 1
            context["keywords"][word] = count
            if count == 2:
                recall_msg = f"You mentioned feeling concerned about {word} earlier. Is that what's on your mind right now?"
            elif count > 2 and random.random() > 0.7:
                recall_msg = f"I know {word} has been a recurring theme for you lately. How are you holding up with that?"

    USER_CONTEXT[user_id] = context
    return hook, recall_msg, context["language"]

def finalize_response(reply, language):
    if not language or language == "english":
        return reply, "en", []
    
    translated_reply = []
    audio_base64_list = []
    lang_code = "en"
    for chunk in reply:
        translated, code = translate_text(chunk, language)
        translated_reply.append(translated)
        lang_code = code
        
        # Generate audio for the translated chunk
        audio_data = generate_audio_base64(translated, code)
        if audio_data:
            audio_base64_list.append(audio_data)
            
    return translated_reply, lang_code, audio_base64_list

def save_chat_history(session_id, user_text, ai_text, scores=None):
    session = None
    if session_id:
        try:
            session = ChatSession.objects.get(id=session_id)
        except ChatSession.DoesNotExist:
            pass
            
    if not session:
        session = ChatSession.objects.create()
        
    distress = None
    if scores:
        distress = scores.get('sad', 0) * 0.7 + scores.get('fearful', 0) * 0.3
        
    if user_text:
        ChatMessage.objects.create(session=session, sender='USER', text=user_text, distress_score=distress)
    if ai_text:
        if isinstance(ai_text, list):
            ai_text = "\n".join(ai_text)
        ChatMessage.objects.create(session=session, sender='AI', text=ai_text)
        
    return session.id

class ChatView(APIView):
    def post(self, request):
        text = request.data.get('text', '')
        emotion = request.data.get('emotion', 'neutral')
        scores = request.data.get('scores', {})
        user_name = request.data.get('user_name', 'friend')
        user_id = request.data.get('user_id', 'anonymous')
        alert_state = request.data.get('alert_state', None)
        session_id = request.data.get('session_id', None)

        # Auto-detect alert state if frontend hasn't sustained one yet
        if not alert_state:
            alert_state = detect_alert_state(text, scores)

        is_crisis = check_crisis(text, scores)
        if is_crisis:
            notify_emergency_contacts(text)
            notify_emergency_contacts_email(text)

        _, _, language = get_personalized_response(user_id, text, emotion, user_name)

        # Build enriched query with alert context for Gemini
        enriched_text = text
        if alert_state == 'panic_loop':
            enriched_text = PANIC_LOOP_PROMPT + '\n\nUser message: ' + text
        elif alert_state == 'lethargy':
            enriched_text = LETHARGY_PROMPT + '\n\nUser message: ' + text

        reply = model_manager.get_response(enriched_text)

        if not reply:
            reply = ["I am here with you. Please tell me more."]
        elif isinstance(reply, str):
            reply = [reply]

        final_reply, lang_code, audio_data = finalize_response(reply, language)
        
        saved_session_id = save_chat_history(session_id, text, final_reply, scores)

        return Response({
            "reply": final_reply,
            "emotion": emotion,
            "language": lang_code,
            "audio_data": audio_data,
            "crisis": is_crisis,
            "alert_state": alert_state,
            "session_id": saved_session_id,
        }, status=status.HTTP_200_OK)

GUIDANCE_RESPONSES = [
    "It's important to remember that mental health is a journey, not a destination. How have you been feeling about your progress lately?",
    "Cognitive Behavioral Therapy (CBT) suggests that our thoughts, feelings, and behaviors are all connected. Can you identify a thought that has been recurring for you?",
    "Practicing mindfulness can help ground you in the present moment. Would you like to try a quick breathing exercise together?",
    "Self-compassion is a key pillar of mental well-being. If a friend were going through what you are, what kind words would you offer them?",
    "Sometimes, naming a feeling is the first step toward managing it. If you had to describe your current state as a weather pattern, what would it be?",
]

class ProactiveCounselorView(APIView):
    def post(self, request):
        emotion = request.data.get('emotion', 'neutral')
        reply = model_manager.get_response(emotion)
        
        if not reply:
            reply = ["I am here whenever you are ready to talk."]
        
        return Response({
            "reply": reply,
            "emotion": emotion,
            "proactive": True
        }, status=status.HTTP_200_OK)

class CounselorView(APIView):
    def post(self, request):
        text = request.data.get('text', '')
        emotion = request.data.get('emotion', 'neutral')
        scores = request.data.get('scores', {})
        user_name = request.data.get('user_name', 'friend')
        user_id = request.data.get('user_id', 'anonymous')
        alert_state = request.data.get('alert_state', None)
        session_id = request.data.get('session_id', None)

        if not alert_state:
            alert_state = detect_alert_state(text, scores)

        is_crisis = check_crisis(text, scores)
        if is_crisis:
            notify_emergency_contacts(text)
            notify_emergency_contacts_email(text)

        _, _, language = get_personalized_response(user_id, text, emotion, user_name)

        enriched_text = text
        if alert_state == 'panic_loop':
            enriched_text = PANIC_LOOP_PROMPT + '\n\nUser message: ' + text
        elif alert_state == 'lethargy':
            enriched_text = LETHARGY_PROMPT + '\n\nUser message: ' + text

        reply = model_manager.get_response(enriched_text)

        if not reply:
            reply = ["I'm listening. Please continue."]
        elif isinstance(reply, str):
            reply = [reply]

        final_reply, lang_code, audio_data = finalize_response(reply, language)

        saved_session_id = save_chat_history(session_id, text, final_reply, scores)

        return Response({
            "reply": final_reply,
            "emotion": emotion,
            "language": lang_code,
            "audio_data": audio_data,
            "style": "guidance",
            "crisis": is_crisis,
            "alert_state": alert_state,
            "session_id": saved_session_id,
        }, status=status.HTTP_200_OK)

class ESConvCounselorView(APIView):
    def post(self, request):
        text = request.data.get('text', '')
        emotion = request.data.get('emotion', 'neutral')
        scores = request.data.get('scores', {})
        user_name = request.data.get('user_name', 'friend')
        user_id = request.data.get('user_id', 'anonymous')
        alert_state = request.data.get('alert_state', None)
        session_id = request.data.get('session_id', None)

        if not alert_state:
            alert_state = detect_alert_state(text, scores)

        is_crisis = check_crisis(text, scores)
        if is_crisis:
            notify_emergency_contacts(text)
            notify_emergency_contacts_email(text)

        _, _, language = get_personalized_response(user_id, text, emotion, user_name)

        enriched_text = text
        if alert_state == 'panic_loop':
            enriched_text = PANIC_LOOP_PROMPT + '\n\nUser message: ' + text
        elif alert_state == 'lethargy':
            enriched_text = LETHARGY_PROMPT + '\n\nUser message: ' + text

        reply = esconv_manager.get_response(enriched_text)

        if not reply:
            reply = model_manager.get_response(enriched_text)
            if not reply:
                reply = ["I hear you. Let's explore that further."]

        if isinstance(reply, str):
            reply = [reply]

        final_reply, lang_code, audio_data = finalize_response(reply, language)

        saved_session_id = save_chat_history(session_id, text, final_reply, scores)

        return Response({
            "reply": final_reply,
            "emotion": emotion,
            "language": lang_code,
            "audio_data": audio_data,
            "style": "esconv",
            "crisis": is_crisis,
            "alert_state": alert_state,
            "session_id": saved_session_id,
        }, status=status.HTTP_200_OK)
