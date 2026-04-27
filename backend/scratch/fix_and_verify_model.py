import json
import os
import keras
import numpy as np

def fix_config():
    config_path = 'model/temp_model/config.json'
    with open(config_path, 'r') as f:
        config = json.load(f)
    
    # Recursively remove 'quantization_config'
    def clean_dict(d):
        if isinstance(d, dict):
            if 'quantization_config' in d:
                print(f"Removing quantization_config from {d.get('name', 'unknown layer')}")
                del d['quantization_config']
            for k, v in d.items():
                clean_dict(v)
        elif isinstance(d, list):
            for item in d:
                clean_dict(item)
    
    clean_dict(config)
    
    with open(config_path, 'w') as f:
        json.dump(config, f)
    print("Fixed config.json")

def verify_load():
    model_dir = 'model/temp_model'
    print(f"Loading model from directory {model_dir}...")
    try:
        model = keras.saving.load_model(model_dir, compile=False)
        print("Model loaded successfully!")
        print(f"Input shape: {model.input_shape}")
        
        # Test prediction
        dummy = np.zeros((1, 48, 48, 1))
        pred = model.predict(dummy, verbose=0)
        print(f"Prediction output shape: {pred.shape}")
        
        # Save fixed model back to .keras format
        fixed_path = 'model/emotion_model_fixed.keras'
        model.save(fixed_path)
        print(f"Saved fixed model to {fixed_path}")
        
    except Exception as e:
        print(f"Error loading: {e}")

if __name__ == "__main__":
    fix_config()
    verify_load()
