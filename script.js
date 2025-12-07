// HTMLからGASのWeb App URLを取得
const GAS_WEB_APP_URL = document.getElementById('gas-url').value;

const dataForm = document.getElementById('dataForm');
const dataList = document.getElementById('dataList');
const messageElement = document.getElementById('message');

// --- データの保存 (フォーム送信時) ---
dataForm.addEventListener('submit', function(e) {
    e.preventDefault(); 
    
    // 💡 修正箇所: URLが空かどうかだけをチェックします。
    if (!GAS_WEB_APP_URL) {
        alert("GASのURLが設定されていません。index.htmlの隠しフィールドにURLを貼り付けてください。");
        return;
    }

    const nameInput = document.getElementById('name');
    const name = nameInput.value.trim();
    if (!name) {
        alert("名前を入力してください。");
        return;
    }

    // メッセージを更新
    messageElement.textContent = "送信中...";
    messageElement.style.color = 'blue';

    // GASへデータをPOST送信
    fetch(GAS_WEB_APP_URL, {
    method: 'POST', 
    
    // 1. body属性: 送信するデータをJSON文字列に変換
    body: JSON.stringify({ name: name }),
    
    headers: {
        // 2. headers属性: Content-TypeをJSONに指定
        'Content-Type': 'application/json',
    },
})
.then(response => {
    // 3. レスポンスがHTTPエラーでないかチェック（.json()の前に置くことで安全性が増す）
    if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    return response.json();
})
    .then(data => {
        if (data.status === 'success') {
            messageElement.textContent = "✅ データが正常に保存されました！";
            messageElement.style.color = 'green';
            nameInput.value = ''; // フォームをクリア
            fetchDataAndDisplay(); // データ一覧を再読み込み
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

// --- データの取得と表示 ---
function fetchDataAndDisplay() {
    dataList.innerHTML = '<p>データ取得中...</p>'; // ローディング表示

    // GASへデータをGET送信 (データ取得)
    fetch(GAS_WEB_APP_URL)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        dataList.innerHTML = ''; // 一覧をクリア

        if (data.status === 'success' && data.data) {
            const records = data.data;

            if (records.length === 0) {
                 dataList.innerHTML = '<p>まだデータがありません。</p>';
                 return;
            }
            
            // 最新のデータが上に来るように逆順にソート（任意）
            records.reverse();

            // データをリストとして表示
            records.forEach(record => {
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
        } else {
            dataList.innerHTML = `<p>データ取得エラー: ${data.message}</p>`;
        }
    })
    .catch(error => {
        dataList.innerHTML = `<p style="color:red;">データの読み込みに失敗しました: ${error.message}</p>`;
        console.error('Fetch Error:', error);
    });
}

// ページ読み込み完了時にデータ一覧を読み込む
window.onload = fetchDataAndDisplay;
