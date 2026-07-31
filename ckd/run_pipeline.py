import os
import sys
import pandas as pd
import json

# Add src to python path
src_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src")
sys.path.append(src_dir)

from data_preprocessing import clean_dataframe, explore_dataset
from train import train_ckd_model
from evaluate import evaluate_model
from predict import predict_ckd_risk


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    train_excel_path = os.path.join(base_dir, "kidney_disease_train.xlsx")
    test_excel_path = os.path.join(base_dir, "kidney_disease_test.xlsx")
    models_dir = os.path.join(base_dir, "models")
    outputs_dir = os.path.join(base_dir, "outputs")
    
    print("\n" + "="*80)
    print("      CHRONIC KIDNEY DISEASE (CKD) RISK PREDICTION ML PIPELINE")
    print("="*80)
    
    # 1. Load Excel training data directly using pandas read_excel()
    print(f"\n[STEP 1] Loading training dataset using pandas read_excel(): {train_excel_path}")
    raw_train_df = pd.read_excel(train_excel_path)
    
    # Explore dataset
    explore_dataset(raw_train_df, "Train Dataset (Excel)")
    
    # 2. Train Model & Perform Hyperparameter Tuning
    print("\n[STEP 2] Training XGBoost Classifier with 80/20 Train-Validation Split & RandomizedSearchCV...")
    train_results = train_ckd_model(train_excel_path, models_dir)
    
    model = train_results['model']
    preprocessor = train_results['preprocessor']
    X_val = train_results['X_val']
    y_val = train_results['y_val']
    best_params = train_results['best_params']
    
    # 3. Model Evaluation & Artifact Generation
    print("\n[STEP 3] Evaluating Model & Saving Artifacts (Plots & metrics.json)...")
    metrics = evaluate_model(model, preprocessor, X_val, y_val, outputs_dir, best_params)
    
    # 4. Test Reusable Prediction Function with Sample Patients
    print("\n[STEP 4] Testing Reusable predict_ckd_risk() Function...")
    
    # High Risk Sample Patient
    sample_high_risk = {
        'age': 65.0, 'bp': 90.0, 'sg': 1.010, 'al': 3.0, 'su': 1.0,
        'rbc': 'abnormal', 'pc': 'abnormal', 'pcc': 'present', 'ba': 'present',
        'bgr': 250.0, 'bu': 75.0, 'sc': 4.8, 'sod': 128.0, 'pot': 5.2,
        'hemo': 8.5, 'pcv': 28.0, 'wc': '12500', 'rc': '3.2',
        'htn': 'yes', 'dm': 'yes', 'cad': 'yes', 'appet': 'poor', 'pe': 'yes', 'ane': 'yes'
    }
    
    # Low Risk Sample Patient
    sample_low_risk = {
        'age': 35.0, 'bp': 70.0, 'sg': 1.025, 'al': 0.0, 'su': 0.0,
        'rbc': 'normal', 'pc': 'normal', 'pcc': 'notpresent', 'ba': 'notpresent',
        'bgr': 95.0, 'bu': 18.0, 'sc': 0.8, 'sod': 142.0, 'pot': 4.2,
        'hemo': 16.0, 'pcv': 48.0, 'wc': '7200', 'rc': '5.2',
        'htn': 'no', 'dm': 'no', 'cad': 'no', 'appet': 'good', 'pe': 'no', 'ane': 'no'
    }
    
    print("\n--- Sample Patient 1 (Severe Symptoms) ---")
    pred1 = predict_ckd_risk(sample_high_risk, models_dir)
    print(pred1["formatted_output"])
    
    print("\n--- Sample Patient 2 (Healthy Metrics) ---")
    pred2 = predict_ckd_risk(sample_low_risk, models_dir)
    print(pred2["formatted_output"])
    
    # 5. Batch Predictions on Test Excel File
    if os.path.exists(test_excel_path):
        print(f"\n[STEP 5] Generating Batch Predictions for Test Dataset: {test_excel_path}")
        raw_test_df = pd.read_excel(test_excel_path)
        explore_dataset(raw_test_df, "Test Dataset (Excel)")
        
        test_preds = predict_ckd_risk(raw_test_df, models_dir)
        test_df_results = raw_test_df.copy()
        test_df_results['Risk_Percentage'] = [p['risk_percentage'] for p in test_preds]
        test_df_results['Risk_Category'] = [p['risk_category'] for p in test_preds]
        test_df_results['CKD_Probability'] = [p['probability_ckd'] for p in test_preds]
        
        test_out_path = os.path.join(outputs_dir, "test_predictions.xlsx")
        test_df_results.to_excel(test_out_path, index=False)
        print(f"Saved test set batch predictions to: {test_out_path}")
    
    # 6. Final Execution Summary
    print("\n" + "="*80)
    print("                    TRAINING PIPELINE SUMMARY")
    print("="*80)
    print("\n1. Best Hyperparameters:")
    for k, v in best_params.items():
        print(f"   - {k}: {v}")
        
    print("\n2. Final Validation Evaluation Metrics:")
    print(f"   - Accuracy:      {metrics['accuracy'] * 100:.2f}%")
    print(f"   - Precision:     {metrics['precision'] * 100:.2f}%")
    print(f"   - Recall:        {metrics['recall'] * 100:.2f}%")
    print(f"   - F1-Score:      {metrics['f1_score'] * 100:.2f}%")
    print(f"   - ROC-AUC Score: {metrics['roc_auc_score']:.4f}")
    
    print("\n3. Sample Patient Prediction Output:")
    print(f"   Chronic Kidney Disease Risk")
    print(f"   Risk Percentage: {pred1['risk_percentage']}%")
    print(f"   Risk Category:   {pred1['risk_category'].replace(' Risk', '')}")
    
    print("\n4. Saved Artifacts Confirmation:")
    saved_files = [
        os.path.join(models_dir, 'ckd_xgboost.pkl'),
        os.path.join(models_dir, 'preprocessing_pipeline.pkl'),
        os.path.join(outputs_dir, 'metrics.json'),
        os.path.join(outputs_dir, 'confusion_matrix.png'),
        os.path.join(outputs_dir, 'roc_curve.png'),
        os.path.join(outputs_dir, 'feature_importance.png'),
        os.path.join(outputs_dir, 'test_predictions.xlsx')
    ]
    
    for fpath in saved_files:
        status = "SUCCESS" if os.path.exists(fpath) else "MISSING"
        size = f"{os.path.getsize(fpath) / 1024:.1f} KB" if os.path.exists(fpath) else "0 KB"
        print(f"   [{status}] {fpath} ({size})")
        
    print("\nPipeline Execution Completed Successfully!")
    print("="*80 + "\n")


if __name__ == "__main__":
    main()
