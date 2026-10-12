# Sabakan Portfolio

SabakanのPortfolioサイト。印象派の油彩を参考にした水庭とハチワレ猫を主題に、HTML・CSS・JavaScriptで構成しています。

公開URL: https://sabakan0123.github.io/

## ファイル

- `index.html`：プロフィール・活動・制作物・記事
- `styles.css`：レイアウトとレスポンシブ表示
- `oil-edition.css`：油彩版のレイアウト
- `garden.js`：ポインターやタッチに反応するWebGLの奥行き・水面表現
- `entrance.js` / `entrance.css`：白いキャンバスを短毛のハチワレ猫が歩き、ジャンプして破く約5秒の入口演出
- `assets/watergarden-shorthair.webp`：短毛の猫と水庭の油彩（AI生成）
- `assets/tuxedo-motion.webp`：入口用の6コマの油彩アニメーション素材（AI生成、透過WebP）
- `assets/cat.svg`：ファビコン

入口はスキップ・Escapeキーに対応し、OSの「動きを減らす」設定やセクションへの直接リンクでは省略します。画像が読めない場合も本文を表示し、最大8.5秒で入口を解除します。JavaScriptが無効でも本文を読めます。

WebGLが利用できない場合は静止画を表示します。水面は操作後の4秒だけ反応し、昼夜・再生モードの切り替えはありません。猫は6コマの油彩素材によるアニメーションです。

## 更新方法

編集内容をmasterブランチにpushすると、GitHub Pagesが更新されます。
公開用ファイルのみをコミットし、ローカルの資料や開発用フォルダーは含めません。
