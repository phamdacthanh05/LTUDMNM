// js/ui.js
export const UI = {
    allDogsData: [],
    seenUsers: {},
    chatInterval: null,
    inboxInterval: null,
    currentAdminChatId: null, // Lưu ID khách hàng mà Admin đang chọn chat
    // ID khách hàng tạm thời cho khách (Lưu vào localStorage)
    customerId: localStorage.getItem('chat_customer_id') || 'guest_' + Math.random().toString(36).substr(2, 9),

    lastMessageCount: 0,      
    lastDetailCount: 0,

    init() {
        // Lưu ID khách hàng nếu là lần đầu
        localStorage.setItem('chat_customer_id', this.customerId);
        
        // Tự động làm mới tin nhắn mỗi 5 giây cho dù đang ở trang nào (để nhận thông báo)
        setInterval(() => {
            if (this.currentAdminChatId) {
                this.loadDetailMessages(this.currentAdminChatId);
            }
        }, 5000);
    },

    // --- 1. Render danh sách chó (Giữ nguyên của em) ---
    renderDogList(dogs, currentUser, containerId = 'dog-list') {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!dogs || dogs.length === 0) {
            container.innerHTML = `<p style="text-align:center; width:100%; color:#ff8a9e; padding: 20px;">Chưa có sản phẩm nào.</p>`;
            return;
        }

        container.innerHTML = dogs.map(dog => {
            const imgUrl = dog.image_url && dog.image_url.trim() !== "" ? dog.image_url : 'https://placehold.co/400x300?text=PetLove';
            
            return `
                <div class="card" style="position: relative;">
                    ${currentUser?.role === 'admin' ? 
                        `<button class="btn-delete" onclick="app.deleteDog(${dog.id})" title="Xóa chú chó này" 
                            style="position: absolute; top: 10px; right: 10px; z-index: 10; background: rgba(255, 77, 77, 0.9); color: white; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                            <i class="fa fa-trash"></i>
                        </button>` : ''
                    }
                    <img src="${imgUrl}" class="card-img" alt="${dog.name}" style="width: 100%; height: 260px; object-fit: cover;" onerror="this.onerror=null; this.src='https://placehold.co/400x300?text=PetLove+Error';">
                    <div class="card-content">
                        <div class="card-title">${dog.name}</div>
                        <small style="color: #888; margin-bottom: 10px; display: block; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px;">
                            ${dog.breed} • ${dog.category}
                        </small>
                        <div class="card-price">${Number(dog.price).toLocaleString()} VNĐ</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    // --- 2. Xử lý Chat Module cho Khách (Bong bóng chat) ---
    toggleChat() {
const chatBox = document.getElementById('chat-box');
    if (chatBox) {
        // Nếu đang có class hidden thì xóa đi (mở), nếu chưa có thì thêm vào (đóng)
        chatBox.classList.toggle('hidden');
    } else {
        console.error("Không tìm thấy thẻ có id là chat-box");
    }
    },

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        if (!message) return;

        try {
            await fetch('api/chat.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_id: this.customerId,
                    message: message,
                    sender_type: 'customer'
                })
            });
            input.value = '';
            this.loadMessages();
        } catch (error) {
            this.showNotification('Không thể gửi tin nhắn', 'error');
        }
    },

    async loadMessages() {
        const content = document.getElementById('chat-content');
    if (!content) return;

    try {
        const res = await fetch(`api/chat.php?customer_id=${this.customerId}`);
        const messages = await res.json();

        // CHỈ RENDER LẠI KHI CÓ TIN NHẮN MỚI
        if (messages.length !== this.lastMessageCount) {
            content.innerHTML = messages.map(m => `
                <div style="text-align: ${m.sender_type === 'customer' ? 'right' : 'left'}; margin-bottom: 10px;">
                    <div style="background: ${m.sender_type === 'customer' ? '#ff8a9e' : '#f0f0f0'}; 
                                color: ${m.sender_type === 'customer' ? 'white' : 'black'};
                                display: inline-block; padding: 8px 12px; border-radius: 15px; 
                                max-width: 80%; font-size: 0.9rem; word-wrap: break-word;">
                        ${m.message}
                    </div>
                </div>
            `).join('');

            content.scrollTop = content.scrollHeight; // Cuộn xuống đáy
            this.lastMessageCount = messages.length; // Cập nhật số lượng tin hiện tại
        }
    } catch (error) {
        console.error('Lỗi:', error);
    }
    },

    // --- 3. Giao diện INBOX TIKTOK (Dành cho Admin) ---
    async showInboxPage() {
        this.showPage('inbox-page');
        await this.loadInbox();
        // Tự động cập nhật danh sách inbox mỗi 10 giây
        if (this.inboxInterval) clearInterval(this.inboxInterval);
        this.inboxInterval = setInterval(() => this.loadInbox(), 10000);
    },

    async loadInbox() {
        const container = document.getElementById('inbox-list');
        if (!container) return;
        try {
            const res = await fetch('api/chat.php?action=get_inbox');
            const users = await res.json();

            container.innerHTML = users.map(u => `
                <div class="tk-item ${this.currentAdminChatId === u.customer_id ? 'active' : ''}" 
                     onclick="UI.selectConversation('${u.customer_id}')">
                    <img src="https://ui-avatars.com/api/?name=User&background=random" class="tk-avatar">
                    <div class="tk-item-info">
                        <strong>Khách: ${u.customer_id.slice(-6)}</strong>
                        <p>
                            ${u.last_msg || '...'}
                            ${!this.seenUsers[u.customer_id] ? ' <span style="color:red;">●</span>' : ''}
                        </p>
                    </div>
                </div>
            `).join('');
        } catch (e) { console.error("Lỗi tải inbox:", e); }
    },

async selectConversation(customerId) {
    this.currentAdminChatId = customerId;

    this.seenUsers[customerId] = true; 

    document.getElementById('active-username').innerText = "Đang hỗ trợ: " + customerId.slice(-6);

    const items = document.querySelectorAll('.tk-item');
    items.forEach(item => item.classList.remove('active'));

    this.loadDetailMessages(customerId);
},

async loadDetailMessages(customerId) {
    const flow = document.getElementById('tk-chat-flow');
    if (!flow || !customerId) return;

    try {
        const res = await fetch(`api/chat.php?customer_id=${customerId}`);
        const messages = await res.json();

        flow.innerHTML = ""; // reset

        messages.forEach(m => {
            flow.innerHTML += `
                <div class="tk-msg ${m.sender_type}">
                    <div class="tk-bubble">${m.message}</div>
                </div>
            `;
        });

        flow.scrollTop = flow.scrollHeight;
    } catch (e) {
        console.error(e);
    }
},

    async sendAdminReply() {
        const input = document.getElementById('admin-reply-input');
        const msg = input.value.trim();
        if (!msg || !this.currentAdminChatId) return;

        try {
            await fetch('api/chat.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_id: this.currentAdminChatId,
                    message: msg,
                    sender_type: 'admin'
                })
            });
            input.value = '';
            this.loadDetailMessages(this.currentAdminChatId);
        } catch (e) { this.showNotification('Lỗi gửi phản hồi', 'error'); }
    },

    // --- 4. Quản lý hiển thị các trang ---
    showPage(pageId) {
        const views = document.querySelectorAll('.view');
        views.forEach(v => v.classList.add('hidden'));

        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        // Dừng cập nhật inbox nếu rời khỏi trang inbox
        if (pageId !== 'inbox-page' && this.inboxInterval) {
            clearInterval(this.inboxInterval);
        }
    },
    

    // --- 5. Hiển thị thông báo Toast (Giữ nguyên của em) ---
    showNotification(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fa ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> 
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },
    // Hàm này gọi sau khi load xong dữ liệu từ server
    setDogData(dogs) {
        this.allDogsData = dogs;
    },
    toggleUserMenu() {
    const menu = document.getElementById('user-dropdown');
    if (menu) {
        menu.classList.toggle('hidden');
    }
},
// Thêm hàm này vào đối tượng UI
toggleNavMenu() {
    const menu = document.getElementById('nav-menu');
    if (menu) {
        menu.classList.toggle('active');
    }
},

filterDogs() {
    const category = document.getElementById('filter-category').value;
    const priceRange = document.getElementById('filter-price').value;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Lọc dữ liệu
    let filtered = this.allDogsData.filter(dog => {
        const matchCategory = (category === 'all' || dog.category === category);
        let matchPrice = true;
        const price = Number(dog.price);
        
        if (priceRange === 'low') matchPrice = price < 5000000;
        else if (priceRange === 'mid') matchPrice = price >= 5000000 && price <= 10000000;
        else if (priceRange === 'high') matchPrice = price > 10000000;
        
        return matchCategory && matchPrice;
    });

    // Tự động tìm xem trang nào đang hiển thị để update
    const containerHome = document.getElementById('dog-list');
    const containerAll = document.getElementById('dog-list-all');

    if (containerHome && containerHome.offsetParent !== null) {
        this.renderDogList(filtered, currentUser, 'dog-list');
    }
    if (containerAll && containerAll.offsetParent !== null) {
        this.renderDogList(filtered, currentUser, 'dog-list-all');
    }
}
};



// Khởi tạo
UI.init();
window.UI = UI;