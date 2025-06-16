# AWS設定手順

## 1. 構築用ユーザーの作成

### IAMユーザー作成
```bash
# 構築用ユーザーを作成
aws iam create-user --user-name blog-setup-user

# ポリシーを作成
aws iam create-policy \
  --policy-name blog-setup-policy \
  --policy-document file://docs/aws/setup-user-policy.json

# ポリシーをユーザーにアタッチ
aws iam attach-user-policy \
  --user-name blog-setup-user \
  --policy-arn arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/blog-setup-policy

# アクセスキーを作成
aws iam create-access-key --user-name blog-setup-user
```

### 環境変数ファイル設定
```bash
# 構築用ユーザーの認証情報ファイル作成
cp .env.aws.setup.template .env.aws.setup
# .env.aws.setup を編集して実際のアクセスキーを設定

# デプロイ用ユーザーの認証情報ファイル作成
cp .env.aws.deploy.template .env.aws.deploy
# .env.aws.deploy を編集して実際のアクセスキーを設定
```

## 2. インフラ構築（構築用ユーザーで実行）

```bash
# 構築用ユーザーの認証情報を読み込み
source .env.aws.setup

# S3バケット作成
aws s3 mb s3://blog-lsklab-com --region ap-northeast-1

# 静的ウェブサイトホスティング設定
aws s3 website s3://blog-lsklab-com \
  --index-document index.html \
  --error-document index.html

# パブリックアクセス設定
aws s3api put-public-access-block \
  --bucket blog-lsklab-com \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# バケットポリシー設定
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::blog-lsklab-com/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket blog-lsklab-com \
  --policy file://bucket-policy.json

# ACM証明書申請（us-east-1リージョンでCloudFront用）
aws acm request-certificate \
  --domain-name blog.lsklab.com \
  --validation-method DNS \
  --region us-east-1

# 証明書ARNを確認
aws acm list-certificates --region us-east-1

# Route53でDNS検証レコードを追加（手動またはスクリプト）
# aws route53 change-resource-record-sets --hosted-zone-id YOUR_ZONE_ID --change-batch file://validation-record.json

# CloudFrontディストリビューション作成（証明書検証完了後）
# 詳細は下記の手順を参照
```

## 3. デプロイ用ユーザーの作成

```bash
# デプロイ用ユーザーを作成
aws iam create-user --user-name blog-deploy-user

# ポリシーを作成
aws iam create-policy \
  --policy-name blog-deploy-policy \
  --policy-document file://docs/aws/deploy-user-policy.json

# ポリシーをユーザーにアタッチ
aws iam attach-user-policy \
  --user-name blog-deploy-user \
  --policy-arn arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/blog-deploy-policy

# アクセスキーを作成（GitHub Secretsに設定）
aws iam create-access-key --user-name blog-deploy-user
```

## 4. GitHub Secrets設定

以下をGitHubリポジトリのSecrets（Settings > Secrets and variables > Actions）に追加：

- `AWS_ACCESS_KEY_ID`: デプロイ用ユーザーのアクセスキーID
- `AWS_SECRET_ACCESS_KEY`: デプロイ用ユーザーのシークレットアクセスキー
- `CLOUDFRONT_DISTRIBUTION_ID`: CloudFrontディストリビューションID

## 注意事項

- 構築用ユーザーは一時的な使用のため、構築完了後は削除することを推奨
- Route 53のホストゾーンは既存のものを使用
- ACM証明書はus-east-1リージョンで作成（CloudFront用）
- S3バケット名は全世界で一意である必要があるため、必要に応じて変更