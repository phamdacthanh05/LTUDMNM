<?php
// Cho phép nhận lệnh từ trình duyệt
header('Content-Type: application/json');

// 1. Kết nối Database
// Thanh kiểm tra lại xem file db.php nằm cùng thư mục api hay ở ngoài nhé
include_once 'db.php'; 

// 2. Lấy ID từ URL (ví dụ: delete_dog.php?id=5)
$id = isset($_GET['id']) ? $_GET['id'] : null;

if ($id) {
    try {
        // 3. Thực hiện lệnh xóa
        // Thanh nhớ: tên bảng là 'dogs', cột khóa chính là 'id'
        $sql = "DELETE FROM dogs WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->execute(['id' => $id]);

        echo json_encode(["status" => "success", "message" => "Đã xóa ID $id"]);
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Không nhận được ID để xóa"]);
}
?>