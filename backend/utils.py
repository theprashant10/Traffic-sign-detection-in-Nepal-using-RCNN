from PIL import Image
import numpy as np

def preprocess_image(img, target_size=(224, 224)):
    img = img.convert('RGB')
    img = img.resize(target_size)
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)  # Shape: (1, 64, 64, 3)
    return img_array
