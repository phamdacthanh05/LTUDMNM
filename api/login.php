<?php
include_once 'db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $u = $data['username'];
    $p = $data['password'];

    $stmt = $conn->prepare("SELECT id, username, role, fullname FROM users WHERE username = ? AND password = ?");
    $stmt->execute([$u, $p]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo json_encode(["status" => "success", "user" => $user]);
    } else {
        echo json_encode(["status" => "error", "message" => "Tài khoản hoặc mật khẩu không đúng!"]);
    }
}
?>