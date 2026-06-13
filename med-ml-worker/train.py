import torch
import torch.nn as nn
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader, random_split
import time

def train_model():
    # 1. Setup Device (Uses GPU if you have an NVIDIA card, otherwise CPU)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"🚀 Training on device: {device}")

    # 2. Data Augmentation & Preprocessing
    # We rotate and flip images so the CNN doesn't memorize the dataset
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    # Load dataset directly from your folder structure
    dataset = datasets.ImageFolder('./data', transform=transform)
    
    # 3. Split into 80% Training / 20% Validation
    train_size = int(0.8 * len(dataset))
    val_size = len(dataset) - train_size
    train_ds, val_ds = random_split(dataset, [train_size, val_size])
    
    train_loader = DataLoader(train_ds, batch_size=16, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=16)
    
    # 4. Initialize EfficientNet-B0 and modify the classification head
    model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)
    model.classifier[1] = nn.Linear(model.classifier[1].in_features, 2)
    model = model.to(device)
    
    # 5. Define Loss Function and Optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-4)
    
    epochs = 10 # Adjust based on your dataset size
    
    # 6. The Training Loop
    start_time = time.time()
    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
            
        print(f"Epoch {epoch+1}/{epochs} - Loss: {running_loss/len(train_loader):.4f}")
    
    # 7. Save the custom weights!
    total_time = (time.time() - start_time) / 60
    print(f"✅ Training Complete in {total_time:.2f} minutes.")
    
    torch.save(model.state_dict(), 'ovarian_efficientnet_b0.pth')
    print("💾 Model saved locally as 'ovarian_efficientnet_b0.pth'")

if __name__ == "__main__":
    train_model()