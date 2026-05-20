<?php
error_reporting(0);
ini_set('display_errors', 0);

// Bắt đầu session để kiểm tra đăng nhập
session_start(); 

include_once 'db.php';
header('Content-Type: application/json');

// 📌 1. LẤY DANH SÁCH INBOX (ADMIN)
if (isset($_GET['action']) && $_GET['action'] === 'get_inbox') {
    // Câu SQL lấy tin nhắn cuối cùng kèm theo TÊN người dùng từ bảng 'users'
    // Giúp Admin dễ quản lý, không bị hiện ID lạ
    $sql = "SELECT m.customer_id, 
                   MAX(m.created_at) as last_time,
                   SUBSTRING_INDEX(GROUP_CONCAT(m.message ORDER BY m.created_at DESC), ',', 1) as last_msg,
                   u.fullname 
            FROM messages m
            LEFT JOIN users u ON m.customer_id = u.id 
            GROUP BY m.customer_id
            ORDER BY last_time DESC";

    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($data);
    exit;
}

// Xác định phương thức gửi (POST hay GET)
$method = $_SERVER['REQUEST_METHOD'];

// 📌 2. GỬI TIN NHẮN (POST)
if ($method === 'POST') {
    $inputData = json_decode(file_get_contents("php://input"), true);

    // MẶC ĐỊNH lấy ID từ trình duyệt gửi lên
    $customer_id = $inputData['customer_id'] ?? '';
    
    // 🔥 QUAN TRỌNG: Nếu đã đăng nhập, ép buộc dùng ID của tài khoản
    // Điều này giúp gộp 2 user thành 1 khi đăng nhập lại
    if (isset($_SESSION['user_id'])) {
        $customer_id = $_SESSION['user_id'];
    }

    $message = trim($inputData['message'] ?? '');
    $sender_type = $inputData['sender_type'] ?? 'customer';

    if (!empty($customer_id) && !empty($message)) {
        // Giới hạn độ dài tin nhắn
        if (strlen($message) > 1000) {
            echo json_encode(['status' => 'error', 'msg' => 'Tin nhắn quá dài']);
            exit;
        }

        $sql = "INSERT INTO messages (customer_id, sender_type, message) 
                VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$customer_id, $sender_type, $message]);

        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'msg' => 'Thiếu thông tin']);
    }
    exit;
}

// 📌 3. LẤY NỘI DUNG CHAT (GET)
if ($method === 'GET') {
    $customer_id = $_GET['customer_id'] ?? '';
    $last_id = $_GET['last_id'] ?? 0;

    // Nếu người dùng đang xem chat của chính mình, cập nhật ID theo session
    if (isset($_SESSION['user_id']) && $customer_id === 'me') {
        $customer_id = $_SESSION['user_id'];
    }

    if (!empty($customer_id)) {
        // Lấy lịch sử chat giữa Admin và User này
        $sql = "SELECT id, sender_type, message, created_at 
                FROM messages
                WHERE customer_id = ? AND id > ?
                ORDER BY created_at ASC
                LIMIT 50";

        $stmt = $conn->prepare($sql);
        $stmt->execute([$customer_id, $last_id]);
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($messages);
    } else {
        echo json_encode([]);
    }
    exit;
}

echo json_encode(['status' => 'invalid_request']);
exit;