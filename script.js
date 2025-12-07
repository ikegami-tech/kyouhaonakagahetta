// HTMLからGASのWeb App URLを取得
const GAS_WEB_APP_URL = document.getElementById('gas-url').value;

const dataForm = document.getElementById('dataForm');
const dataList = document.getElementById('dataList');
const messageElement = document.getElementById('message');

// --- データの保存 (POSTリクエスト) ---
dataForm.addEventListener('submit', function(e) {
    e.preventDefault(); 
    
    if (!GAS_WEB_APP_URL || GAS_WEB_APP_URL.includes('【')) {
        alert("GASのURLが設定されていません。index.htmlの隠しフィールドを修正してください。");
        return;
    }

    const nameInput = document.getElementById('name');
    const name = nameInput.value.trim();

    if (!name) {
        alert("名前を入力してください。");
        return;
    }

    messageElement.textContent = "送信中...";
    messageElement.style.color = 'blue';

    // 💡 データをURLクエリ文字列に変換 (プリフライト回避)
    const params = new URLSearchParams({ name: name });

    // GASへデータをPOST送信。URLクエリとしてデータを付与する。
    fetch(GAS_WEB_APP_URL + '?' + params.toString(), {
        method: 'POST',
        // Content-Typeヘッダーを意図的に省略し、シンプルなリクエストとする
    })
    .then(response => {
        if (!response.ok) {
             throw new Error(`サーバーエラー: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.status === 'success') {
            messageElement.textContent = "✅ データが正常に保存されました！";
            messageElement.style.color = 'green';
            nameInput.value = ''; 
            fetchDataAndDisplay(); 
        } else {
            messageElement.textContent = `❌ 保存エラー: ${data.message}`;
            messageElement.style.color = 'red';
        }
    })
    .catch(error => {
        messageElement.textContent = `❌ 通信エラー: ${error.message}`;
        messageElement.style.color = 'red';
        console.error('Error:', error);
    });
});

// --- データ一覧を取得して表示する処理 (GETリクエスト) ---
function fetchDataAndDisplay() {
    dataList.innerHTML = '<p>データ取得中...</p>'; 

    fetch(GAS_WEB_APP_URL)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        dataList.innerHTML = ''; 

        if (data.status === 'success' && data.data && data.data.length > 0) {
            data.data.reverse(); 

            data.data.forEach(record => {
                const div = document.createElement('div');
                div.className = 'record';
                
                const nameSpan = document.createElement('span');
                nameSpan.textContent = `名前: ${record.name}`;
                
                const timeSpan = document.createElement('span');
                timeSpan.className = 'timestamp';
                timeSpan.textContent = `保存日時: ${record.timestamp}`;
                
                div.appendChild(nameSpan);
                div.appendChild(timeSpan);
                dataList.appendChild(div);
            });
        } else if (data.status === 'success' && data.data.length === 0) {
            dataList.innerHTML = '<p>まだデータがありません。</p>';
        } else {
            dataList.innerHTML = `<p>データ取得エラー: ${data.message}</p>`;
        }
    })
    .catch(error => {
        dataList.innerHTML = `<p style="color:red;">データの読み込みに失敗しました: ${error.message}</p>`;
        console.error('Fetch Error:', error);
    });
}

window.onload = fetchDataAndDisplay;
