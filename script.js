// HTMLからGASのWeb App URLを取得
const GAS_WEB_APP_URL = document.getElementById('gas-url').value;

const dataForm = document.getElementById('dataForm');
const dataList = document.getElementById('dataList');
const messageElement = document.getElementById('message');

// --- データの保存 (フォーム送信時) ---
dataForm.addEventListener('submit', function(e) {
    e.preventDefault(); 
    
    // URLが設定されているか確認
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

    // メッセージを更新
    messageElement.textContent = "送信中...";
    messageElement.style.color = 'blue';

    // GASへデータをPOST送信
    fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        // JSON形式でデータを送信
        body: JSON.stringify({ name: name }),
        headers: {
            // Content-Typeをapplication/jsonにすることで、GAS側でJSON.parse()が使える
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        // HTTPステータスコードが200番台でなければエラーを投げる
        if (!response.ok) {
             throw new Error(`サーバーエラー: ${response.statusText}`);
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
