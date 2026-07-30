import os
import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder

NUMERICAL_COLS = ['age', 'bp', 'sg', 'al', 'su', 'bgr', 'bu', 'sc', 'sod', 'pot', 'hemo', 'pcv', 'wc', 'rc']
CATEGORICAL_COLS = ['rbc', 'pc', 'pcc', 'ba', 'htn', 'dm', 'cad', 'appet', 'pe', 'ane']
TARGET_COL = 'classification'
ID_COL = 'id'


def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans raw CKD dataset:
    - Strips whitespace and tabs from string columns.
    - Standardizes categorical values.
    - Forces numeric conversion for numerical columns (pcv, wc, rc, etc.).
    """
    df_clean = df.copy()
    for col in df_clean.columns:
        if df_clean[col].dtype == object or isinstance(df_clean[col].dtype, pd.StringDtype):
            df_clean[col] = df_clean[col].astype(str).str.strip()
            df_clean[col] = df_clean[col].replace({
                '\t': '', 'nan': np.nan, '?': np.nan, 'None': np.nan,
                '\tyes': 'yes', '\tno': 'no', ' yes': 'yes',
                'ckd\t': 'ckd'
            })
            
    for col in NUMERICAL_COLS:
        if col in df_clean.columns:
            df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce')
            
    if TARGET_COL in df_clean.columns:
        df_clean[TARGET_COL] = df_clean[TARGET_COL].replace({'ckd': 1, 'notckd': 0, 'ckd\t': 1})
        df_clean[TARGET_COL] = pd.to_numeric(df_clean[TARGET_COL], errors='coerce')
        
    return df_clean


def explore_dataset(df: pd.DataFrame, dataset_name: str = "Training Dataset"):
    """
    Displays dataset shape, column names, data types, missing values, and target class distribution.
    """
    print(f"\n==================== {dataset_name.upper()} EXPLORATION ====================")
    print(f"Dataset Shape: {df.shape[0]} rows, {df.shape[1]} columns\n")
    print("Column Names & Data Types:")
    for col in df.columns:
        missing_cnt = df[col].isnull().sum()
        missing_pct = (missing_cnt / len(df)) * 100
        print(f" - {col:<16}: {str(df[col].dtype):<10} | Missing: {missing_cnt:<4} ({missing_pct:.1f}%)")
        
    if TARGET_COL in df.columns:
        print("\nTarget Class Distribution:")
        dist = df[TARGET_COL].value_counts(dropna=False)
        for val, count in dist.items():
            pct = (count / len(df)) * 100
            print(f"   Class {val}: {count} ({pct:.2f}%)")
    print("========================================================================\n")


def build_preprocessing_pipeline(num_cols=NUMERICAL_COLS, cat_cols=CATEGORICAL_COLS) -> ColumnTransformer:
    """
    Constructs a scikit-learn ColumnTransformer:
    - Numerical: SimpleImputer(strategy='median')
    - Categorical: SimpleImputer(strategy='most_frequent') + OneHotEncoder(handle_unknown='ignore')
    """
    num_pipeline = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median'))
    ])
    
    cat_pipeline = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', num_pipeline, num_cols),
            ('cat', cat_pipeline, cat_cols)
        ],
        remainder='drop'
    )
    return preprocessor


def get_feature_names(preprocessor: ColumnTransformer, num_cols=NUMERICAL_COLS, cat_cols=CATEGORICAL_COLS) -> list:
    """
    Extracts feature names after one-hot encoding transformation.
    """
    cat_encoder = preprocessor.named_transformers_['cat'].named_steps['encoder']
    encoded_cat_features = list(cat_encoder.get_feature_names_out(cat_cols))
    return list(num_cols) + encoded_cat_features
