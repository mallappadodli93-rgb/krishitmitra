"""
AgriSmart AI - OpenCV Image Processing Utilities
Provides helper functions to decode, validate, and preprocess crop and pest images.
"""

import cv2
import numpy as np
from typing import Tuple, Optional
from utils.logger import get_logger

logger = get_logger("ImageUtils")


def decode_image_bytes(image_bytes: bytes) -> Optional[np.ndarray]:
    """
    Decodes raw image bytes uploaded via FastAPI into an OpenCV BGR image array.

    Args:
        image_bytes (bytes): Binary content of an uploaded image file.

    Returns:
        np.ndarray: OpenCV image in BGR format, or None if decoding fails.
    """
    try:
        # Convert bytes buffer to 1D uint8 numpy array
        np_arr = np.frombuffer(image_bytes, np.uint8)
        # Decode the image using OpenCV
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if image is None:
            logger.error("Failed to decode image bytes: returned None")
            return None
        return image
    except Exception as e:
        logger.error(f"Error decoding image: {str(e)}")
        return None


def preprocess_for_model(
    image: np.ndarray,
    target_size: Tuple[int, int] = (224, 224),
    normalize: bool = True
) -> np.ndarray:
    """
    Preprocesses an OpenCV image for input into a TensorFlow/Keras model.

    Steps performed:
    1. Converts OpenCV BGR color space to RGB color space.
    2. Resizes the image to the model's required input dimensions (e.g., 224x224).
    3. Normalizes pixel values from [0, 255] to [0.0, 1.0] if requested.
    4. Adds a batch dimension (shape becomes: [1, height, width, channels]).

    Args:
        image (np.ndarray): Input OpenCV image in BGR format.
        target_size (Tuple[int, int]): Required model input dimension (width, height).
        normalize (bool): Whether to scale pixel values between 0.0 and 1.0.

    Returns:
        np.ndarray: Batch-ready image tensor for TensorFlow inference.
    """
    # Step 1: Convert BGR (OpenCV default) to RGB (standard for Deep Learning models)
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Step 2: Resize image to target dimensions
    resized_image = cv2.resize(rgb_image, target_size, interpolation=cv2.INTER_LINEAR)

    # Step 3: Convert to float32
    processed = resized_image.astype(np.float32)

    # Step 4: Normalize pixel values if enabled
    if normalize:
        processed = processed / 255.0

    # Step 5: Add batch dimension -> (1, height, width, 3)
    batched_image = np.expand_dims(processed, axis=0)
    return batched_image

