function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.getElementById('toast-success'); // Hoặc tạo mới element
  // console.log(toast);
  // Hiển thị toast
  if(toast){
    console.log(toast);
      toast.classList.add('show'); 
  
  // Sau 3 giây thì bắt đầu ẩn
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    
    // Đợi hiệu ứng transition chạy xong (khoảng 300ms) rồi xóa hẳn
    toast.addEventListener('transitionend', () => {
      toast.remove(); 
    });
  }, 3000);
  
// Logic cho nút đóng (x)
document.querySelector('.toast-close').addEventListener('click', (e) => {
    const toast = e.target.closest('.toast');
    toast.remove();
});
}
}
showToast('success');
showToast('waring');
showToast('delete');

// // toast end 
    async function toggleFavorite(btn) {
      const serviceId = btn.getAttribute('data-id');
      const icon = btn.querySelector('i');
      
      // 1. Optimistic UI: Đổi màu ngay để tạo cảm giác mượt mà
      const isAdding = icon.classList.contains('fa-regular');
      const updateUI = (adding) => {
        if (adding) {
          icon.classList.replace('fa-regular', 'fa-solid');
          icon.classList.add('text-red-500');
          btn.classList.add('bg-white');
          btn.classList.remove('bg-black/20', 'text-white');
        } else {
          icon.classList.replace('fa-solid', 'fa-regular');
          icon.classList.remove('text-red-500');
          btn.classList.remove('bg-white');
          btn.classList.add('bg-black/20', 'text-white');
        }
      };

      updateUI(isAdding);

      try {
        const response = await fetch('/service/favorite/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serviceId: serviceId })
        });

        // KIỂM TRA PHẢN HỒI HTTP TRƯỚC KHI ĐỌC JSON
        if (!response.ok) {
          if (response.status === 401) {
            alert("Vui lòng đăng nhập để thực hiện chức năng này!");
            window.location.href = "/user/login";
            return;
          }
          // Nếu là lỗi 500 hoặc lỗi khác, ném lỗi để nhảy vào catch
          throw new Error(`Server returned status ${response.status}`);
        }

        // Chỉ đọc JSON khi chắc chắn response thành công (200 OK)
        const result = await response.json();
        console.log(result);
        if (result.code === 200) {
          alert("Thêm vào mục yêu thích thành công!");
        } else {
          throw new Error(result.message || "Unknown error");
        }

      } catch (error) {
        console.error("Lỗi thực thi:", error);
        // 3. ĐẢO NGƯỢC LẠI GIAO DIỆN NẾU THẤT BẠI
        updateUI(!isAdding); 
        alert("Không thể cập nhật mục yêu thích. Vui lòng kiểm tra lại kết nối!");
      }
    }
