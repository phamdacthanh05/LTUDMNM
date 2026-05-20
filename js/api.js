export const DogAPI = {
    // 1. Gọi API từ localhost (PHP/MySQL)
    async getDogs() {
        const response = await fetch('http://localhost/LTUDMNM/api/dogs.php');
        return await response.json();
    },

    async addDog(dogData) {
        const response = await fetch('http://localhost/LTUDMNM/api/dogs.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dogData)
        });
        return await response.json();
    },

    async deleteDog(id) {
        try {
            const res = await fetch(`api/delete_dog.php?id=${id}`, {
                method: 'DELETE'
            });
            return await res.json();
        } catch (error) {
            console.error("Lỗi xóa chó:", error);
            return false;
        }
    },

    // 2. GỌI API NHẬN DIỆN (AI SERVER - Flask)
    // Truyền vào một đối tượng File từ <input type="file">
    async predictDog(imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);

        try {
            const response = await fetch('http://127.0.0.1:5000/predict', {
                method: 'POST',
                body: formData
            });
            return await response.json();
        } catch (error) {
            console.error("Lỗi nhận diện AI:", error);
            return { success: false, error: error.message };
        }
    }
};