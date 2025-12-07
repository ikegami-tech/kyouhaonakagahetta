// HTMLからGASのWeb App URLを取得
const GAS_WEB_APP_URL = document.getElementById('gas-url').value;

const dataForm = document.getElementById('dataForm');
const dataList = document.getElementById('dataList');
const messageElement = document.getElementById('message');

// --- データの保存 (フォーム送信時) ---
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

    // 💡 修正点: データをURLクエリ文字列に変換
    const params = new URLSearchParams({ name: name });

    // GASへデータをPOST送信 (Content-Type: application/x-www-form-urlencoded 相当の形式で送信)
    // プリフライトリクエストを回避できます
    fetch(GAS_WEB_APP_URL + '?' + params.toString(), {
        method: 'POST',
        // Content-Typeヘッダーを付けていないため、ブラウザはシンプルなリクエストと認識します
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

// --- データ取得 (doGet) のロジックは前回通り ---
function fetchDataAndDisplay() {
    // ... (doGetのロジックは前回の回答を参照)
    // ...
}

window.onload = fetchDataAndDisplay;
