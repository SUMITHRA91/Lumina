import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 
import keras

@keras.saving.register_keras_serializable()
class PatchedDense(keras.layers.Dense):
    def __init__(self, *args, **kwargs):
        # Pop the problematic quantization_config if it exists
        kwargs.pop('quantization_config', None)
        super().__init__(*args, **kwargs)

def check_model():
    model_path = 'model/emotion_model.keras'
    print(f"Loading model with patched Dense layer...")
    try:
        # Register the patched layer as 'Dense' in the loading context
        with keras.utils.custom_object_scope({'Dense': PatchedDense}):
            model = keras.saving.load_model(model_path, compile=False)
        print("Model loaded successfully!")
        print(f"Input shape: {model.input_shape}")
        print(f"Output shape: {model.output_shape}")
        
        # Test with a dummy input
        import numpy as np
        dummy_input = np.zeros((1,) + model.input_shape[1:])
        prediction = model.predict(dummy_input, verbose=0)
        print(f"Prediction successful. Output length: {prediction.shape[1]}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_model()
