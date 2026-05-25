import { DogAPI } from './api.js';
import { UI } from './ui.js';
import { Product } from './product.js';

const app = {
    // --- 1. KHỞI TẠO ---
    init() {
        this.checkAuth(); 
        this.loadData();  
        this.bindEvents(); 
    },

    // --- 2. KIỂM TRA QUYỀN & CẬP NHẬT UI ---
checkAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser'));

    const els = {
        btnPost: document.getElementById('nav-post'),
        loginItem: document.getElementById('nav-login-item'),
        userInfo: document.getElementById('user-info'),
        userName: document.getElementById('user-name'),
        userAvatar: document.getElementById('user-avatar'),
        inboxMenu: document.getElementById('nav-inbox'),  // Menu tin nhắn trên Nav (Cho Admin)
        floatingChat: document.getElementById('floating-chat-btn') // Nút chat nổi (Cho User)
    };

    if (user) {
        // --- 1. XỬ LÝ CHUNG KHI ĐÃ ĐĂNG NHẬP ---
        if (els.loginItem) els.loginItem.style.display = 'none';

        if (els.userInfo) {
            els.userInfo.style.display = 'flex';
            els.userInfo.classList.remove('hidden');
            if (els.userName) els.userName.innerText = user.fullname;

            if (els.userAvatar) {
                els.userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname)}&background=random`;
            }
        }

        // --- 2. PHÂN QUYỀN CHI TIẾT (ADMIN VS USER) ---
        const isAdmin = user.role && user.role.toString().trim().toLowerCase() === 'admin';

        if (isAdmin) {
            // ✅ ADMIN: Hiện Đăng bài + Hiện Menu Inbox
            if (els.btnPost) {
                els.btnPost.style.setProperty('display', 'block', 'important');
                els.btnPost.classList.remove('hidden');
            }
            if (els.inboxMenu) {
                els.inboxMenu.style.setProperty('display', 'block', 'important');
                els.inboxMenu.classList.remove('hidden');
            }
            
            // Ẩn nút chat nổi (vì Admin dùng trang Inbox chính)
            if (els.floatingChat) els.floatingChat.style.display = 'none';

        } else {
            // ❌ USER THƯỜNG: Ẩn Đăng bài + Ẩn Menu Inbox
            if (els.btnPost) els.btnPost.style.display = 'none';
            if (els.inboxMenu) els.inboxMenu.style.display = 'none';
            
            // ✅ Hiện nút chat nổi để User liên hệ shop
            if (els.floatingChat) {
                els.floatingChat.style.setProperty('display', 'block', 'important');
                els.floatingChat.classList.remove('hidden');
            }
        }

    } else {
        // --- 3. CHƯA ĐĂNG NHẬP: ẨN HẾT ---
        if (els.loginItem) els.loginItem.style.display = 'block';
        if (els.userInfo) els.userInfo.style.display = 'none';
        if (els.btnPost) els.btnPost.style.display = 'none';
        if (els.inboxMenu) els.inboxMenu.style.display = 'none';
        if (els.floatingChat) els.floatingChat.style.display = 'none';
    }
},

    // --- 3. LẤY DỮ LIỆU ---
    async loadData() {
        try {
            const dogs = await DogAPI.getDogs();
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            UI.allDogsData = dogs;
            UI.renderDogList(dogs, currentUser, 'dog-list');
            UI.renderDogList(dogs, currentUser, 'dog-list-all');
        } catch (error) {
            console.error("Lỗi khi load sản phẩm:", error);
        }
    },

    // --- 4. QUẢN LÝ SỰ KIỆN ---
bindEvents() {
    
    // 1. Chuyển trang
    const navs = {
        'nav-home': 'home-page',
        'nav-product': 'product-page',
        'nav-post': 'post-page',
        'nav-detect': 'detect-page',
        'nav-login-item': 'login-page'
    };

    Object.keys(navs).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.onclick = () => UI.showPage(navs[id]);
    });

    // 2. Trang tĩnh (Chính sách, liên hệ...)
    document.querySelectorAll('[data-slug]').forEach(link => {
        link.onclick = (e) => {
            const slug = e.currentTarget.getAttribute('data-slug');
            this.loadStaticPage(slug);
        };
    });

    // 3. XỬ LÝ CHỌN FILE (Hiện preview)
    const imgFileBtn = document.getElementById('in-img-file');
    const linkInput = document.getElementById('in-img'); // Ô nhập link ảnh

    if (imgFileBtn) {
        imgFileBtn.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const preview = document.getElementById('post-img-preview');
                    preview.src = event.target.result;
                    document.getElementById('img-preview-wrap').classList.remove('hidden');
                    // Nếu đã chọn file thì xóa link trong ô nhập cho đỡ rối
                    if (linkInput) linkInput.value = "";
                };
                reader.readAsDataURL(file);
            }
        };
    }

    // 4. XỬ LÝ ĐĂNG BÀI (Hỗ trợ cả File và Link)
    const postForm = document.getElementById('post-form');
    if (postForm) {
        postForm.onsubmit = async (e) => {
            e.preventDefault();

            const previewImg = document.getElementById('post-img-preview');
            let finalImageUrl = "";

            // Kiểm tra: Nếu có ảnh Base64 trong preview thì lấy ảnh đó
            if (previewImg && previewImg.src.startsWith('data:image')) {
                finalImageUrl = previewImg.src;
            } 
            // Nếu không có ảnh preview thì lấy link từ ô nhập
            else if (linkInput && linkInput.value.trim() !== "") {
                finalImageUrl = linkInput.value.trim();
            }

            // Chặn nếu cả 2 đều trống
            if (!finalImageUrl || finalImageUrl.includes('placeholder') || finalImageUrl === window.location.href) {
                UI.showNotification('Thanh ơi, bạn phải chọn ảnh hoặc dán link nhé!', 'warning');
                return;
            }

            const newDog = {
                name: document.getElementById('in-name').value,
                breed: document.getElementById('in-breed').value,
                price: document.getElementById('in-price').value,
                category: document.getElementById('in-cate').value,
                image_url: finalImageUrl
            };

            UI.showNotification('Đang xử lý đăng bài...', 'info');
            
            try {
                const res = await DogAPI.addDog(newDog);
                if (res) {
                    UI.showNotification('Đã thêm sản phẩm thành công!');
                    postForm.reset();
                    // Reset vùng preview
                    if (document.getElementById('img-preview-wrap')) {
                        document.getElementById('img-preview-wrap').classList.add('hidden');
                    }
                    if (previewImg) previewImg.src = ""; 
                    
                    await this.loadData();
                    UI.showPage('home-page');
                }
            } catch (error) {
                console.error("Lỗi đăng bài:", error);
                UI.showNotification('Lỗi hệ thống, có thể do ảnh quá nặng!', 'error');
            }
        };
    }

    // 5. Xử lý Input nhận diện AI
    const aiInput = document.getElementById('ai-input');
    if (aiInput) aiInput.onchange = (e) => this.handleAIDetection(e);
},

    // --- 5. XỬ LÝ AI NHẬN DIỆN ---
    async handleAIDetection(e) {
        // BƯỚC 1: KIỂM TRA ĐĂNG NHẬP NGAY LẬP TỨC
        const user = localStorage.getItem('currentUser');
        
        // Nếu không có user hoặc user bị lưu là chuỗi 'null'
        if (!user || user === 'null') {
            UI.showNotification('Đăng nhập để sử dụng tính năng nhận diện AI! 🐾', 'warning');
            UI.showPage('login-page');
            
            // Xóa file đang chọn để tránh bug
            e.target.value = ""; 
            return; // DỪNG HÀM TẠI ĐÂY, không cho chạy xuống đoạn đọc file
        }

        // BƯỚC 2: NẾU ĐÃ ĐĂNG NHẬP MỚI CHẠY TIẾP
        const file = e.target.files[0];
        if (!file) return;

        // Preview ảnh
        const reader = new FileReader();
        reader.onload = (event) => {
            const previewImg = document.getElementById('ai-img-preview');
            if(previewImg) previewImg.src = event.target.result;
            document.getElementById('ai-init-view').classList.add('hidden');
            document.getElementById('ai-preview-view').classList.remove('hidden');
        };
        reader.readAsDataURL(file);

        const status = document.getElementById('ai-status');
        status.innerHTML = '<i class="fa fa-spinner fa-spin"></i> AI đang phân tích giống chó...';

        try {
            const result = await DogAPI.predictDog(file);

            if (result.success && result.predictions.length > 0) {
                let htmlResults = `
                    <div class="result-box" style="background:#fff; padding:15px; border-radius:10px; border:2px solid #ffafbd; margin-top:10px; color: #333;">
                        <p style="font-weight:bold; color:#ff758c; margin-bottom:10px;">Dự đoán từ AI:</p>
                        <ul style="list-style:none; padding:0; margin:0;">
                `;

                result.predictions.forEach((item, index) => {
                    htmlResults += `
                        <li style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom: ${index === result.predictions.length - 1 ? 'none' : '1px solid #eee'};">
                            <div style="text-align: left;">
                                <span style="font-weight:bold;">${index + 1}. ${item.breed}</span><br>
                                <small style="color:#666;">Độ tin cậy: ${item.confidence}</small>
                            </div>
                        </li>
                    `;
                });

                htmlResults += `</ul></div>`;
                status.innerHTML = htmlResults;

            } else {
                status.innerHTML = '<span style="color:red;">AI không nhận diện được, hãy thử ảnh khác!</span>';
            }
        } catch (error) {
            console.error("Lỗi kết nối AI Server:", error);
            status.innerHTML = '<span style="color:red;">Lỗi kết nối Server AI.</span>';
        }
    },

    // Hàm tự động điền tên giống chó vào form đăng bài
    fillAIData(breed) {
        const breedInput = document.getElementById('in-breed');
        if (breedInput) {
            breedInput.value = breed;
            UI.showPage('post-page');
            UI.showNotification(`Đã tự động điền: ${breed}`);
            // Cuộn lên đầu form cho dễ nhìn
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    // --- 6. QUẢN LÝ TÀI KHOẢN & TRANG TĨNH ---
    async handleLogin(e) {
        if(e) e.preventDefault();
        const username = document.getElementById('login-user').value;
        const password = document.getElementById('login-pass').value;

        try {
            const res = await fetch('api/auth.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'login', username, password })
            });
            const result = await res.json();

            if (result.success) { 
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                UI.showNotification(`Chào mừng ${result.user.fullname}!`);
                this.checkAuth();
                await this.loadData();
                UI.showPage('home-page');
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert("Lỗi kết nối Server.");
        }
    },
    // Trong file js/app.js
async handleRegister(event) {
        event.preventDefault();

        const fullname = document.getElementById('reg-fullname').value;
        const username = document.getElementById('reg-user').value;
        const password = document.getElementById('reg-pass').value;

        try {
            const response = await fetch('api/register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    fullname: fullname, 
                    username: username, 
                    password: password 
                })
            });

            const result = await response.json();

            if (result.status === "success") {
                alert("Đăng ký thành công! Bạn có thể đăng nhập ngay.");
                UI.showPage('login-page');
            } else {
                alert("Lỗi: " + result.message);
            }
        } catch (error) {
            console.error("Lỗi kết nối:", error);
            alert("Không thể kết nối đến máy chủ!");
        }
    },
    

logout() {
        // Xóa sạch dữ liệu trong LocalStorage
        localStorage.removeItem('currentUser');
        localStorage.clear(); 
        
        UI.showNotification("Đã đăng xuất thành công!");
        
        // Cập nhật lại giao diện (ẩn nút đăng bài, hiện nút đăng nhập)
        this.checkAuth();
        
        // Quay về trang chủ
        UI.showPage('home-page');
        
        // Buộc trình duyệt load lại để xóa mọi biến tạm trong bộ nhớ
        setTimeout(() => {
            location.reload();
        }, 500);
    },

    async loadStaticPage(slug) {
        UI.showPage('static-content-page'); 
        try {
            const res = await fetch(`api/pages.php?slug=${slug}`);
            const page = await res.json();
            document.getElementById('static-title').innerText = page.title;
            document.getElementById('static-body').innerHTML = page.content;
        } catch (error) {
            console.error("Lỗi trang tĩnh:", error);
        }
    },

    async deleteDog(id) {
        if (confirm("Thanh chắc chắn muốn xóa bé cún này chứ?")) {
            const result = await DogAPI.deleteDog(id);
            if (result && result.status === 'success') {
                UI.showNotification("Đã xóa thành công!");
                await this.loadData();
            } else {
                alert("Lỗi khi xóa sản phẩm.");
            }
        }
    },
    resetAiUpload() {
    // 1. Reset giá trị input file về rỗng để có thể chọn lại chính tấm ảnh vừa rồi nếu muốn
    const aiInput = document.getElementById('ai-input');
    if (aiInput) aiInput.value = '';

    // 2. Ẩn vùng hiển thị kết quả hiện tại đi
    const previewView = document.getElementById('ai-preview-view');
    if (previewView) previewView.classList.add('hidden');

    // 3. Hiển thị lại vùng kéo thả ảnh ban đầu (vùng có icon đám mây)
    const initView = document.getElementById('ai-init-view');
    if (initView) initView.classList.remove('hidden');
    
    // 4. Làm sạch chữ kết quả cũ của lần tra cứu trước
    const aiStatus = document.getElementById('ai-status');
    if (aiStatus) aiStatus.innerHTML = '';
},
    

};




// Hiển thị popup sau 3 giây khi vào trang
window.onload = () => {
    setTimeout(() => {
        const popup = document.getElementById('ai-popup');
        if (popup) popup.classList.remove('hidden');
    }, 100); 
};

window.goToAIDetect = function() {
    const popup = document.getElementById('ai-popup');
    if (popup) popup.classList.add('hidden');

    UI.showPage('detect-page');

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.closeAiPopup = function() {
    document.getElementById('ai-popup').classList.add('hidden');
};

// Tự động kiểm tra và hiển thị tin nhắn mới mỗi 2 giây
setInterval(() => {
    // Chỉ cập nhật khi khung chat đang mở để tránh lãng phí tài nguyên
    const chatBox = document.getElementById('chat-box');
    if (chatBox && !chatBox.classList.contains('hidden')) {
        UI.loadMessages(); 
    }
}, 2000);



window.app = app;
app.init();