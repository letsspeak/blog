# レガシー AWS 設定ファイル

このディレクトリには、初期のAWS環境構築時に使用された設定ファイルが保存されています。

## ファイル説明

- `bucket-policy.json` - S3バケットのバケットポリシー
- `cloudfront-config.json` - CloudFrontディストリビューションの設定
- `blog-dns-record.json` - Route 53 DNSレコードの設定
- `dns-validation.json` - SSL証明書のDNS検証設定

## 使用状況

これらのファイルは現在使用されていません。AWS環境は既に構築済みで、GitHub Actionsによる自動デプロイが設定されています。

将来的に環境を再構築する必要がある場合の参考として保持しています。