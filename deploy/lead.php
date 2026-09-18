<?php

/**
 * One file that receives a lead, writes it down, and pings Telegram.
 *
 * It exists so the landing page can stay a folder of static files inside the
 * tracker while the bot token stays somewhere a visitor cannot read it. Drop
 * it next to the landing on any host that runs PHP; nothing else is needed,
 * no dependencies, no build.
 *
 * The order of operations is the point: the lead is written to the log before
 * anything is allowed to reject it. A bot, a flood, a broken Telegram — none
 * of them can lose a line. Telegram is the alert; the log is the record.
 */

declare(strict_types=1);

$config = __DIR__ . '/lead.config.php';
if (!is_file($config)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Receiver is not configured.']);
    error_log('lead: lead.config.php is missing — copy lead.config.example.php');
    exit;
}
$cfg = require $config;

// ---------------------------------------------------------------- CORS ----
// The landing usually sits on the same host, where none of this is needed.
// It is here for the case where the tracker serves the page from somewhere
// else, because a JSON POST is never a "simple" request: the browser asks
// first with OPTIONS, and a receiver that ignores that is a receiver that
// silently never gets called.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = $cfg['origins'] ?? ['*'];
$allow = in_array('*', $allowed, true) ? '*' : (in_array($origin, $allowed, true) ? $origin : '');
if ($allow !== '') {
    header('Access-Control-Allow-Origin: ' . $allow);
    header('Vary: Origin');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Max-Age: 86400');
}
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

function reply(int $code, array $body): never
{
    http_response_code($code);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    reply(405, ['error' => 'Method not allowed.']);
}

$raw = file_get_contents('php://input') ?: '';
$body = json_decode($raw, true);
if (!is_array($body)) {
    // a form posted the old-fashioned way still works
    $body = $_POST;
}

$clean = static fn (mixed $v, int $max): string =>
    is_string($v) ? mb_substr(trim($v), 0, $max) : '';

$name = $clean($body['name'] ?? '', 120);
$email = $clean($body['email'] ?? '', 160);
$lang = $clean($body['lang'] ?? '', 8) ?: 'en';
// Какой вариант выбрали на странице. Заявка без этого — половина заявки.
$tier = $clean($body['tierName'] ?? '', 80) ?: $clean($body['tier'] ?? '', 40);
$page = $clean($body['page'] ?? '', 500);
$trap = $clean($body['company'] ?? '', 200);

$ip = $_SERVER['HTTP_CF_CONNECTING_IP']
    ?? trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '')[0])
    ?: ($_SERVER['REMOTE_ADDR'] ?? 'unknown');

// ------------------------------------------------------------ verdicts ----
$flags = [];
// A field no person can see and no bot can resist. It is recorded rather than
// acted on silently, so a false positive is something you can find and fix
// instead of a buyer who quietly never arrived.
if ($trap !== '') {
    $flags[] = 'bot';
}
if (mb_strlen($name) < 2) {
    $flags[] = 'no-name';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $flags[] = 'bad-email';
}

// per-IP flood control, kept in one small file beside the log
$limit = (int) ($cfg['limit'] ?? 6);
$stateFile = ($cfg['log'] ?? __DIR__ . '/leads.log') . '.rate';
$now = time();
$state = is_file($stateFile) ? json_decode((string) file_get_contents($stateFile), true) : [];
if (!is_array($state)) {
    $state = [];
}
foreach ($state as $key => $times) {
    $state[$key] = array_values(array_filter((array) $times, static fn ($t) => $now - (int) $t < 60));
    if (!$state[$key]) {
        unset($state[$key]);
    }
}
$state[$ip][] = $now;
if (count($state[$ip]) > $limit) {
    $flags[] = 'rate-limited';
}
@file_put_contents($stateFile, json_encode($state), LOCK_EX);

// ----------------------------------------------------------------- log ----
// Written first, always, whatever the verdict.
$record = [
    'at' => gmdate('c'),
    'name' => $name,
    'email' => $email,
    'lang' => $lang,
    'tier' => $tier,
    'page' => $page,
    'ip' => $ip,
    'ua' => mb_substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 200),
    'flags' => $flags,
];
@file_put_contents(
    $cfg['log'] ?? __DIR__ . '/leads.log',
    json_encode($record, JSON_UNESCAPED_UNICODE) . "\n",
    FILE_APPEND | LOCK_EX
);

// A bot is told everything went fine. Telling it otherwise only teaches it to
// try again with the field left empty.
if (in_array('bot', $flags, true)) {
    reply(200, ['ok' => true]);
}
if (in_array('rate-limited', $flags, true)) {
    reply(429, ['error' => 'Too many requests.']);
}
if (in_array('no-name', $flags, true)) {
    reply(400, ['error' => 'Name is required.']);
}
if (in_array('bad-email', $flags, true)) {
    reply(400, ['error' => 'A valid email is required.']);
}

// ------------------------------------------------------------ telegram ----
$token = (string) ($cfg['token'] ?? '');
$chat = (string) ($cfg['chat'] ?? '');
if ($token === '' || $chat === '') {
    // logging without alerting is a legitimate way to run this
    reply(200, ['ok' => true]);
}

$esc = static fn (string $s): string => htmlspecialchars($s, ENT_NOQUOTES, 'UTF-8');
$text = implode("\n", [
    '<b>New request — Prompta aut perire</b>',
    '',
    '<b>Name:</b> ' . $esc($name),
    '<b>Email:</b> ' . $esc($email),
    '<b>Page language:</b> ' . $esc($lang),
    ...($tier !== '' ? ['<b>Option:</b> ' . $esc($tier)] : []),
    ...($page !== '' ? ['<b>From:</b> ' . $esc($page)] : []),
    '<b>Received:</b> ' . gmdate('Y-m-d H:i') . ' UTC',
]);

$payload = json_encode([
    'chat_id' => $chat,
    'text' => $text,
    'parse_mode' => 'HTML',
    'disable_web_page_preview' => true,
], JSON_UNESCAPED_UNICODE);

$ch = curl_init("https://api.telegram.org/bot{$token}/sendMessage");
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
]);
$response = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($status !== 200) {
    // The lead is already in the log, so nothing is lost — but say so loudly.
    error_log("lead: telegram failed ({$status}) {$curlError} " . substr((string) $response, 0, 200));
    reply(502, ['error' => 'Could not deliver the request.']);
}

reply(200, ['ok' => true]);
