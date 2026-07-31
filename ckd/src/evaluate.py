import os
import sys
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score,
    classification_report, confusion_matrix, roc_curve
)

src_dir = os.path.dirname(os.path.abspath(__file__))
if src_dir not in sys.path:
    sys.path.append(src_dir)

from data_preprocessing import get_feature_names


def evaluate_model(model, preprocessor, X_val, y_val, outputs_dir: str, best_params: dict = None) -> dict:
    """
    Evaluates trained XGBoost model on validation set:
    - Calculates Accuracy, Precision, Recall, F1-score, ROC-AUC.
    - Generates Classification Report.
    - Saves metrics.json.
    - Generates & saves Confusion Matrix, ROC Curve, Feature Importance plots.
    """
    os.makedirs(outputs_dir, exist_ok=True)
    
    X_val_trans = preprocessor.transform(X_val)
    y_pred = model.predict(X_val_trans)
    y_proba = model.predict_proba(X_val_trans)[:, 1]
    
    accuracy = float(accuracy_score(y_val, y_pred))
    precision = float(precision_score(y_val, y_pred, zero_division=0))
    recall = float(recall_score(y_val, y_pred, zero_division=0))
    f1 = float(f1_score(y_val, y_pred, zero_division=0))
    roc_auc = float(roc_auc_score(y_val, y_proba))
    
    cls_report = classification_report(
        y_val, y_pred, target_names=['Not CKD (0)', 'CKD (1)'], output_dict=True
    )
    cls_report_str = classification_report(
        y_val, y_pred, target_names=['Not CKD (0)', 'CKD (1)']
    )
    
    metrics = {
        "accuracy": round(accuracy, 4),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "roc_auc_score": round(roc_auc, 4),
        "best_hyperparameters": best_params if best_params else {},
        "classification_report": cls_report
    }
    
    print("\n==================== MODEL EVALUATION METRICS ====================")
    print(f"Accuracy:        {accuracy:.4f}")
    print(f"Precision:       {precision:.4f}")
    print(f"Recall:          {recall:.4f}")
    print(f"F1-Score:        {f1:.4f}")
    print(f"ROC-AUC Score:   {roc_auc:.4f}")
    print("\nClassification Report:\n" + cls_report_str)
    print("=================================================================\n")
    
    metrics_path = os.path.join(outputs_dir, "metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=4)
    print(f"Saved evaluation metrics to: {metrics_path}")
    
    sns.set_theme(style="whitegrid")
    
    # 1. Confusion Matrix Plot
    cm = confusion_matrix(y_val, y_pred)
    plt.figure(figsize=(6, 5))
    sns.heatmap(
        cm, annot=True, fmt='d', cmap='Blues', cbar=False,
        xticklabels=['Not CKD', 'CKD'], yticklabels=['Not CKD', 'CKD'],
        annot_kws={'size': 14, 'weight': 'bold'}
    )
    plt.title('Confusion Matrix - CKD Prediction', fontsize=14, pad=12, fontweight='bold')
    plt.xlabel('Predicted Label', fontsize=12)
    plt.ylabel('True Label', fontsize=12)
    plt.tight_layout()
    cm_path = os.path.join(outputs_dir, "confusion_matrix.png")
    plt.savefig(cm_path, dpi=300)
    plt.close()
    print(f"Saved confusion matrix plot to: {cm_path}")
    
    # 2. ROC Curve Plot
    fpr, tpr, _ = roc_curve(y_val, y_proba)
    plt.figure(figsize=(7, 5.5))
    plt.plot(fpr, tpr, color='#1f77b4', lw=2.5, label=f'XGBoost ROC (AUC = {roc_auc:.4f})')
    plt.plot([0, 1], [0, 1], color='gray', lw=1.5, linestyle='--', label='Random Classifier')
    plt.xlim([-0.02, 1.02])
    plt.ylim([-0.02, 1.05])
    plt.xlabel('False Positive Rate', fontsize=12)
    plt.ylabel('True Positive Rate', fontsize=12)
    plt.title('Receiver Operating Characteristic (ROC) Curve', fontsize=14, pad=12, fontweight='bold')
    plt.legend(loc="lower right", fontsize=11)
    plt.tight_layout()
    roc_path = os.path.join(outputs_dir, "roc_curve.png")
    plt.savefig(roc_path, dpi=300)
    plt.close()
    print(f"Saved ROC curve plot to: {roc_path}")
    
    # 3. Feature Importance Plot
    feature_names = get_feature_names(preprocessor)
    importances = model.feature_importances_
    feat_df = pd.DataFrame({
        'Feature': feature_names,
        'Importance': importances
    }).sort_values(by='Importance', ascending=False)
    
    top_features = feat_df.head(15)
    plt.figure(figsize=(9, 6))
    sns.barplot(x='Importance', y='Feature', data=top_features, palette='viridis', hue='Feature', legend=False)
    plt.title('Top 15 Feature Importances (XGBoost)', fontsize=14, pad=12, fontweight='bold')
    plt.xlabel('Relative Importance Score', fontsize=12)
    plt.ylabel('Feature', fontsize=12)
    plt.tight_layout()
    fi_path = os.path.join(outputs_dir, "feature_importance.png")
    plt.savefig(fi_path, dpi=300)
    plt.close()
    print(f"Saved feature importance plot to: {fi_path}")
    
    return metrics
