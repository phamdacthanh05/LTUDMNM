<?php
include_once 'db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $u = trim($data['username'] ?? '');
    $p = $data['password'] ?? '';
    $f = trim($data['fullname'] ?? '');

    if (empty($u) || empty($p) || empty($f)) {
        echo json_encode(["status" => "error", "message" => "Vui lòng điền đủ thông tin!"]);
        exit;
    }

    // Kiểm tra tên đăng nhập đã tồn tại chưa
    $check = $conn->prepare("SELECT id FROM users WHERE username = ?");
    $check->execute([$u]);
    
    if ($check->fetch()) {
        echo json_encode(["status" => "error", "message" => "Tên đăng nhập đã tồn tại!"]);
    } else {
        // Thêm user mới (Role mặc định là user)
        $stmt = $conn->prepare("INSERT INTO users (username, password, fullname, role) VALUES (?, ?, ?, 'user')");
        if ($stmt->execute([$u, $p, $f])) {
            echo json_encode(["status" => "success", "message" => "Đăng ký thành công!"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Lỗi database!"]);
        }
    }
}
?>