document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        // 點擊事件：翻轉卡片
        card.addEventListener('click', function() {
            this.classList.toggle('is-flipped');
        });

        // 鍵盤無障礙支援：使用 Enter 鍵翻轉卡片
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.classList.toggle('is-flipped');
            }
        });
    });
});
