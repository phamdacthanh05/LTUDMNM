<?php
include_once 'db.php'; // Kết nối PDO bạn đã làm ở bước trước
$data = json_decode(file_get_contents("php://input"));

// LẤY DỮ LIỆU (GET)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $slug = $_GET['slug'];
    $stmt = $conn->prepare("SELECT * FROM pages WHERE slug = ?");
    $stmt->execute([$slug]);
    echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
}

// CẬP NHẬT DỮ LIỆU (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $query = "INSERT INTO pages (slug, title, content) 
              VALUES (?, ?, ?) 
              ON DUPLICATE KEY UPDATE title = VALUES(title), content = VALUES(content)";
    $stmt = $conn->prepare($query);
    if($stmt->execute([$data->slug, $data->title, $data->content])) {
        echo json_encode(["status" => "success"]);
    }
}
?>