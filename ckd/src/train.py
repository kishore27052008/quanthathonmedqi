import os
import sys
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, RandomizedSearchCV
from xgboost import XGBClassifier

src_dir = os.path.dirname(os.path.abspath(__file__))
if src_dir not in sys.path:
    sys.path.append(src_dir)

from data_preprocessing import (
    clean_dataframe, explore_dataset, build_preprocessing_pipeline,
    NUMERICAL_COLS, CATEGORICAL_COLS, TARGET_COL, ID_COL
)


def train_ckd_model(data_path: str, models_dir: str):
    """
    Main training workflow:
    1. Loads Excel data using pandas read_excel().
    2. Explores dataset.
    3. Cleans data and extracts features X and target y.
    4. Splits data 80/20 with stratification.
    5. Fits preprocessing pipeline.
    6. Performs RandomizedSearchCV for XGBClassifier hyperparameter tuning.
    7. Retrains best XGBoost model.
    8. Saves model & pipeline artifacts.
    """
    os.makedirs(models_dir, exist_ok=True)
    print(f"Loading training data from: {data_path}")
    raw_df = pd.read_excel(data_path)
    
    explore_dataset(raw_df, "Raw Training Dataset")
    cleaned_df = clean_dataframe(raw_df)
    
    if TARGET_COL not in cleaned_df.columns:
        raise ValueError(f"Target column '{TARGET_COL}' not found in training dataset.")
        
    y = cleaned_df[TARGET_COL]
    cols_to_drop = [c for c in [ID_COL, TARGET_COL] if c in cleaned_df.columns]
    X = cleaned_df.drop(columns=cols_to_drop)
    
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Train set shape: {X_train.shape}, Validation set shape: {X_val.shape}")
    print(f"Train target distribution: 1 (CKD): {(y_train == 1).sum()}, 0 (Not CKD): {(y_train == 0).sum()}")
    print(f"Val target distribution:   1 (CKD): {(y_val == 1).sum()}, 0 (Not CKD): {(y_val == 0).sum()}")
    
    preprocessor = build_preprocessing_pipeline(NUMERICAL_COLS, CATEGORICAL_COLS)
    X_train_trans = preprocessor.fit_transform(X_train)
    X_val_trans = preprocessor.transform(X_val)
    
    pipeline_path = os.path.join(models_dir, "preprocessing_pipeline.pkl")
    joblib.dump(preprocessor, pipeline_path)
    print(f"\nSaved preprocessing pipeline to: {pipeline_path}")
    
    param_dist = {
        'n_estimators': [50, 100, 150, 200, 250],
        'max_depth': [3, 4, 5, 6, 7],
        'learning_rate': [0.01, 0.03, 0.05, 0.1, 0.2],
        'subsample': [0.6, 0.7, 0.8, 0.9, 1.0],
        'colsample_bytree': [0.6, 0.7, 0.8, 0.9, 1.0],
        'min_child_weight': [1, 2, 3, 5],
        'gamma': [0, 0.1, 0.2, 0.3],
        'scale_pos_weight': [1, 1.2, 1.5]
    }
    
    xgb_base = XGBClassifier(eval_metric='logloss', random_state=42)
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    print("\nRunning RandomizedSearchCV for XGBoost hyperparameter tuning (25 iterations)...")
    random_search = RandomizedSearchCV(
        estimator=xgb_base,
        param_distributions=param_dist,
        n_iter=25,
        scoring='roc_auc',
        cv=cv,
        verbose=1,
        random_state=42,
        n_jobs=-1
    )
    random_search.fit(X_train_trans, y_train)
    
    best_params = random_search.best_params_
    best_score = random_search.best_score_
    
    print(f"\nBest Cross-Validation ROC-AUC Score: {best_score:.4f}")
    print("Best Hyperparameters:")
    for k, v in best_params.items():
        print(f"  - {k}: {v}")
        
    best_model = random_search.best_estimator_
    model_path = os.path.join(models_dir, "ckd_xgboost.pkl")
    joblib.dump(best_model, model_path)
    print(f"\nSaved trained XGBoost model to: {model_path}")
    
    return {
        'model': best_model,
        'preprocessor': preprocessor,
        'X_val': X_val,
        'y_val': y_val,
        'X_val_trans': X_val_trans,
        'best_params': best_params,
        'best_cv_score': best_score
    }


if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    train_excel_path = os.path.join(base_dir, "kidney_disease_train.xlsx")
    models_dir = os.path.join(base_dir, "models")
    train_ckd_model(train_excel_path, models_dir)
