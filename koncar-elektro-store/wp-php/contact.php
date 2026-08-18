<?php
/**
 * Končar Elektro — kontakt forma.
 *
 * Upload u WordPress ROOT (isti folder kao wp-load.php), prvo na staging:
 *   testing.cleannikki.com/contact.php
 *
 * Šalje na: kontakt@koncarelektro.com (wp_mail).
 */
define('DONOTCACHEPAGE', true);
require_once __DIR__ . '/wp-load.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo wp_json_encode(array('ok' => false, 'message' => 'Samo POST.'));
  exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
  $data = $_POST;
}

// Honeypot — botovi popune skriveno polje, mi vratimo lažni success.
if (!empty($data['website']) || !empty($data['company_url'])) {
  echo wp_json_encode(array('ok' => true));
  exit;
}

$name    = sanitize_text_field(isset($data['name']) ? $data['name'] : '');
$email   = sanitize_email(isset($data['email']) ? $data['email'] : '');
$phone   = sanitize_text_field(isset($data['phone']) ? $data['phone'] : '');
$message = sanitize_textarea_field(isset($data['message']) ? $data['message'] : '');

if ($name === '' || $email === '' || $message === '' || !is_email($email)) {
  http_response_code(400);
  echo wp_json_encode(array('ok' => false, 'message' => 'Popunite ime, email i poruku.'));
  exit;
}

if (strlen($message) > 5000) {
  http_response_code(400);
  echo wp_json_encode(array('ok' => false, 'message' => 'Poruka je predugačka.'));
  exit;
}

$to      = 'kontakt@koncarelektro.com';
$subject = 'Kontakt forma — ' . $name;
$body    = "Ime: {$name}\nEmail: {$email}\nTelefon: {$phone}\n\nPoruka:\n{$message}\n";
$headers = array(
  'Content-Type: text/plain; charset=UTF-8',
  'Reply-To: ' . $name . ' <' . $email . '>',
);

$sent = wp_mail($to, $subject, $body, $headers);
if (!$sent) {
  http_response_code(502);
  echo wp_json_encode(array('ok' => false, 'message' => 'Slanje emaila nije uspelo. Pokušajte telefonom.'));
  exit;
}

echo wp_json_encode(array('ok' => true));
