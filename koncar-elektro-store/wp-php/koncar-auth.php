<?php
/**
 * Končar Elektro — prijava / reset lozinke (WordPress korisnici / WC kupci).
 *
 * Upload u WordPress ROOT (isti folder kao wp-load.php), prvo na staging:
 *   testing.cleannikki.com/koncar-auth.php
 *
 * Next.js BFF zove ovaj fajl da proveri lozinku (WC REST to ne ume).
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

$action = isset($data['action']) ? sanitize_key($data['action']) : 'login';

if ($action === 'forgot') {
  $login = sanitize_text_field(isset($data['email']) ? $data['email'] : '');
  if ($login === '') {
    http_response_code(400);
    echo wp_json_encode(array('ok' => false, 'message' => 'Unesite e-mail.'));
    exit;
  }

  $result = retrieve_password($login);
  if (is_wp_error($result)) {
    http_response_code(400);
    echo wp_json_encode(array(
      'ok' => false,
      'message' => 'Nismo pronašli nalog sa tom e-mail adresom.',
    ));
    exit;
  }

  echo wp_json_encode(array(
    'ok' => true,
    'message' => 'Ako nalog postoji, poslali smo link za reset lozinke.',
  ));
  exit;
}

$email    = sanitize_text_field(isset($data['email']) ? $data['email'] : '');
$password = isset($data['password']) ? (string) $data['password'] : '';

if ($email === '' || $password === '') {
  http_response_code(400);
  echo wp_json_encode(array('ok' => false, 'message' => 'Unesite e-mail i lozinku.'));
  exit;
}

$login = $email;
if (is_email($email)) {
  $by_email = get_user_by('email', $email);
  if ($by_email) {
    $login = $by_email->user_login;
  }
}

$user = wp_authenticate($login, $password);
if (is_wp_error($user)) {
  http_response_code(401);
  echo wp_json_encode(array('ok' => false, 'message' => 'Pogrešan e-mail ili lozinka.'));
  exit;
}

$first = get_user_meta($user->ID, 'first_name', true);
$last  = get_user_meta($user->ID, 'last_name', true);
$phone = get_user_meta($user->ID, 'billing_phone', true);

if (class_exists('WC_Customer')) {
  try {
    $customer = new WC_Customer($user->ID);
    if (!$first) {
      $first = $customer->get_first_name();
    }
    if (!$last) {
      $last = $customer->get_last_name();
    }
    if (!$phone) {
      $phone = $customer->get_billing_phone();
    }
  } catch (Exception $e) {
    // ignore — WP user fields are enough
  }
}

echo wp_json_encode(array(
  'ok' => true,
  'customer' => array(
    'id'        => (int) $user->ID,
    'email'     => $user->user_email,
    'firstName' => $first ? $first : '',
    'lastName'  => $last ? $last : '',
    'phone'     => $phone ? $phone : '',
  ),
));
