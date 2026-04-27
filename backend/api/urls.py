from django.urls import path
from .views import ChatView, CounselorView, ESConvCounselorView, EmotionDetectionView, ProactiveCounselorView, EmergencyContactView, ContactDeleteView

urlpatterns = [
    path('chat/', ChatView.as_view(), name='chat'),
    path('counselor/', CounselorView.as_view(), name='counselor'),
    path('esconv-counselor/', ESConvCounselorView.as_view(), name='esconv-counselor'),
    path('proactive-counselor/', ProactiveCounselorView.as_view(), name='proactive-counselor'),
    path('detect-emotion/', EmotionDetectionView.as_view(), name='detect-emotion'),
    path('contacts/', EmergencyContactView.as_view(), name='contacts'),
    path('contacts/<int:pk>/', ContactDeleteView.as_view(), name='contact-delete'),
]
