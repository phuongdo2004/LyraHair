
// ==========================================
// 1. UPLOAD IMAGE MULTIPLE (ĐÃ SỬA LỖI NUỐT NÚT XÓA)
// ==========================================
const uploadImage = document.querySelector("[upload-image]");
if (uploadImage) {
  const uploadImageInput = uploadImage.querySelector("[upload-image-input]");
  const uploadImageContainer = uploadImage.querySelector("[upload-image-container]");
  const closeIconUpload = uploadImage.querySelector("[close-icon-upload]");

  uploadImageInput.addEventListener("change", (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadImage.classList.add("has-image");
      
      // CHỈ xóa các khung ảnh cũ/mới (group-image-item), GIỮ lại nút "Xóa tất cả"
      const oldItems = uploadImageContainer.querySelectorAll(".group-image-item");
      oldItems.forEach(item => item.remove());
      
      uploadImageContainer.classList.remove("hidden");

      Array.from(files).forEach((file, index) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const div = document.createElement("div");
            // Thêm class định danh group-image-item để quản lý
            div.className = "relative aspect-square w-full h-full rounded-xl overflow-hidden border border-neutral-200 group-image-item shadow-sm";
            div.innerHTML = `
              <img src="${event.target.result}" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <button type="button" class="w-8 h-8 rounded-full bg-white text-red-500 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer delete-single-image">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            `;
            uploadImageContainer.appendChild(div);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  });

  // Nút xóa tất cả ảnh đã chọn
  if (closeIconUpload) {
    closeIconUpload.addEventListener("click", (e) => {
      e.preventDefault(); 
      e.stopPropagation(); 
      
      uploadImageInput.value = ""; // Reset input file gốc
      uploadImage.classList.remove("has-image");
      
      // Chỉ dọn sạch các item ảnh, không phá vỡ cấu trúc nút của container
      const oldItems = uploadImageContainer.querySelectorAll(".group-image-item");
      oldItems.forEach(item => item.remove());
      uploadImageContainer.classList.add("hidden");
    });
  }

  // Lắng nghe sự kiện xóa lẻ từng tấm ảnh bằng Ủy quyền sự kiện (Event Delegation)
  uploadImageContainer.addEventListener("click", (e) => {
    const btnDelete = e.target.closest(".delete-single-image");
    if (btnDelete) {
      e.preventDefault();
      const imageItem = btnDelete.closest(".group-image-item");
      if (imageItem) {
        imageItem.remove();
      }

      // Nếu xóa hết sạch ảnh lẻ, tự động thu hồi giao diện về ban đầu
      const remainingItems = uploadImageContainer.querySelectorAll(".group-image-item");
      if (remainingItems.length === 0) {
        uploadImageInput.value = "";
        uploadImage.classList.remove("has-image");
        uploadImageContainer.classList.add("hidden");
      }
    }
  });
}
// End Upload Image

// ==========================================
// 2. TOAST SYSTEM (ĐÃ CHUẨN HÓA)
// ==========================================
function showToast(message) {
  const toast = document.getElementById('toast-success'); 
  if (toast) {
    // Nếu trong hàm nhận vào các keyword trạng thái, em có thể đổi text tương ứng tại đây nếu cần
    // ví dụ: toast.querySelector('.toast-body').innerText = message;

    toast.classList.add('show'); 
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  
    const timer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      
      const onTransitionEnd = () => {
        toast.classList.remove('show');
        toast.removeEventListener('transitionend', onTransitionEnd);
      };
      toast.addEventListener('transitionend', onTransitionEnd);
    }, 3000);
   
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
      closeBtn.onclick = () => {
        toast.classList.remove('show');
        clearTimeout(timer);
      };
    }
  }
}

// ==========================================
// 3. SOFT DELETE SERVICES
// ==========================================
const buttonsDelete = document.querySelectorAll("[button-delete]");
if (buttonsDelete.length > 0) {
  const formDeleteItem = document.querySelector("#form-delete-item");
  const path = formDeleteItem.getAttribute("data-path");

  buttonsDelete.forEach((button) => {
    button.addEventListener("click", () => {
      const isConfirm = confirm("Bạn có chắc muốn xóa dịch vụ này không?");

      if (isConfirm) {
        const id = button.getAttribute("data-id");
        const action = `${path}/${id}?_method=PATCH`;
        
        formDeleteItem.action = action;
        formDeleteItem.submit(); 
      }
    });
  });
}
// End deleted

// ==========================================
// 4. AVATAR PREVIEW
// ==========================================
const avatarInput = document.getElementById('avatar-input');
const avatarPreview = document.getElementById('avatar-preview');
const cameraIcon = document.getElementById('camera-icon');
const resetBtn = document.getElementById('reset-avatar');

if (avatarInput) {
  avatarInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        avatarPreview.src = e.target.result;
        avatarPreview.classList.remove('hidden');
        cameraIcon.classList.add('hidden');
        resetBtn.classList.remove('hidden');
      }
      
      reader.readAsDataURL(file);
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      avatarInput.value = ""; 
      avatarPreview.src = "#";
      avatarPreview.classList.add('hidden');
      cameraIcon.removeLines ? cameraIcon.classList.remove('hidden') : cameraIcon.classList.remove('hidden');
      this.classList.add('hidden');
    });
  }
}
// End preview

// ==========================================
// 5. CHANGE STATUS ARTIST
// ==========================================
const buttonsChangeStatus = document.querySelectorAll("[button-change-status-artist]");
if (buttonsChangeStatus.length > 0) {
  const formChangeStatus = document.querySelector("#form-change-status-artist");
  const path = formChangeStatus.getAttribute("data-path");

  buttonsChangeStatus.forEach(button => {
    button.addEventListener("click", () => {
      const isConfirm = confirm("Bạn có chắc chắn muốn cho nghệ sĩ này nghỉ việc?");
      
      if (isConfirm) {
        const id = button.getAttribute("data-id");
        formChangeStatus.action = `${path}/${id}?_method=PATCH`;
        formChangeStatus.submit();
      }
    });
  });
}