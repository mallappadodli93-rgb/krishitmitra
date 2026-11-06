"""
AgriSmart AI - Crop Image Classification Model Training Script
Trains a Keras Convolutional Neural Network for identifying crop types from field photos.

NOTE: Run this script after placing crop category images in 'data/raw/crop_types'.
"""

import os
import json
import tensorflow as tf
from tensorflow.keras import layers, models
from utils.logger import get_logger

logger = get_logger("TrainCropModel")


def build_crop_classifier(num_classes: int, input_shape=(224, 224, 3)) -> tf.keras.Model:
    """
    Builds a transfer learning model using EfficientNetB0 or MobileNetV2.
    """
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=input_shape,
        include_top=False,
        weights='imagenet'
    )
    base_model.trainable = False

    model = models.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dropout(0.2),
        layers.Dense(128, activation='relu'),
        layers.Dense(num_classes, activation='softmax')
    ])

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    return model


def train_crop_model(
    dataset_dir: str = "data/raw/crop_types",
    output_model_path: str = "saved_models/crop_models/crop_classifier_model.keras",
    labels_output_path: str = "saved_models/crop_models/classes.json",
    image_size: tuple = (224, 224),
    batch_size: int = 32,
    epochs: int = 10
):
    """
    Trains crop classifier on image folders.
    """
    if not os.path.exists(dataset_dir):
        logger.error(
            f"Dataset directory '{dataset_dir}' not found! "
            f"Please organize crop images by class inside '{dataset_dir}'."
        )
        return

    train_ds = tf.keras.utils.image_dataset_from_directory(
        dataset_dir,
        validation_split=0.2,
        subset="training",
        seed=42,
        image_size=image_size,
        batch_size=batch_size,
        label_mode='categorical'
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        dataset_dir,
        validation_split=0.2,
        subset="validation",
        seed=42,
        image_size=image_size,
        batch_size=batch_size,
        label_mode='categorical'
    )

    class_names = train_ds.class_names
    num_classes = len(class_names)
    logger.info(f"Training on {num_classes} crop classes: {class_names}")

    model = build_crop_classifier(num_classes=num_classes)
    model.fit(train_ds, validation_data=val_ds, epochs=epochs)

    os.makedirs(os.path.dirname(output_model_path), exist_ok=True)
    model.save(output_model_path)
    logger.info(f"Crop classifier saved to {output_model_path}")

    with open(labels_output_path, "w") as f:
        json.dump(class_names, f, indent=4)
    logger.info(f"Class labels saved to {labels_output_path}")


if __name__ == "__main__":
    logger.info("Crop classification training script template ready.")
    logger.info("Place training data into 'data/raw/crop_types' and execute this file.")

