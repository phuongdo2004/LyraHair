
const uploadImage = document.querySelector("[upload-image]");
if (uploadImage) {
  const uploadImageInput = uploadImage.querySelector("[upload-image-input]");
  const uploadImageContainer = uploadImage.querySelector("[upload-image-container]");
  const closeIconUpload = uploadImage.querySelector("[close-icon-upload]");

  uploadImageInput.addEventListener("change", (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadImage.classList.add("has-image");
      uploadImageContainer.innerHTML = ''; // Clear cũ

      Array.from(files).forEach(file => {
        // Kiểm tra xem có phải là ảnh không
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const div = document.createElement("div");
            // Thêm các class Tailwind trực tiếp để kiểm soát giao diện
            div.className = "relative aspect-square w-full h-full rounded-xl overflow-hidden border border-neutral-200";
            div.innerHTML = `
              <img src="${event.target.result}" class="w-full h-full object-cover" />
            `;
            uploadImageContainer.appendChild(div);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  });

  // Nút xóa tất cả
  if (closeIconUpload) {
    closeIconUpload.addEventListener("click", (e) => {
      e.preventDefault(); // Ngăn submit form
      e.stopPropagation(); // Ngăn ảnh hưởng đến input
      
      uploadImageInput.value = ""; // Quan trọng: Reset input file
      uploadImage.classList.remove("has-image");
      uploadImageContainer.innerHTML = "";
    });
  }
}
// End Upload Image
// toast start
// function showToast(type) {
//     const toast = document.getElementById(`toast-${type}`);
    
//     // Kiểm tra xem phần tử có tồn tại trên trang không
//     if (!toast) return;

//     toast.classList.add("active");

//     const timer = setTimeout(() => {
//         toast.classList.remove("active");
//     }, 4000);

//     // Nút đóng thủ công (dùng onclick để tránh trùng lặp event)
//     const closeBtn = toast.querySelector(".toast-close");
//     if (closeBtn) {
//         closeBtn.onclick = () => {
//             toast.classList.remove("active");
//             clearTimeout(timer); // Hủy bộ đếm nếu người dùng đóng tay
//         };
//     }
// }
function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.getElementById('toast-success'); // Hoặc tạo mới element
  if(toast){
    // Hiển thị toast
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

// toast end 
// deleted start
// Xử lý Xóa mềm (Soft Delete)
const buttonsDelete = document.querySelectorAll("[button-delete]");
if (buttonsDelete.length > 0) {
  const formDeleteItem = document.querySelector("#form-delete-item");
  const path = formDeleteItem.getAttribute("data-path");

  buttonsDelete.forEach((button) => {
    button.addEventListener("click", () => {
      const isConfirm = confirm("Bạn có chắc muốn xóa dịch vụ này không?");

      if (isConfirm) {
        const id = button.getAttribute("data-id");
        // Thiết lập action cho form: /admin/service/delete/ID?_method=PATCH
        const action = `${path}/${id}?_method=PATCH`;
        
        formDeleteItem.action = action;
        formDeleteItem.submit(); // Gửi yêu cầu đi
      }
    });
  });
}
// deleted end
// preview start
const avatarInput = document.getElementById('avatar-input');
    const avatarPreview = document.getElementById('avatar-preview');
    const cameraIcon = document.getElementById('camera-icon');
    const resetBtn = document.getElementById('reset-avatar');
if(avatarInput){
   avatarInput.addEventListener('change', function() {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
          // Hiển thị ảnh và ẩn icon
          avatarPreview.src = e.target.result;
          avatarPreview.classList.remove('hidden');
          cameraIcon.classList.add('hidden');
          resetBtn.classList.remove('hidden');
        }
        
        reader.readAsDataURL(file);
      }
    });

    // Xử lý khi nhấn nút xóa ảnh
    resetBtn.addEventListener('click', function() {
      avatarInput.value = ""; // Xóa file trong input
      avatarPreview.src = "#";
      avatarPreview.classList.add('hidden');
      cameraIcon.classList.remove('hidden');
      this.classList.add('hidden');
    });
}
   
// preview end
// deleted ảtist
// Xử lý thay đổi trạng thái Artist (Nghỉ việc)
// Xử lý Thay đổi trạng thái Artist cho toàn bộ danh sách
const buttonsChangeStatus = document.querySelectorAll("[button-change-status-artist]");

if (buttonsChangeStatus.length > 0) {
    const formChangeStatus = document.querySelector("#form-change-status-artist");
    const path = formChangeStatus.getAttribute("data-path");

    buttonsChangeStatus.forEach(button => {
        button.addEventListener("click", () => {
            const isConfirm = confirm("Bạn có chắc chắn muốn cho nghệ sĩ này nghỉ việc?");
            
            if (isConfirm) {
                const id = button.getAttribute("data-id");
                
                // Gán action: lấy path gốc từ form (đã xóa ID cứng) và nối ID mới vào
                // Ví dụ: /admin/artists/deleted/ID_CỦA_NÚT_VỪA_BẤM?_method=PATCH
                formChangeStatus.action = `${path}/${id}?_method=PATCH`;
                
                formChangeStatus.submit();
            }
        });
    });
}
