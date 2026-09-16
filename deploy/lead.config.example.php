<?php
// Copy to lead.config.php and fill in. lead.config.php is gitignored.
//
// A .php file is executed, never served as source, so the token is safe here
// as long as PHP is actually running. If the host ever stops interpreting PHP
// the file would be served as text, so keep it out of any public backup or
// directory listing.
return [
    // From @BotFather. Leave empty to log leads without alerting.
    'token' => '',
    // Your own chat id. Find it at api.telegram.org/bot<TOKEN>/getUpdates
    // after writing to the bot.
    'chat' => '',

    // Every lead is appended here, one JSON object per line, before anything
    // is allowed to reject it — including the ones flagged as bots. This file
    // is the record; Telegram is only the alert.
    'log' => __DIR__ . '/leads.log',

    // Which sites may post here. '*' allows any, which is fine for a lead form
    // but means someone else's page could fill your log. Pin it to your own
    // domain once you know it: ['https://example.com'].
    'origins' => ['*'],

    // Per IP, per minute. Far more than a person needs.
    'limit' => 6,
];
