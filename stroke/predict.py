import os
import joblib
import pandas as pd
import numpy as np

# Absolute or relative paths to model artifacts
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "models", "stroke_xgboost.pkl")
PIPELINE_PATH = os.path.join(BASE_DIR, "models", "preprocessing_pipeline.pkl")

def load_artifacts():
    """Load model and preprocessing pipeline with error handling."""
    if not os.path.exists(MODEL_PATH) or not os.path.exists(PIPELINE_PATH):
        raise FileNotFoundError(
            f"Artifacts missing. Ensure '{MODEL_PATH}' and '{PIPELINE_PATH}' exist by running train_pipeline.py first."
        )
    model = joblib.load(MODEL_PATH)
    pipeline_obj = joblib.load(PIPELINE_PATH)
    return model, pipeline_obj

def generate_recommendations(input_row, risk_percentage):
    """Generate dynamic clinical recommendations based on risk score and risk factors."""
    recommendations = []
    
    # Blood pressure check
    hypertension = input_row.get('hypertension', 0)
    if hypertension == 1 or risk_percentage > 50:
        recommendations.append("Control blood pressure")
        
    # Glucose check
    avg_glucose = input_row.get('avg_glucose_level', 100)
    if avg_glucose >= 140 or risk_percentage > 50:
        recommendations.append("Manage blood glucose")
        
    # Smoking check
    smoking = str(input_row.get('smoking_status', '')).lower()
    if 'smokes' in smoking or 'formerly' in smoking:
        recommendations.append("Stop smoking")
        
    # Physical activity & BMI
    bmi = input_row.get('bmi', 25)
    if bmi is not None and not np.isnan(float(bmi)) and float(bmi) >= 25:
        recommendations.append("Maintain healthy BMI")
    recommendations.append("Increase physical activity")
    
    # Specialist consultation for high risk
    if risk_percentage > 50:
        recommendations.append("Consult a Neurologist")
    elif risk_percentage > 25:
        recommendations.append("Schedule a regular medical checkup")
        
    # Ensure unique recommendations preserving order
    unique_recs = []
    for rec in recommendations:
        if rec not in unique_recs:
            unique_recs.append(rec)
            
    return unique_recs

def predict_stroke_risk(input_data):
    """
    Predict Stroke Risk Percentage and Risk Category.
    
    Parameters:
    -----------
    input_data : dict or pandas.DataFrame
        Input features for one or more patient records.
        Expected keys/columns:
        ['gender', 'age', 'hypertension', 'heart_disease', 'ever_married',
         'work_type', 'Residence_type', 'avg_glucose_level', 'bmi', 'smoking_status']
         
    Returns:
    --------
    dict or list of dict:
        Structured prediction output containing Risk Percentage, Risk Category,
        Probability, and Clinical Recommendations.
    """
    model, pipeline_obj = load_artifacts()
    preprocessor = pipeline_obj['preprocessor']
    
    # Convert input dict to DataFrame if necessary
    if isinstance(input_data, dict):
        df_input = pd.DataFrame([input_data])
        single_input = True
    elif isinstance(input_data, pd.DataFrame):
        df_input = input_data.copy()
        single_input = len(df_input) == 1
    else:
        raise TypeError("input_data must be a Python dictionary or a Pandas DataFrame.")

    # Ensure numeric columns are properly typed
    if 'bmi' in df_input.columns:
        df_input['bmi'] = pd.to_numeric(df_input['bmi'], errors='coerce')
    if 'age' in df_input.columns:
        df_input['age'] = pd.to_numeric(df_input['age'], errors='coerce')
    if 'avg_glucose_level' in df_input.columns:
        df_input['avg_glucose_level'] = pd.to_numeric(df_input['avg_glucose_level'], errors='coerce')

    # Apply preprocessing pipeline
    processed_features = preprocessor.transform(df_input)
    
    # Obtain risk probability (class 1: Stroke)
    probabilities = model.predict_proba(processed_features)[:, 1]
    
    results = []
    for idx, prob in enumerate(probabilities):
        risk_pct = round(float(prob * 100), 1)
        
        # Determine Risk Category
        if risk_pct <= 25.0:
            category = "Low Risk"
        elif risk_pct <= 50.0:
            category = "Moderate Risk"
        elif risk_pct <= 75.0:
            category = "High Risk"
        else:
            category = "Very High Risk"
            
        row_dict = df_input.iloc[idx].to_dict()
        recs = generate_recommendations(row_dict, risk_pct)
        
        res = {
            "stroke_risk_percentage": risk_pct,
            "risk_category": category,
            "probability": round(float(prob), 4),
            "recommendations": recs
        }
        results.append(res)
        
    return results[0] if single_input else results

def format_prediction_output(result):
    """Format single prediction result into requested user presentation format."""
    lines = [
        "Stroke Risk Prediction",
        "",
        f"Risk Percentage : {result['stroke_risk_percentage']}%",
        "",
        f"Risk Category : {result['risk_category'].replace(' Risk', '')}",
        "",
        "Recommendations:"
    ]
    for rec in result['recommendations']:
        lines.append(f"• {rec}")
    return "\n".join(lines)

if __name__ == "__main__":
    # Test sample profile (High Risk Patient Profile)
    sample_patient = {
        "gender": "Male",
        "age": 75.0,
        "hypertension": 1,
        "heart_disease": 1,
        "ever_married": "Yes",
        "work_type": "Private",
        "Residence_type": "Urban",
        "avg_glucose_level": 221.29,
        "bmi": 36.6,
        "smoking_status": "smokes"
    }
    
    print("Testing predict_stroke_risk with sample patient profile:")
    print("-" * 50)
    try:
        pred_res = predict_stroke_risk(sample_patient)
        print(format_prediction_output(pred_res))
    except FileNotFoundError as e:
        print(f"Error: {e}")
