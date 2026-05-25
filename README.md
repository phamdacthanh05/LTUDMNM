# 🐾 PetLove - Hệ Thống Quản Lý & Nhận Diện Giống Chó Bằng AI

## 📌 Giới thiệu dự án

**PetLove** là website hỗ trợ quản lý và mua bán thú cưng, tích hợp công nghệ **AI nhận diện giống chó bằng hình ảnh**.
Người dùng chỉ cần tải ảnh chú chó lên hệ thống, AI sẽ phân tích và đưa ra kết quả dự đoán giống chó phù hợp.

Dự án được xây dựng nhằm:

* Hỗ trợ tìm kiếm giống chó nhanh chóng
* Kết hợp AI với website thương mại thú cưng
* Tạo trải nghiệm hiện đại và thân thiện cho người dùng

---

## 🚀 Tính năng chính

### 🌐 Website quản lý thú cưng

* Trang chủ hiện đại, responsive
* Danh sách chó đang bán
* Đăng bài bán thú cưng
* Đăng nhập / đăng ký tài khoản
* Hệ thống chat hỗ trợ khách hàng
* Giao diện thân thiện trên mobile và desktop

### 🤖 AI nhận diện giống chó

* Upload ảnh chó
* AI phân tích bằng mô hình Deep Learning
* Trả về Top 3 giống chó dự đoán
* Kiểm tra ảnh có đúng là chó hay không
* Hiển thị độ chính xác (%)

---

## 🧠 Công nghệ sử dụng

### Frontend

* HTML5
* CSS3
* JavaScript (ES6)
* Font Awesome

### Backend AI

* Python
* Flask
* Flask-CORS
* PyTorch
* TorchVision
* Pillow (PIL)

### AI Model

* ResNet18 Pretrained
* Dataset ImageNet

---

## 📂 Cấu trúc thư mục

```bash
PetLove/
│
├── index.html          # Giao diện chính website
├── app.py              # AI Server Flask
├── labels.json         # Danh sách nhãn giống chó
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   └── ui.js
├── assets/
│   └── images/
└── README.md
```

---

## ⚙️ Cài đặt dự án

### 1️⃣ Clone project

```bash
git clone https://github.com/your-username/petlove.git
cd petlove
```

---

### 2️⃣ Cài đặt thư viện Python

```bash
pip install flask
pip install flask-cors
pip install torch torchvision
pip install pillow
```

---

### 3️⃣ Chạy AI Server

```bash
python app.py
```

Sau khi chạy thành công:

```bash
Running on http://127.0.0.1:5000
```

---

### 4️⃣ Chạy Website

Mở file:

```bash
index.html
```

hoặc sử dụng Live Server trong VSCode.

---

## 🖼️ Cách hoạt động của AI

### Quy trình xử lý

1. Người dùng tải ảnh chó lên
2. Ảnh được resize và normalize
3. ResNet18 phân tích ảnh
4. AI dự đoán giống chó
5. Trả về Top 3 kết quả chính xác nhất

---

## 📊 Ví dụ kết quả AI

```json
{
  "success": true,
  "predictions": [
    {
      "breed": "Chó Husky",
      "confidence": "92.45%"
    },
    {
      "breed": "Chó Samoyed",
      "confidence": "4.32%"
    },
    {
      "breed": "Chó Alaskan Malamute",
      "confidence": "2.11%"
    }
  ]
}
```

---

## 🔥 Điểm nổi bật của dự án

✅ Giao diện đẹp, hiện đại
✅ Responsive Mobile First
✅ Tích hợp AI thực tế
✅ Nhận diện giống chó bằng Deep Learning
✅ Hệ thống chat hỗ trợ
✅ Dễ mở rộng thêm dữ liệu AI

---

## 📚 Kiến thức áp dụng

* Thiết kế giao diện Web
* REST API với Flask
* Xử lý ảnh bằng Python
* Deep Learning với PyTorch
* AI Image Classification
* Responsive Design

---

## 👨‍💻 Tác giả

**Cheu An**
Sinh viên ngành Công nghệ Thông Tin

---

## 📄 Giấy phép

Dự án phục vụ mục đích:

* Học tập
* Nghiên cứu
* Báo cáo môn học

Không sử dụng cho mục đích thương mại.

---

# ❤️ PetLove

> “Tìm đúng chú cún bạn cần chỉ với một bức ảnh.”
