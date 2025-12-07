// JavaScript
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reportForm');
    const messageElement = document.getElementById('message');
    const listElement = document.getElementById('reportList');
    const loadingElement = document.getElementById('loading');
    const submitButton = document.getElementById('submitButton');

    // --- GASとの通信ヘルパー関数 ---
    // google.script.run をPromiseでラップし、GASのサーバー側関数を非同期で呼び出す
    function postToGas(action, data) {
        return new Promise((resolve, reject) => {
            google.script.run
                .withSuccessHandler(resolve)
                .withFailureHandler(reject)
                [action](data); 
        });
    }

    // --- ② 日報一覧表示機能のロジック ---
    function loadReports() {
        loadingElement.style.display = 'block';
        listElement.innerHTML = '';
        
        postToGas('getReports', null) // GASの getReports 関数を呼び出す
            .then(reports => {
                loadingElement.style.display = 'none';

                if (reports.status === 'error') {
                    listElement.innerHTML = `<p style="color: red;">${reports.message}</p>`;
                    return;
                }

                if (reports.length === 0) {
                    listElement.innerHTML = '<p>まだ日報がありません。</p>';
                    return;
                }

                reports.forEach(report => {
                    const li = document.createElement('li');
                    li.className = 'report-item';
                    li.dataset.id = report.id;
                    
                    li.innerHTML = `
                        <span class="condition-emoji">${report.condition}</span>
                        <div class="report-header">
                            <strong>${report.name}</strong>
                            <span>${report.date}</span>
                        </div>
                        <div class="report-body">
                            <p><strong>今日やったこと:</strong> ${report.done.replace(/\n/g, '<br>')}</p>
                            <p><strong>翌営業日やること:</strong> ${report.next.replace(/\n/g, '<br>')}</p>
                            <p><strong>所感・学び:</strong> ${report.review ? report.review.replace(/\n/g, '<br>') : '---'}</p>
                        </div>
                        <button class="like-button" data-id="${report.id}">
                            いいね 👍
                        </button>
                        <span class="like-count" data-id="${report.id}">${report.likes}</span>
                    `;
                    listElement.appendChild(li);
                });

                document.querySelectorAll('.like-button').forEach(button => {
                    button.addEventListener('click', handleLike);
                });
            })
            .catch(error => {
                loadingElement.style.display = 'none';
                listElement.innerHTML = `<p style="color: red;">日報の読み込み中に通信エラーが発生しました: ${error.message}</p>`;
                console.error('通信エラー:', error);
            });
    }

    // --- ③ 「いいね」リアクション機能のロジック ---
    function handleLike(event) {
        const button = event.currentTarget;
        const reportId = button.dataset.id;
        const likeCountSpan = document.querySelector(`.like-count[data-id="${reportId}"]`);
        
        button.disabled = true;
        
        postToGas('incrementLike', reportId) // GASの incrementLike 関数を呼び出す
            .then(response => {
                button.disabled = false;
                if (response.status === 'success') {
                    likeCountSpan.textContent = response.newLikes;
                } else {
                    alert('いいね処理中にエラーが発生しました: ' + response.message);
                    console.error(response);
                }
            })
            .catch(error => {
                button.disabled = false;
                alert('いいね処理中に通信エラーが発生しました。');
                console.error(error);
            });
    }

    // --- ① 日報投稿機能のロジック ---
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        submitButton.disabled = true;
        messageElement.textContent = '送信中...';
        messageElement.style.color = '#007bff';
        
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => { data[key] = value; });

        postToGas('doPost', data) // GASの doPost 関数を呼び出す
            .then(response => {
                submitButton.disabled = false;
                if (response.status === 'success') {
                    messageElement.textContent = '✅ ' + response.message;
                    messageElement.style.color = 'green';
                    form.reset(); 

                    loadReports(); // 送信成功後、一覧をリロード
                } else {
                    messageElement.textContent = '❌ エラー: ' + response.message;
                    messageElement.style.color = 'red';
                }
            })
            .catch(error => {
                submitButton.disabled = false;
                messageElement.textContent = '致命的な通信エラーが発生しました。';
                messageElement.style.color = 'red';
                console.error('通信エラー:', error);
            });
    });

    // 初期ロード
    loadReports();
});
