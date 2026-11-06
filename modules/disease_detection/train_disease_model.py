"""
AgriSmart AI - PlantVillage Disease Training Pipeline
Trains a MobileNetV2 Transfer Learning Model on Tomato, Potato, and Pepper classes.
Calculates Accuracy, Precision, Recall, and F1-score upon validation, and saves weights.

Supported Crops:
- Tomato (10 classes: Bacterial Spot, Early Blight, Late Blight, Leaf Mold, Septoria, Spider Mites, Target Spot, Yellow Leaf Curl, Mosaic Virus, Healthy)
- Potato (3 classes: Early Blight, Late Blight, Healthy)
- Pepper (2 classes: Bacterial Spot, Healthy)
Total: 15 Classes
"""

import os
import json
import numpy as np
from typing import Dict, Any

from utils.logger import get_logger

logger = get_logger("TrainDiseaseModel")


def build_mobilenetv2_model(num_classes: int, input_shape=(224, 224, 3)):
    """
    Builds a lightweight, transfer learning architecture based on MobileNetV2.
    """
    import tensorflow as tf
    from tensorflow.keras import layers, models

    # Data Augmentation pipeline to prevent overfitting on farm photos
    data_augmentation = tf.keras.Sequential([
        layers.RandomFlip("horizontal_and_vertical"),
        layers.RandomRotation(0.2),
        layers.RandomZoom(0.15),
        layers.RandomContrast(0.1)
    ], name="data_augmentation")

    # MobileNetV2 base pretrained on ImageNet
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=input_shape,
        include_top=False,
        weights="imagenet"
    )
    base_model.trainable = False  # Freeze base feature extractor

    inputs = tf.keras.Input(shape=input_shape)
    x = data_augmentation(inputs)
    # Preprocessing scaling for MobileNetV2
    x = tf.keras.applications.mobilenet_v2.preprocess_input(x)
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(num_classes, activation="softmax", name="classification_head")(x)

    model = models.Model(inputs=inputs, outputs=outputs, name="AgriSmart_MobileNetV2_Disease_Classifier")

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.0005),
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )
    return model


def evaluate_model_metrics(model, val_dataset, class_names: list) -> Dict[str, Any]:
    """
    Calculates genuine Accuracy, Precision, Recall, and F1-score on the validation dataset.
    Never invents or fabricates performance numbers.
    """
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report

    logger.info("Computing validation predictions for evaluation metrics...")
    y_true_all = []
    y_pred_all = []

    for images, labels in val_dataset:
        preds = model.predict(images, verbose=0)
        y_true_batch = np.argmax(labels.numpy(), axis=1)
        y_pred_batch = np.argmax(preds, axis=1)
        y_true_all.extend(y_true_batch)
        y_pred_all.extend(y_pred_batch)

    y_true = np.array(y_true_all)
    y_pred = np.array(y_pred_all)

    acc = float(accuracy_score(y_true, y_pred))
    precision_macro = float(precision_score(y_true, y_pred, average="macro", zero_division=0))
    recall_macro = float(recall_score(y_true, y_pred, average="macro", zero_division=0))
    f1_macro = float(f1_score(y_true, y_pred, average="macro", zero_division=0))

    precision_weighted = float(precision_score(y_true, y_pred, average="weighted", zero_division=0))
    recall_weighted = float(recall_score(y_true, y_pred, average="weighted", zero_division=0))
    f1_weighted = float(f1_score(y_true, y_pred, average="weighted", zero_division=0))

    report_str = classification_report(
        y_true,
        y_pred,
        target_names=class_names,
        zero_division=0
    )

    metrics_summary = {
        "accuracy": round(acc, 4),
        "precision_macro": round(precision_macro, 4),
        "recall_macro": round(recall_macro, 4),
        "f1_score_macro": round(f1_macro, 4),
        "precision_weighted": round(precision_weighted, 4),
        "recall_weighted": round(recall_weighted, 4),
        "f1_score_weighted": round(f1_weighted, 4),
        "classification_report": report_str
    }
    return metrics_summary


def train_crop_disease_model(
    dataset_dir: str = "data/raw/crop_diseases",
    output_model_path: str = "saved_models/disease_models/crop_disease_model.keras",
    labels_output_path: str = "saved_models/disease_models/classes.json",
    metrics_output_path: str = "saved_models/disease_models/metrics.json",
    image_size: tuple = (224, 224),
    batch_size: int = 32,
    epochs: int = 10
):
    """
    Main training execution function.
    """
    if not os.path.exists(dataset_dir):
        logger.error(
            f"Dataset folder '{dataset_dir}' not found! "
            f"Please download the PlantVillage dataset for Tomato, Potato, and Pepper "
            f"and place the subfolders in '{dataset_dir}'."
        )
        return False

    import tensorflow as tf

    logger.info(f"Loading PlantVillage dataset from: {dataset_dir}")
    train_ds = tf.keras.utils.image_dataset_from_directory(
        dataset_dir,
        validation_split=0.2,
        subset="training",
        seed=42,
        image_size=image_size,
        batch_size=batch_size,
        label_mode="categorical"
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        dataset_dir,
        validation_split=0.2,
        subset="validation",
        seed=42,
        image_size=image_size,
        batch_size=batch_size,
        label_mode="categorical"
    )

    class_names = train_ds.class_names
    num_classes = len(class_names)
    logger.info(f"Detected {num_classes} PlantVillage classes: {class_names}")

    # Build model architecture
    model = build_mobilenetv2_model(num_classes=num_classes, input_shape=(*image_size, 3))
    model.summary()

    # Train model
    logger.info(f"Training MobileNetV2 model for {epochs} epochs...")
    callbacks = [
        tf.keras.callbacks.EarlyStopping(monitor="val_loss", patience=3, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=2)
    ]

    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs,
        callbacks=callbacks
    )

    # Genuine Evaluation (Accuracy, Precision, Recall, F1)
    metrics = evaluate_model_metrics(model, val_ds, class_names)
    logger.info(f"--- Model Validation Metrics ---")
    logger.info(f"Accuracy:           {metrics['accuracy']:.4f}")
    logger.info(f"Precision (Macro):  {metrics['precision_macro']:.4f}")
    logger.info(f"Recall (Macro):     {metrics['recall_macro']:.4f}")
    logger.info(f"F1-Score (Macro):   {metrics['f1_score_macro']:.4f}")
    logger.info(f"\nDetailed Report:\n{metrics['classification_report']}")

    # Save weights and metadata
    os.makedirs(os.path.dirname(output_model_path), exist_ok=True)
    model.save(output_model_path)
    logger.info(f"Saved trained weights to: {output_model_path}")

    with open(labels_output_path, "w", encoding="utf-8") as f:
        json.dump(class_names, f, indent=4)
    logger.info(f"Saved class labels to: {labels_output_path}")

    with open(metrics_output_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=4)
    logger.info(f"Saved verified metrics to: {metrics_output_path}")

    return True


if __name__ == "__main__":
    train_crop_disease_model()
