import os
import cv2
import numpy as np
import keras
import base64
import logging
from PIL import Image
import io

logger = logging.getLogger(__name__)

class EmotionDetector:
    _instance = None
    LABELS = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmotionDetector, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_path = os.path.join(base_dir, 'model', 'emotion_model_fixed.keras')
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        
        try:
            self.model = keras.saving.load_model(model_path, compile=False)
            self.face_cascade = cv2.CascadeClassifier(cascade_path)
            self._initialized = True
            logger.info("Emotion model and Face Cascade loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load emotion detection assets: {e}")

    def predict_emotion(self, image_base64):
        if not self._initialized:
            return None, "Model not initialized", None

        try:
            # Decode base64 image
            if ',' in image_base64:
                image_base64 = image_base64.split(',')[1]
            
            image_data = base64.b64decode(image_base64)
            image = Image.open(io.BytesIO(image_data))
            frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            posture_feedback = {
                "shoulders_raised": False,
                "leaning_forward": False,
                "detected": False
            }

            # Detect faces
            faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
            
            if len(faces) == 0:
                return None, "No face detected", posture_feedback
            
            (x, y, w, h) = faces[0]
            
            # --- POSTURE DETECTION HEURISTIC ---
            # Using face bounding box position to infer posture
            frame_h, frame_w = gray.shape
            
            # If face is very large, they are leaning forward
            if w > frame_w * 0.45 or h > frame_h * 0.45:
                posture_feedback["leaning_forward"] = True
                
            # If face is unusually low in the frame, they might be hunched/shoulders raised
            if y > frame_h * 0.35:
                posture_feedback["shoulders_raised"] = True
                
            posture_feedback["detected"] = True

            roi_gray = gray[y:y+h, x:x+w]
            roi_gray = cv2.resize(roi_gray, (48, 48), interpolation=cv2.INTER_AREA)
            
            roi = roi_gray.astype('float32') / 255.0
            roi = np.expand_dims(roi, axis=0)
            roi = np.expand_dims(roi, axis=-1)
            
            preds = self.model.predict(roi, verbose=0)[0]
            label = self.LABELS[preds.argmax()]
            scores = {self.LABELS[i]: float(preds[i]) for i in range(len(self.LABELS))}
            
            return scores, label, posture_feedback
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return None, str(e), None

emotion_detector = EmotionDetector()
