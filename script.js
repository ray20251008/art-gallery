const defaultData = [
    {
        id: '1',
        frontImage: 'assets/images/snowman_final_1778802920722.png',
        backImage: 'assets/images/snowman_process_1778802932934.png',
        title: '歡樂雪人家族',
        className: '三年7班',
        studentName: '李丞祐',
        description: '用雙手細心揉捏輕黏土，將不同顏色的黏土混合，一步步為雪人戴上帽子和圍巾，充滿創意的過程！'
    },
    {
        id: '2',
        frontImage: 'assets/images/fish_final_1778802948923.png',
        backImage: 'assets/images/fish_process_1778802963404.png',
        title: '海洋之星紙盤魚',
        className: '三年6班',
        studentName: '陳昀萱',
        description: '利用廢棄的紙盤作為畫布，大膽運用水彩顏料與畫筆，揮灑出鮮豔的色彩，創作出獨一無二的熱帶魚。'
    }
];

let galleryData = [];
let isEditMode = false;

document.addEventListener('DOMContentLoaded', () => {
    initData();
    renderGallery();
    setupAdminControls();
});

function initData() {
    const savedData = localStorage.getItem('ezine_gallery_data');
    if (savedData) {
        galleryData = JSON.parse(savedData);
    } else {
        galleryData = JSON.parse(JSON.stringify(defaultData));
    }
}

function saveData() {
    localStorage.setItem('ezine_gallery_data', JSON.stringify(galleryData));
}

function renderGallery() {
    const galleryContainer = document.getElementById('gallery');
    galleryContainer.innerHTML = '';

    galleryData.forEach((item, index) => {
        const cardHTML = `
        <div class="card" tabindex="0" data-id="${item.id}" data-index="${index}">
            <button class="delete-card-btn" title="刪除作品">×</button>
            <div class="card-inner">
                <!-- 正面：成品呈現 -->
                <div class="card-front">
                    <div class="image-wrapper">
                        <img src="${item.frontImage}" alt="${item.title}成品" loading="lazy">
                        <div class="tag">成品呈現</div>
                        <label class="image-upload-label">
                            更換成品圖片
                            <input type="file" class="image-upload-input" accept="image/*" data-side="front" data-index="${index}">
                        </label>
                    </div>
                    <div class="card-content">
                        <h2 class="theme-title" ${isEditMode ? 'contenteditable="true"' : ''} data-field="title" data-index="${index}">${item.title}</h2>
                        <div class="student-info">
                            <span class="class-name" ${isEditMode ? 'contenteditable="true"' : ''} data-field="className" data-index="${index}">${item.className}</span>
                            <span class="student-name" ${isEditMode ? 'contenteditable="true"' : ''} data-field="studentName" data-index="${index}">${item.studentName}</span>
                        </div>
                    </div>
                    <div class="interaction-hint">
                        <svg class="flip-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        <span>點擊觀看製作過程</span>
                    </div>
                </div>
                <!-- 背面：製作過程 -->
                <div class="card-back">
                    <div class="image-wrapper">
                        <img src="${item.backImage}" alt="${item.title}製作過程" loading="lazy">
                        <div class="tag process-tag">製作過程</div>
                        <label class="image-upload-label">
                            更換過程圖片
                            <input type="file" class="image-upload-input" accept="image/*" data-side="back" data-index="${index}">
                        </label>
                    </div>
                    <div class="card-content">
                        <h2 class="theme-title" ${isEditMode ? 'contenteditable="true"' : ''} data-field="title" data-index="${index}">${item.title}</h2>
                        <p class="process-desc" ${isEditMode ? 'contenteditable="true"' : ''} data-field="description" data-index="${index}">${item.description}</p>
                    </div>
                    <div class="interaction-hint">
                        <svg class="flip-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                        <span>點擊返回成品</span>
                    </div>
                </div>
            </div>
        </div>
        `;
        galleryContainer.insertAdjacentHTML('beforeend', cardHTML);
    });

    setupCardInteractions();
}

function setupCardInteractions() {
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        // 卡片翻轉邏輯
        card.addEventListener('click', function(e) {
            // 如果點擊的是可編輯區域或上傳按鈕，則不要翻轉卡片
            if (e.target.closest('[contenteditable="true"]') || e.target.closest('.image-upload-label') || e.target.closest('.delete-card-btn')) {
                return;
            }
            this.classList.toggle('is-flipped');
        });

        // 刪除按鈕
        const deleteBtn = card.querySelector('.delete-card-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (confirm('確定要刪除這個作品嗎？')) {
                    const index = card.getAttribute('data-index');
                    galleryData.splice(index, 1);
                    saveData();
                    renderGallery();
                }
            });
        }
    });

    // 圖片上傳邏輯
    const fileInputs = document.querySelectorAll('.image-upload-input');
    fileInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const index = this.getAttribute('data-index');
            const side = this.getAttribute('data-side');

            const reader = new FileReader();
            reader.onload = function(event) {
                const base64String = event.target.result;
                if (side === 'front') {
                    galleryData[index].frontImage = base64String;
                } else {
                    galleryData[index].backImage = base64String;
                }
                saveData();
                renderGallery();
            };
            reader.readAsDataURL(file);
        });
    });

    // 文字編輯邏輯
    const editableFields = document.querySelectorAll('[contenteditable="true"]');
    editableFields.forEach(field => {
        field.addEventListener('input', function() {
            const index = this.getAttribute('data-index');
            const fieldName = this.getAttribute('data-field');
            galleryData[index][fieldName] = this.innerText;
            saveData();
        });
        
        // 確保 Enter 鍵在標題與姓名欄位不會產生換行，而是取消焦點
        field.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && fieldName !== 'description') {
                e.preventDefault();
                this.blur();
            }
        });
    });
}

function setupAdminControls() {
    const toggleBtn = document.getElementById('toggle-edit-btn');
    const addCardBtn = document.getElementById('add-card-btn');
    const resetDataBtn = document.getElementById('reset-data-btn');

    toggleBtn.addEventListener('click', () => {
        isEditMode = !isEditMode;
        if (isEditMode) {
            toggleBtn.textContent = '儲存並離開編輯';
            toggleBtn.classList.add('editing');
            addCardBtn.style.display = 'inline-block';
            resetDataBtn.style.display = 'inline-block';
            document.body.classList.add('edit-mode');
        } else {
            toggleBtn.textContent = '進入編輯模式';
            toggleBtn.classList.remove('editing');
            addCardBtn.style.display = 'none';
            resetDataBtn.style.display = 'none';
            document.body.classList.remove('edit-mode');
        }
        renderGallery();
    });

    addCardBtn.addEventListener('click', () => {
        const newCard = {
            id: Date.now().toString(),
            frontImage: 'https://via.placeholder.com/600x400?text=上傳成品圖片',
            backImage: 'https://via.placeholder.com/600x400?text=上傳過程圖片',
            title: '新作品標題',
            className: '班級',
            studentName: '學生姓名',
            description: '請點擊這裡輸入作品的製作過程描述。'
        };
        galleryData.push(newCard);
        saveData();
        renderGallery();
        
        // 捲動到最底部
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });

    resetDataBtn.addEventListener('click', () => {
        if (confirm('確定要重設為預設資料嗎？這將會清除您新增的所有作品。')) {
            galleryData = JSON.parse(JSON.stringify(defaultData));
            saveData();
            renderGallery();
        }
    });
}
