const defaultData = [
    {
        id: '1',
        frontImage: 'assets/images/snowman_final_1778802920722.png',
        backImage: 'assets/images/snowman_process_1778802932934.png',
        title: '歡樂雪人家族',
        studentName: '李丞祐',
        description: '用雙手細心揉捏輕黏土，將不同顏色的黏土混合，一步步為雪人戴上帽子和圍巾，充滿創意的過程！'
    },
    {
        id: '2',
        frontImage: 'assets/images/fish_final_1778802948923.png',
        backImage: 'assets/images/fish_process_1778802963404.png',
        title: '海洋之星紙盤魚',
        studentName: '陳昀萱',
        description: '利用廢棄的紙盤作為畫布，大膽運用水彩顏料與畫筆，揮灑出鮮豔的色彩，創作出獨一無二的熱帶魚。'
    }
];

// 從對話中取得的 firebaseConfig
const firebaseConfig = {
  apiKey: "AIzaSyB-KTIyWShie-0-1y6Jn0SUQH65dja6iYk",
  authDomain: "are-gallery.firebaseapp.com",
  projectId: "are-gallery",
  storageBucket: "are-gallery.firebasestorage.app",
  messagingSenderId: "547960482393",
  appId: "1:547960482393:web:3f5256a17d190ac0399f48",
  measurementId: "G-3TS6E2XF6J"
};

// 初始化 Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();
const dbRef = db.ref('galleryData');

let galleryData = [];
let isEditMode = false;

document.addEventListener('DOMContentLoaded', () => {
    initData();
    setupAdminControls();
});

function initData() {
    const syncStatus = document.getElementById('sync-status');
    if (syncStatus) syncStatus.textContent = '⏳ 雲端載入中...';
    
    // 監聽雲端資料變化 (只要有人修改，畫面會即時更新！)
    dbRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            galleryData = data;
        } else {
            // 如果雲端是空的，寫入預設資料
            galleryData = JSON.parse(JSON.stringify(defaultData));
            dbRef.set(galleryData);
        }
        renderGallery();
        if (syncStatus) syncStatus.textContent = '☁️ 已與雲端同步';
    });
}

function saveData() {
    const syncStatus = document.getElementById('sync-status');
    if (syncStatus) syncStatus.textContent = '⏳ 雲端同步中...';
    
    dbRef.set(galleryData).then(() => {
        if (syncStatus) syncStatus.textContent = '☁️ 已與雲端同步';
    }).catch((error) => {
        console.error("同步失敗:", error);
        if (syncStatus) syncStatus.textContent = '⚠️ 同步失敗';
    });
}

// 壓縮圖片函數 (避免上傳原圖導致資料庫爆滿)
function compressImage(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1000;
            const MAX_HEIGHT = 1000;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // 將圖片轉為品質 60% 的 JPEG (大幅縮小檔案)
            const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
            callback(dataUrl);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function renderGallery() {
    const galleryContainer = document.getElementById('gallery');
    galleryContainer.innerHTML = '';

    galleryData.forEach((item, index) => {
        const cardHTML = `
        <div class="card" data-id="${item.id}" data-index="${index}">
            <button class="delete-card-btn" title="刪除作品">×</button>
            <div class="card-inner">
                <!-- 頂部資訊區 -->
                <div class="card-header">
                    <h2 class="theme-title" ${isEditMode ? 'contenteditable="true"' : ''} data-field="title" data-index="${index}">${item.title}</h2>
                    <div class="student-info">
                        <span class="student-name" ${isEditMode ? 'contenteditable="true"' : ''} data-field="studentName" data-index="${index}">${item.studentName}</span>
                    </div>
                </div>
                
                <!-- 雙圖片區 -->
                <div class="card-images">
                    <!-- 左邊：製作過程 -->
                    <div class="image-column">
                        <div class="image-wrapper">
                            <img src="${item.backImage}" alt="${item.title}製作過程" loading="lazy">
                            <div class="tag tag-process">🎨 製作過程</div>
                            <div class="upload-controls">
                                <label class="image-upload-label">
                                    📁 選照片
                                    <input type="file" class="image-upload-input" accept="image/*" data-side="back" data-index="${index}">
                                </label>
                                <label class="image-upload-label camera-btn">
                                    📸 拍照
                                    <input type="file" class="image-upload-input" accept="image/*" capture="environment" data-side="back" data-index="${index}">
                                </label>
                            </div>
                        </div>
                    </div>
                    <!-- 右邊：成品呈現 -->
                    <div class="image-column">
                        <div class="image-wrapper">
                            <img src="${item.frontImage}" alt="${item.title}成品" loading="lazy">
                            <div class="tag tag-final">✨ 成品呈現</div>
                            <div class="upload-controls">
                                <label class="image-upload-label">
                                    📁 選照片
                                    <input type="file" class="image-upload-input" accept="image/*" data-side="front" data-index="${index}">
                                </label>
                                <label class="image-upload-label camera-btn">
                                    📸 拍照
                                    <input type="file" class="image-upload-input" accept="image/*" capture="environment" data-side="front" data-index="${index}">
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 底部描述區 -->
                <div class="card-footer">
                    <p class="process-desc" ${isEditMode ? 'contenteditable="true"' : ''} data-field="description" data-index="${index}">${item.description}</p>
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
        // 刪除按鈕
        const deleteBtn = card.querySelector('.delete-card-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (confirm('確定要刪除這個作品嗎？')) {
                    const index = card.getAttribute('data-index');
                    galleryData.splice(index, 1);
                    saveData();
                }
            });
        }
    });

    // 圖片上傳邏輯 (使用壓縮後上傳)
    const fileInputs = document.querySelectorAll('.image-upload-input');
    fileInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const index = this.getAttribute('data-index');
            const side = this.getAttribute('data-side');

            // 壓縮並轉存 Base64
            compressImage(file, (compressedBase64) => {
                if (side === 'front') {
                    galleryData[index].frontImage = compressedBase64;
                } else {
                    galleryData[index].backImage = compressedBase64;
                }
                saveData(); // 直接存上雲端
            });
        });
    });

    // 文字編輯邏輯
    const editableFields = document.querySelectorAll('[contenteditable="true"]');
    editableFields.forEach(field => {
        field.addEventListener('input', function() {
            const index = this.getAttribute('data-index');
            const fieldName = this.getAttribute('data-field');
            galleryData[index][fieldName] = this.innerText;
            // 每次輸入就自動存雲端
            saveData();
        });
        
        // 確保 Enter 鍵在標題與姓名欄位不會產生換行，而是取消焦點
        field.addEventListener('keydown', function(e) {
            const fieldName = this.getAttribute('data-field');
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
    const exportHtmlBtn = document.getElementById('export-html-btn');
    const backupDataBtn = document.getElementById('backup-data-btn');
    const restoreDataInput = document.getElementById('restore-data-input');

    if(toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            isEditMode = !isEditMode;
            if (isEditMode) {
                toggleBtn.textContent = '儲存並離開編輯';
                toggleBtn.classList.add('editing');
                if(addCardBtn) addCardBtn.style.display = 'inline-block';
                document.body.classList.add('edit-mode');
            } else {
                toggleBtn.textContent = '進入編輯模式';
                toggleBtn.classList.remove('editing');
                if(addCardBtn) addCardBtn.style.display = 'none';
                document.body.classList.remove('edit-mode');
            }
            renderGallery();
        });
    }

    if(addCardBtn) {
        addCardBtn.addEventListener('click', () => {
            const newCard = {
                id: Date.now().toString(),
                frontImage: 'https://via.placeholder.com/600x400?text=上傳成品圖片',
                backImage: 'https://via.placeholder.com/600x400?text=上傳過程圖片',
                title: '新作品標題',
                studentName: '學生姓名',
                description: '請點擊這裡輸入作品的製作過程描述。'
            };
            galleryData.push(newCard);
            saveData();
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        });
    }

    if(exportHtmlBtn) {
        exportHtmlBtn.addEventListener('click', () => {
            if (isEditMode) {
                alert("請先點擊「儲存並離開編輯」退出編輯模式後，再進行匯出！");
                return;
            }
            const galleryHTML = document.getElementById('gallery').innerHTML;
            const template = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>童話奇緣 - 學生手作成果展 (公開展示版)</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&family=Noto+Sans+TC:wght@400;700;900&display=swap" rel="stylesheet">
</head>
<body>
    <header class="hero">
        <div class="hero-content">
            <span class="badge">Art Exhibition</span>
            <h1>童話奇緣 <span>手作大賞</span></h1>
            <p>作品大賞！左右比對孩子的創作過程與最終成品。</p>
        </div>
        <div class="hero-decoration"></div>
    </header>
    <main class="gallery-container">
        ${galleryHTML}
    </main>
    <footer>
        <p>&copy; 2026 童話樂園 學生作品集電子刊物</p>
    </footer>
</body>
</html>`;
            const parser = new DOMParser();
            const doc = parser.parseFromString(template, 'text/html');
            doc.querySelectorAll('.delete-card-btn').forEach(el => el.remove());
            doc.querySelectorAll('.upload-controls').forEach(el => el.remove());
            doc.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
            const finalHTML = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
            const blob = new Blob([finalHTML], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'public_gallery.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert("🎉 匯出成功！這是給家長看的純展示版本。");
        });
    }

    if(backupDataBtn) {
        backupDataBtn.addEventListener('click', () => {
            const dataStr = JSON.stringify(galleryData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'gallery_backup.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert("💾 備份檔下載成功！(此為本機備份，雲端也會自動儲存喔！)");
        });
    }

    if(restoreDataInput) {
        restoreDataInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const importedData = JSON.parse(event.target.result);
                    if (Array.isArray(importedData)) {
                        galleryData = importedData;
                        saveData(); // Save imported data to cloud
                        renderGallery();
                        alert("📂 成功讀取備份！並已同步覆蓋到雲端！");
                    }
                } catch (error) {
                    alert("⚠️ 讀取失敗，檔案可能有損壞。");
                }
            };
            reader.readAsText(file);
            e.target.value = '';
        });
    }
}
