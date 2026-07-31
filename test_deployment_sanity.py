import sys
import os
import json

base_deploy = r"c:\Users\Jaya shree\OneDrive\Desktop\MedQ\deployment"
if base_deploy not in sys.path:
    sys.path.insert(0, base_deploy)

print("=================== DEPLOYMENT SANITY CHECK ===================")

# 1. Stroke Module
from stroke.stroke_predict import predict_stroke_risk, predict_stroke_risk_quantum
stroke_sample = {
    'gender': 'Male', 'age': 70.0, 'hypertension': 1, 'heart_disease': 1,
    'ever_married': 'Yes', 'work_type': 'Private', 'Residence_type': 'Urban',
    'avg_glucose_level': 210.0, 'bmi': 34.0, 'smoking_status': 'smokes'
}
res_stroke_class = predict_stroke_risk(stroke_sample)
res_stroke_quant = predict_stroke_risk_quantum(stroke_sample)
print('[SUCCESS] Stroke Classical Output:', res_stroke_class['risk_category'], f"{res_stroke_class['stroke_risk_percentage']}%")
print('[SUCCESS] Stroke Quantum Output  :', res_stroke_quant['risk_category'], res_stroke_quant['risk_percentage'])

# 2. CAD Module
from cad.cad_predict import predict_heart_disease_risk
cad_sample = {
    'age': 62, 'sex': 'Male', 'cp': 'asymptomatic', 'trestbps': 150, 'chol': 270,
    'fbs': 'TRUE', 'restecg': 'lv hypertrophy', 'thalch': 110, 'exang': 'TRUE', 'oldpeak': 2.2,
    'slope': 'flat', 'ca': 2.0, 'thal': 'reversable defect'
}
res_cad = predict_heart_disease_risk(cad_sample)
print('[SUCCESS] CAD Output             :', res_cad['risk_category'], res_cad['risk_percentage'])

# 3. CKD Module
from ckd.ckd_predict import predict_ckd_risk
ckd_sample = {
    'age': 60.0, 'bp': 85.0, 'sg': 1.012, 'al': 2.0, 'su': 1.0,
    'rbc': 'abnormal', 'pc': 'abnormal', 'pcc': 'present', 'ba': 'notpresent',
    'bgr': 220.0, 'bu': 65.0, 'sc': 3.5, 'sod': 130.0, 'pot': 4.8,
    'hemo': 9.2, 'pcv': 30.0, 'wc': '10000', 'rc': '4.0',
    'htn': 'yes', 'dm': 'yes', 'cad': 'no', 'appet': 'poor', 'pe': 'yes', 'ane': 'no'
}
res_ckd = predict_ckd_risk(ckd_sample)
print('[SUCCESS] CKD Output             :', res_ckd['risk_category'], f"{res_ckd['risk_percentage']}%")

print("\nALL THREE MODULES PASSED DEPLOYMENT SANITY CHECK SUCCESSFULLY!")
