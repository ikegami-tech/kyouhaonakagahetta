document.addEventListener('DOMContentLoaded', () => {
    // 【重要】ここに、GASをデプロイしたウェブアプリのURLを貼り付けます
    const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbyU0i0Apz5-0z-xTQYBJY3J6Hc1EWNgp5Ad9B7ODqJpOoNUxQb-q7BddR3LJJ_0quwY/exec';

    const form = document.getElementById('reportForm');
    const messageElement = document.getElementById('message');
    const listElement = document.getElementById('reportList');
    const loadingElement = document.getElementById('loading');
    const submitButton = document.getElementById('submitButton');

    // --- GAS APIへの通信ヘルパー関数 ---
    async function callGasApi(url, method, body = null) {
        const options = {
            method: method,
            mode: 'cors', // CORSを許可
        };
        if (body) {
            options.body = body; // POSTの場合はFormDataをそのまま渡す
        }

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.error('API通信エラー:', error);
            throw new Error('サーバーとの通信中にエラーが発生しました。');
        }
    }

    // --- ② 日報一覧表示機能のロジック ---
    async function loadReports() {
        loadingElement.style.display = 'block';
        listElement.innerHTML = '';
        
        try {
            // GETリクエストで一覧取得 (action=getReports)
            const apiUrl = `${GAS_API_URL}?action=getReports`;
            const data = await callGasApi(apiUrl, 'GET');

            loadingElement.style.display = 'none';

            if (data.status === 'error') {
                listElement.innerHTML = `<p style="color: red;">${data.message}</p>`;
                return;
            }

            const reports = data.reports || [];

            if (reports.length === 0) {
                listElement.innerHTML = '<p>まだ日報がありません。</p>';
                return;
            }

            reports.forEach(report => {
                const li = document.createElement('li');
                li.className = 'report-item';
                
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
        } catch (error) {
            loadingElement.style.display = 'none';
            listElement.innerHTML = `<p style="color: red;">日報の読み込み中にエラーが発生しました: ${error.message}</p>`;
        }
    }

    // --- ③ 「いいね」リアクション機能のロジック ---
    async function handleLike(event) {
        const button = event.currentTarget;
        const reportId = button.dataset.id;
        const likeCountSpan = document.querySelector(`.like-count[data-id="${reportId}"]`);
        
        button.disabled = true; // 連打防止
        
        try {
            // GETリクエストでいいね処理 (action=incrementLike)
            const apiUrl = `${GAS_API_URL}?action=incrementLike&id=${reportId}`;
            const response = await callGasApi(apiUrl, 'GET');

            button.disabled = false;
            
            if (response.status === 'success') {
                likeCountSpan.textContent = response.newLikes;
            } else {
                alert('いいね処理中にエラーが発生しました: ' + response.message);
                console.error(response);
            }
        } catch (error) {
            button.disabled = false;
            alert('いいね処理中に通信エラーが発生しました。');
            console.error(error);
        }
    }

    // --- ① 日報投稿機能のロジック ---
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        submitButton.disabled = true;
        messageElement.textContent = '送信中...';
        messageElement.style.color = '#007bff';
        
        const formData = new FormData(form);

        try {
            // POSTリクエストでデータ送信
            const response = await callGasApi(GAS_API_URL, 'POST', formData);

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
        } catch (error) {
            submitButton.disabled = false;
            messageElement.textContent = '致命的な通信エラーが発生しました。';
            messageElement.style.color = 'red';
        }
    });

    // 初期ロード
    loadReports();
});
