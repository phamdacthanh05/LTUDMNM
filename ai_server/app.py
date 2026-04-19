import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import io
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Cho phép giao diện Web (HTML/JS) gọi API này

# 1. LOAD NHÃN TỪ FILE JSON NỘI BỘ
# Đảm bảo file labels.json nằm cùng thư mục với app.py
def load_local_labels():
    try:
        with open('labels.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Lỗi khi đọc file labels.json: {e}")
        return None

labels_data = load_local_labels()

# 2. KHỞI TẠO MODEL PRE-TRAINED (Cấu trúc ResNet18 chuẩn)
# weights=models.ResNet18_Weights.DEFAULT sẽ tự động tải bộ não thông minh về
model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
model.eval() # Chuyển sang chế độ dự đoán (không phải huấn luyện)

# 3. HÀM XỬ LÝ ẢNH ĐẦU VÀO
def transform_image(image_bytes):
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        # Các thông số Resize, CenterCrop và Normalize là bắt buộc đối với ImageNet
        my_transforms = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406], 
                std=[0.229, 0.224, 0.225]
            )
        ])
        return my_transforms(image).unsqueeze(0)
    except Exception as e:
        print(f"Lỗi xử lý ảnh: {e}")
        return None

# 4. API NHẬN DIỆN
@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'Vui lòng tải lên một file ảnh'}), 400
    
    file = request.files['file']
    img_bytes = file.read()
    input_tensor = transform_image(img_bytes)
    
    if input_tensor is None:
        return jsonify({'error': 'Không thể xử lý ảnh này'}), 400

    with torch.no_grad():
        outputs = model(input_tensor)
        # Tính toán xác suất (Softmax)
        probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
        # Lấy Top 3 kết quả cao nhất
        top3_prob, top3_idx = torch.topk(probabilities, 3)

    results = []
    for i in range(3):
        idx = str(top3_idx[i].item()) # Chuyển sang string để tìm trong dictionary
        # Lấy tên từ file JSON nội bộ, nếu không thấy thì để là "Unknown"
        breed_name = labels_data.get(idx, "Không xác định")
        confidence = top3_prob[i].item() * 100
        
        results.append({
            "breed": breed_name,
            "confidence": f"{confidence:.2f}%"
        })

    return jsonify({
        'success': True,
        'predictions': results
    })

@app.route('/', methods=['GET'])
def index():
    return "AI Server đang hoạt động! Sẵn sàng nhận lệnh từ giao diện Web."

if __name__ == '__main__':
    # Chạy server ở cổng 5000
    app.run(debug=True, port=5000)