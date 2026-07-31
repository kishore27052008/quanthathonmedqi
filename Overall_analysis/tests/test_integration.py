import sys
import os

base_path = r'C:\Users\hamsini\.gemini\antigravity-ide\scratch\quanthathonmedqi'
sys.path.insert(0, base_path)
sys.path.insert(0, os.path.join(base_path, 'ckd', 'src'))
sys.path.insert(0, os.path.join(base_path, 'stroke'))

from gdm.gdm_predict import predict_gdm
from preeclampsia.pcm_predict import predict_preclamp
from stroke.predict import predict_stroke_risk
from cad.cad_predict import predict_heart_disease_risk
from ckd.ckd_predict import predict_ckd_risk

from overall_risk_analysis import propagate_risk

# Sample patient with high GDM and Preeclampsia risk factors
gdm_sample = {'Age': 38, 'No of Pregnancy': 3, 'Gestation in previous Pregnancy': 36, 'BMI': 34.0, 'HDL': 38, 'Family History': 1, 'unexplained prenetal loss': 1, 'Large Child or Birth Default': 1, 'PCOS': 1, 'Sys BP': 145, 'Dia BP': 95, 'OGTT': 190, 'Hemoglobin': 11.0, 'Sedentary Lifestyle': 1, 'Prediabetes': 1}
pcm_sample = {'maternal_age': 38, 'pre_pregnancy_weight': 85, 'maternal_height': 160, 'bmi': 33.2, 'right_art_ut_ri': 0.75, 'right_art_ut_pi': 1.6, 'right_art_ut_psv': 65, 'left_art_ut_ri': 0.78, 'left_art_ut_pi': 1.7, 'left_art_ut_psv': 68, 'mean_ri': 0.765, 'mean_pi': 1.65, 'mean_psv': 66.5, 'bilateral_notch': 1, 'parity': 2, 'sflt1': 6500, 'plgf': 80, 'sflt1_plgf_ratio': 81.25}
stroke_sample = {'gender': 'Female', 'age': 42.0, 'hypertension': 1, 'heart_disease': 0, 'ever_married': 'Yes', 'work_type': 'Private', 'Residence_type': 'Urban', 'avg_glucose_level': 180.0, 'bmi': 33.2, 'smoking_status': 'never smoked'}
cad_sample = {'age': 42, 'sex': 'Female', 'cp': 'atypical angina', 'trestbps': 140, 'chol': 240, 'fbs': 'TRUE', 'restecg': 'normal', 'thalch': 140, 'exang': 'FALSE', 'oldpeak': 1.2, 'slope': 'flat', 'ca': 1.0, 'thal': 'normal'}
ckd_sample = {'age': 42.0, 'bp': 90.0, 'sg': 1.015, 'al': 2.0, 'su': 1.0, 'rbc': 'normal', 'pc': 'abnormal', 'pcc': 'notpresent', 'ba': 'notpresent', 'bgr': 190.0, 'bu': 45.0, 'sc': 1.8, 'sod': 136.0, 'pot': 4.5, 'hemo': 10.5, 'pcv': 33.0, 'wc': '8500', 'rc': '4.2', 'htn': 'yes', 'dm': 'yes', 'cad': 'no', 'appet': 'good', 'pe': 'no', 'ane': 'no'}

# Get individual model predictions
p_gdm = predict_gdm(gdm_sample)['probability']
p_pcm = predict_preclamp(pcm_sample)['probability']
p_stroke = predict_stroke_risk(stroke_sample)['probability']
p_cad = predict_heart_disease_risk(cad_sample)['probability']
p_ckd = predict_ckd_risk(ckd_sample)['probability_ckd']

priors = {
    'gdm': p_gdm,
    'preeclampsia': p_pcm,
    'stroke': p_stroke,
    'ckd': p_ckd,
    'cad': p_cad
}

print('=== MODEL OUTPUT PRIORS ===')
for k, v in priors.items():
    print(f'  {k:15s}: {v:.4f}')

# Run overall risk analysis propagation
result = propagate_risk(priors)

print('\n=== INTEGRATED RISK ANALYSIS RESULT ===')
score = result['integrated_risk_score']
print(f'Integrated Risk Score : {score}%')
print('\nPropagated Posteriors:')
for k, v in result['posteriors'].items():
    print(f'  {k:15s}: {v:.4f} (Base Prior: {priors[k]:.4f})')

interactions = result['cross_disease_interactions']
print(f'\nActive Cross-Disease Interaction Pathways ({len(interactions)} active):')
for item in interactions:
    print(f' - {item["explanation"]}')
