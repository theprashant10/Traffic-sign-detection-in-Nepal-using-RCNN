from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
from utils import preprocess_image
from PIL import Image
import numpy as np
import json

app = Flask(__name__)
CORS(app)

# Load model once
try:
    model = load_model('traffic_sign_model.h5')
    print("✅ Model loaded successfully")
except Exception as e:
    print("❌ Error loading model:", str(e))

# Load labels
try:
    with open('labels.json') as f:
        labels = json.load(f)
    print("✅ Labels loaded successfully")
    print("🔍 Loaded labels:", labels)

except Exception as e:
    print("❌ Error loading labels:", str(e))
    labels = {}

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        # Read and preprocess image
        img = Image.open(file.stream)
        img_preprocessed = preprocess_image(img)
        print("Image shape:", img_preprocessed.shape)

        # Predict
        preds = model.predict(img_preprocessed)
        print("Prediction:", preds)

        class_idx = int(np.argmax(preds))
        confidence = float(np.max(preds))
        class_name = labels.get(str(class_idx), 'Unknown')

        return jsonify({
            'class': class_name,
            'confidence': confidence
        })

    except Exception as e:
        print("❌ Prediction error:", str(e))
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
