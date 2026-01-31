# Niwatori-Games

## トップページ（Yahoo!ニュース風 UI）

- **変更・追加ファイル**: `index.html`, `styles.css`, `app.js`, `data/feed.json`
- **ローカル確認**: ルートで `index.html` をブラウザで直接開くか、簡易サーバで配信する。
  - 直接開く: `open index.html`（file:// のため `data/feed.json` は CORS で読めない環境がある）
  - 推奨: `npx serve .` または `python3 -m http.server 8000` でルートをサーブし、`http://localhost:3000` や `http://localhost:8000` で表示