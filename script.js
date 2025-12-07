document.getElementById('dataForm').addEventListener('submit', function(event) {
    // フォームの通常の送信処理（リロード）を停止
    event.preventDefault();
    
    // 【重要】ここに先ほどデプロイしたGASのウェブアプリURLを貼り付けます
    const gasWebAppUrl = 'https://script.google.com/macros/s/AKfycbyeYLZXSn1jizBh8ro32ToGebRK6T28qn7S9CpAfmW7WVDIvg_z9ZliqWJW3S-LKle0Ig/exec';

    const form = event.target;
    const formData = new FormData(form);
    const messageElement = document.getElementById('responseMessage');

    // 送信中はボタンを無効化し、メッセージを更新
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    messageElement.textContent = '送信中...';
    messageElement.style.color = '#007bff';

    // POSTリクエストとしてデータを送信
    fetch(gasWebAppUrl, {
        method: 'POST',
        body: formData // FormDataオブジェクトをそのままbodyに指定すると、multipart/form-data形式で送信される
    })
    .then(response => {
        // GASがJSONを返すので、それをパース
        return response.json();
    })
    .then(data => {
        // GASからのレスポンスを処理
        if (data.status === 'success') {
            messageElement.textContent = '✅ ' + data.message;
            messageElement.style.color = 'green';
            form.reset(); // フォームをリセット
        } else {
            messageElement.textContent = '❌ エラー: ' + data.message;
            messageElement.style.color = 'red';
        }
    })
    .catch(error => {
        // 通信エラーなどをキャッチ
        console.error('通信エラー:', error);
        messageElement.textContent = '致命的なエラーが発生しました。コンソールを確認してください。';
        messageElement.style.color = 'red';
    })
    .finally(() => {
        // 送信が終わったらボタンを再度有効化
        submitButton.disabled = false;
    });
});
