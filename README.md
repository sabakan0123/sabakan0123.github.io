# Sabakan Portfolio

SabakanのPortfolioサイト。モネの睡蓮と、白い手先・黒い腕の猫の手を主題に、HTML・CSS・JavaScriptで構成しています。

公開URL: https://sabakan0123.github.io/

## ファイル

- `index.html`：プロフィール・活動・制作物・記事
- `styles.css`：レイアウトとレスポンシブ表示
- `oil-edition.css`：油彩版のレイアウト
- `garden.js`：タップ位置から広がる水面の屈折・光・影と、文字組みを保った筆のような表示
- `entrance.js` / `entrance.css`：猫の手が登場中は傷を付けず、その後左から右へ引っ掻き、紙が帯状に剥がれる約5.9秒の入口演出
- `assets/watergarden-shorthair.webp`：冒頭の睡蓮と短毛のハチワレ猫（オリジナルAI油彩）
- `footsteps.js`：スクロールで余白に残る猫の足跡（約13.5秒で消える）
- `assets/pond-pigment.webp`：各セクションを彩る厚塗り絵の具（AI生成）
- `assets/tuxedo-paw-impasto.webp`：厚塗り油彩の猫の手（AI生成、透過WebP）
- `assets/linen-canvas.webp`：織り目と浅い折り目が見える白いキャンバス（AI生成）
- `ASSETS-WATER-LILIES.md`：作品の出典と猫の手の生成指示
- `assets/cat.svg`：ファビコン

入口はスキップ・Escapeキーに対応し、OSの「動きを減らす」設定やセクションへの直接リンクでは省略します。画像が読めない場合も本文を表示し、最大9.5秒で入口を解除します。JavaScriptが無効でも本文を読めます。

WebGLが利用できない場合は静止画を表示します。冒頭の絵は屈折する波紋を表示し、全画面にはキャンバスの粒子を映した薄い水膜を重ねています。タップ・クリックで最大4つの波紋が重なり、操作後の4秒だけ描画します。OSのモーション抑制に対応し、昼夜・再生モードの切り替えはありません。

## 更新方法

編集内容をmasterブランチにpushすると、GitHub Pagesが更新されます。
公開用ファイルのみをコミットし、ローカルの資料や開発用フォルダーは含めません。

ヘッダー・猫と睡蓮の冒頭・本文・フッターまでキャンバス地で統一しています。途中のモネ作品、SCROLL案内、絵画のキャプションは表示しません。Sabakanの見出しは分割やマスクを使わない通常の文字組みです。生成プロンプトは `ASSET-PROMPTS-IMPASTO.md` を参照。
