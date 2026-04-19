<?php
include_once 'api/db.php';
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Quản lý tin nhắn - Admin</title>
    <link rel="stylesheet" href="css/style.css">
    <style>
        .admin-chat-container { display: flex; height: 80vh; border: 1px solid #ccc; margin: 20px; }
        .customer-list { width: 30%; border-right: 1px solid #ccc; overflow-y: auto; background: #f9f9f9; }
        .chat-main { width: 70%; display: flex; flex-direction: column; }
        .customer-item { padding: 15px; border-bottom: 1px solid #eee; cursor: pointer; }
        .customer-item:hover { background: #ffeef0; }
        .chat-history { flex-grow: 1; padding: 20px; overflow-y: auto; background: #fff; }
        .chat-input-area { padding: 15px; border-top: 1px solid #ccc; display: flex; }
        .chat-input-area input { flex-grow: 1; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
        .btn-send { background: #ff8a9e; color: white; border: none; padding: 10px 20px; margin-left: 10px; border-radius: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="admin-chat-container">
        <div class="customer-list" id="customer-list">
            <h3 style="padding: 10px;">Khách hàng</h3>
            <?php
            // Lấy danh sách các khách hàng duy nhất đã nhắn tin
            $stmt = $conn->query("SELECT DISTINCT customer_id FROM messages ORDER BY created_at DESC");
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                echo "<div class='customer-item' onclick='loadCustomerChat(\"{$row['customer_id']}\")'>
                        <strong>ID: {$row['customer_id']}</strong>
                      </div>";
            }
            ?>
        </div>

<div class="chat-main">
    <div class="chat-history" id="admin-chat-content">
        <p style="color: #888; text-align: center;">Chọn một khách hàng để bắt đầu chat</p>
    </div>
    <div class="chat-input-area">
        <input type="text" id="admin-chat-input" placeholder="Nhập tin nhắn trả lời..." onkeypress="if(event.key === 'Enter') sendAdminMessage()">
        <button class="btn-send" onclick="sendAdminMessage()" title="Gửi tin nhắn">
            <i class="fa fa-paper-plane"></i> </button>
    </div>
</div>
    </div>

    <script>
        let currentCustomerId = '';

        async function loadCustomerChat(customerId) {
            currentCustomerId = customerId;
            const res = await fetch(`api/chat.php?customer_id=${customerId}`);
            const messages = await res.json();
            
            const content = document.getElementById('admin-chat-content');
            content.innerHTML = messages.map(m => `
                <div style="text-align: ${m.sender_type === 'admin' ? 'right' : 'left'}; margin-bottom: 10px;">
                    <div style="background: ${m.sender_type === 'admin' ? '#ff8a9e' : '#f0f0f0'}; 
                                color: ${m.sender_type === 'admin' ? 'white' : 'black'};
                                display: inline-block; padding: 8px 12px; border-radius: 15px; max-width: 70%;">
                        ${m.message}
                    </div>
                </div>
            `).join('');
            content.scrollTop = content.scrollHeight;
        }

        async function sendAdminMessage() {
            const input = document.getElementById('admin-chat-input');
            if (!input.value || !currentCustomerId) return;

            await fetch('api/chat.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_id: currentCustomerId,
                    message: input.value,
                    sender_type: 'admin'
                })
            });

            input.value = '';
            loadCustomerChat(currentCustomerId);
        }

        // Tự động cập nhật tin nhắn mỗi 5s
        setInterval(() => {
            if(currentCustomerId) loadCustomerChat(currentCustomerId);
        }, 5000);
    </script>
</body>
</html>