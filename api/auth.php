<?php
include_once 'db.php';

// Tắt hiển thị lỗi trực tiếp để tránh làm hỏng cấu trúc JSON trả về
error_reporting(0);
header('Content-Type: application/json');

// Đọc dữ liệu gửi lên
$input = file_get_contents("php://input");
$data = json_decode($input);

// Kiểm tra nếu dữ liệu rỗng hoặc không phải JSON
if (!$data || !isset($data->action)) {
    echo json_encode(["success" => false, "message" => "Dữ liệu không hợp lệ"]);
    exit;
}

// Xử lý Đăng ký
if ($data->action == 'register') {
    // Kiểm tra đủ dữ liệu đầu vào
    if (!isset($data->username) || !isset($data->password) || !isset($data->fullname)) {
        echo json_encode(["success" => false, "message" => "Thiếu thông tin đăng ký"]);
        exit;
    }

    $query = "INSERT INTO users (username, password, fullname, role) VALUES (?, ?, ?, 'user')";
    $stmt = $conn->prepare($query);
    if ($stmt->execute([$data->username, $data->password, $data->fullname])) {
        echo json_encode(["success" => true, "message" => "Đăng ký thành công"]);
    } else {
        echo json_encode(["success" => false, "message" => "Lỗi đăng ký"]);
    }
}

// Xử lý Đăng nhập
if ($data->action == 'login') {
    if (!isset($data->username) || !isset($data->password)) {
        echo json_encode(["success" => false, "message" => "Thiếu tài khoản hoặc mật khẩu"]);
        exit;
    }

    $query = "SELECT * FROM users WHERE username = ? AND password = ?";
    $stmt = $conn->prepare($query);
    $stmt->execute([$data->username, $data->password]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        unset($user['password']); // Bảo mật
        echo json_encode(["success" => true, "user" => $user]);
    } else {
        echo json_encode(["success" => false, "message" => "Sai tài khoản hoặc mật khẩu!"]);
    }
}
?>