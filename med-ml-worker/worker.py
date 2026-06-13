import os
import time
import boto3
import requests
import torch
import torchvision.models as models
import torchvision.transforms as transforms
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
import numpy as np
import cv2
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

# Initialize AWS S3 Client
s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION')
)

def load_model():
    print("🧠 Loading Custom Trained EfficientNet-B0 Model...")
    # Initialize architecture without internet weights
    model = models.efficientnet_b0(weights=None)
    model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, 2)
    
    # Load your custom weights onto the CPU
    model.load_state_dict(torch.load('ovarian_efficientnet_b0.pth', map_location=torch.device('cpu')))
    model.eval()
    return model

def process_medical_scan(raw_bucket, processed_bucket, file_key):
    local_filename = "input_scan.jpg"
    output_heatmap = "heatmap_scan.jpg"
    start_time = time.time()

    try:
        print(f"📦 Downloading {file_key} from {raw_bucket}...")
        s3_client.download_file(raw_bucket, file_key, local_filename)

        model = load_model()

        print("⚡ Executing Inference & Generating Grad-CAM Heatmap...")
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])

        img_pil = Image.open(local_filename).convert('RGB')
        img_tensor = transform(img_pil).unsqueeze(0)

        # 1. Run Inference
        with torch.no_grad():
            outputs = model(img_tensor)
            probs = torch.softmax(outputs, dim=1)
            confidence = probs[0][1].item() # Probability of Malignant (Class 1)
            anomaly_detected = bool(confidence > 0.5)

        # 2. Generate Grad-CAM Heatmap
        target_layers = [model.features[-1]]
        cam = GradCAM(model=model, target_layers=target_layers)
        targets = [ClassifierOutputTarget(1)]

        grayscale_cam = cam(input_tensor=img_tensor, targets=targets)[0]
        img_np = np.array(img_pil.resize((224, 224))) / 255.0
        visualization = show_cam_on_image(img_np, grayscale_cam, use_rgb=True)

        cv2.imwrite(output_heatmap, cv2.cvtColor(visualization, cv2.COLOR_RGB2BGR))

        heatmap_key = file_key.replace("scans/", "processed_reports/heatmap_")

        print(f"📤 Uploading Grad-CAM report to {processed_bucket}...")
        s3_client.upload_file(output_heatmap, processed_bucket, heatmap_key)

        inference_time = int((time.time() - start_time) * 1000)

        # Clean up container disk space
        if os.path.exists(local_filename): os.remove(local_filename)
        if os.path.exists(output_heatmap): os.remove(output_heatmap)

        print("✅ Syncing with Express Webhook...")
        # ⚠️ IMPORTANT: Ensure this matches your currently active Ngrok forwarding URL
        webhook_url = "https://drank-version-reappear.ngrok-free.dev/api/webhooks/inference-complete" 

        payload = {
            "originalFileKey": file_key,
            "fileKey": heatmap_key,
            "anomalyDetected": anomaly_detected,
            "confidence": round(confidence, 4),
            "inferenceTimeMs": inference_time
        }

        response = requests.post(webhook_url, json=payload, timeout=10)
        response.raise_for_status()
        print("📣 Express backend database updated successfully!")

    except Exception as e:
        print(f"❌ Error during processing: {str(e)}")

if __name__ == "__main__":
    RAW_BUCKET = os.getenv('RAW_BUCKET_NAME')
    PROCESSED_BUCKET = os.getenv('PROCESSED_BUCKET_NAME')
    FILE_KEY = os.getenv('UPLOADED_FILE_KEY', "scans/test.jpg")
    
    process_medical_scan(RAW_BUCKET, PROCESSED_BUCKET, FILE_KEY)