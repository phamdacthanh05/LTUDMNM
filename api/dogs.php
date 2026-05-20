<?php
// 1. Cho phép các cổng khác nhau (như cổng 5000 của AI hoặc cổng của Live Server) truy cập vào
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Xử lý request OPTIONS (Preflight) để trình duyệt không báo lỗi
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


// Tăng giới hạn nhận dữ liệu Base64 ảnh
ini_set('post_max_size', '50M');
ini_set('upload_max_filesize', '50M');
ini_set('memory_limit', '256M');

include_once 'db.php';

// --- LẤY DANH SÁCH (GET) ---
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $conn->query("SELECT * FROM dogs ORDER BY id DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (PDOException $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
}

// --- LƯU BÀI ĐĂNG (POST) ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Lấy dữ liệu từ JSON gửi lên
    $data = json_decode(file_get_contents("php://input"), true);
    
    if($data) {
        try {
            $stmt = $conn->prepare("INSERT INTO dogs (name, breed, price, category, image_url) VALUES (?, ?, ?, ?, ?)");
            
            // LƯU Ý: Trong app.js bạn gửi là 'image_url', nên ở đây phải khớp key
            $image = !empty($data['image_url']) ? $data['image_url'] : 'https://via.placeholder.com/400';
            
            $stmt->execute([
                $data['name'], 
                $data['breed'], 
                $data['price'], 
                $data['category'], 
                $image
            ]);
            
            echo json_encode(["status" => "success", "message" => "Đã thêm bé cún thành công!"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Không nhận được dữ liệu"]);
    }
}
?>