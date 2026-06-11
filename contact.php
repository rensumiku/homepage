<?php
declare(strict_types=1);

mb_language('Japanese');
mb_internal_encoding('UTF-8');

function h(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function render_page(string $title, string $message, bool $success): void
{
    http_response_code($success ? 200 : 400);
    $safeTitle = h($title);
    $safeMessage = h($message);
    echo <<<HTML
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{$safeTitle} | 株式会社SumiX</title>
    <link rel="icon" href="favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="assets/css/styles.css">
  </head>
  <body>
    <main class="result-page">
      <div class="result-box">
        <p class="eyebrow">Contact</p>
        <h1>{$safeTitle}</h1>
        <p>{$safeMessage}</p>
        <a class="button primary" href="index.html#contact">トップへ戻る</a>
      </div>
    </main>
  </body>
</html>
HTML;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.html#contact', true, 303);
    exit;
}

$honeypot = trim((string)($_POST['website'] ?? ''));
if ($honeypot !== '') {
    render_page('送信できませんでした', '入力内容を確認して、もう一度お試しください。', false);
    exit;
}

$name = trim((string)($_POST['name'] ?? ''));
$company = trim((string)($_POST['company'] ?? ''));
$email = trim((string)($_POST['email'] ?? ''));
$category = trim((string)($_POST['category'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));
$privacy = (string)($_POST['privacy'] ?? '');

$errors = [];
if ($name === '') {
    $errors[] = 'お名前';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'メールアドレス';
}
if ($category === '') {
    $errors[] = '相談したい領域';
}
if (mb_strlen($message) < 10) {
    $errors[] = 'お問い合わせ内容';
}
if ($privacy !== 'agreed') {
    $errors[] = 'プライバシーポリシーへの同意';
}

if ($errors !== []) {
    render_page('入力内容をご確認ください', implode('、', $errors) . 'を正しく入力してください。', false);
    exit;
}

$to = 'info@sumix.jp';
$subject = '【SumiX Web】お問い合わせ: ' . $category;
$body = <<<BODY
SumiXホームページからお問い合わせがありました。

お名前:
{$name}

会社名・団体名:
{$company}

メールアドレス:
{$email}

相談したい領域:
{$category}

お問い合わせ内容:
{$message}

送信元IP:
{$_SERVER['REMOTE_ADDR']}
BODY;

$encodedSubject = mb_encode_mimeheader($subject, 'UTF-8');
$headers = [
    'From: SumiX Website <info@sumix.jp>',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: PHP/' . phpversion(),
];

$sent = mb_send_mail($to, $encodedSubject, $body, implode("\r\n", $headers));

if ($sent) {
    render_page('送信しました', 'お問い合わせありがとうございます。内容を確認し、担当者よりご連絡いたします。', true);
    exit;
}

render_page('送信できませんでした', '時間をおいて再度お試しいただくか、info@sumix.jp まで直接ご連絡ください。', false);
