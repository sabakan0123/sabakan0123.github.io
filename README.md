# Sabakan Portfolio

SabakanのPortfolioサイト。モネの睡蓮と、白い手先・黒い腕の猫の手を主題に、HTML・CSS・JavaScriptで構成しています。

公開URL: https://sabakan0123.github.io/

## ファイル

- `index.html`：プロフィール・活動・制作物・記事
- `styles.css`：レイアウトとレスポンシブ表示
- `oil-edition.css`：油彩版のレイアウト
- `garden.js`：タップ位置から広がる水面の屈折・光・影と、文字のスクロール表示
- `entrance.js` / `entrance.css`：猫の手が右から左へ引っ掻き、紙が帯状に剥がれる約5.4秒の入口演出
- `assets/monet-agapanthus.webp`：冒頭の《Water Lilies (Agapanthus)》
- `assets/monet-water-lilies-1906.webp`：本文の別作品《Water Lilies, 1906》
- `assets/tuxedo-paw.webp`：油彩の猫の手（AI生成、透過WebP）
- `ASSETS-WATER-LILIES.md`：作品の出典と猫の手の生成指示
- `assets/cat.svg`：ファビコン

入口はスキップ・Escapeキーに対応し、OSの「動きを減らす」設定やセクションへの直接リンクでは省略します。画像が読めない場合も本文を表示し、最大9.5秒で入口を解除します。JavaScriptが無効でも本文を読めます。

WebGLが利用できない場合は静止画を表示します。2つの絵画では、タップ・クリック・Enter・Spaceで最大4つの波紋が重なり、操作後の4秒だけ描画します。OSのモーション抑制に対応し、昼夜・再生モードの切り替えはありません。

## 更新方法

編集内容をmasterブランチにpushすると、GitHub Pagesが更新されます。
公開用ファイルのみをコミットし、ローカルの資料や開発用フォルダーは含めません。
