import { DogAPI } from './api.js';
import { UI } from './ui.js';

export const Product = {
    // Hàm này sẽ đổ dữ liệu vào thẻ #dog-list trong index.html
    async renderAllDogs() {
        const dogContainer = document.getElementById('dog-list');
        if (!dogContainer) return;

        // Hiện hiệu ứng đang tải (tùy chọn)
        dogContainer.innerHTML = '<p style="text-align:center; width:100%;">Đang tải danh sách cún cưng...</p>';

        try {
            const dogs = await DogAPI.getDogs();
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));

            // Sử dụng hàm render có sẵn trong UI.js của bạn
            UI.renderDogList(dogs, currentUser);
            
        } catch (error) {
            console.error("Lỗi khi tải sản phẩm:", error);
            dogContainer.innerHTML = '<p>Không thể tải dữ liệu. Vui lòng thử lại sau.</p>';
        }
    }
};