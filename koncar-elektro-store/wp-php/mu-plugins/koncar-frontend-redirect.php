<?php
/**
 * Plugin Name: Končar CMS frontend redirect
 * Description: Sends public cms.koncarelektro.rs pages to https://koncarelektro.rs. Leaves wp-admin, the REST API, uploads, and auth endpoints on the CMS.
 *
 * Must-use plugin. Upload to the CMS document root:
 *   wp-content/mu-plugins/koncar-frontend-redirect.php
 * After upload, purge the LiteSpeed cache for cms.koncarelektro.rs once.
 * Cached HTML is served without PHP, so the 301 would not run until that purge.
 *
 * Delete this file to restore the previous CMS frontend.
 */

if (!defined('ABSPATH')) {
    if (PHP_SAPI !== 'cli') {
        exit;
    }
} elseif (function_exists('add_action')) {
    add_action('plugins_loaded', 'koncar_cms_frontend_redirect', 0);
}

/**
 * @return string
 */
function koncar_cms_request_host() {
    $host = strtolower(isset($_SERVER['HTTP_HOST']) ? (string) $_SERVER['HTTP_HOST'] : '');
    $host = preg_replace('/:\d+$/', '', $host);
    return is_string($host) ? $host : '';
}

/**
 * @return bool
 */
function koncar_cms_is_cms_host() {
    return koncar_cms_request_host() === 'cms.koncarelektro.rs';
}

/**
 * @return string
 */
function koncar_cms_request_path() {
    $uri = isset($_SERVER['REQUEST_URI']) ? (string) $_SERVER['REQUEST_URI'] : '/';
    $path = parse_url($uri, PHP_URL_PATH);
    if (!is_string($path) || $path === '' || preg_match('/[\r\n]/', $path)) {
        return '/';
    }
    return $path;
}

/**
 * Paths the shop and the CMS admin must keep on this host.
 *
 * @param string $path
 * @return bool
 */
function koncar_cms_is_allowlisted($path) {
    $bases = array(
        '/wp-admin',
        '/wp-json',
        '/wp-content',
        '/wp-includes',
        '/wc-api',
        '/.well-known',
    );
    foreach ($bases as $base) {
        if ($path === $base || strpos($path, $base . '/') === 0) {
            return true;
        }
    }

    $exact = array(
        '/wp-login.php',
        '/wp-cron.php',
        '/xmlrpc.php',
        '/koncar-auth.php',
        '/contact.php',
        '/robots.txt',
    );
    return in_array($path, $exact, true);
}

/**
 * @param string $path
 * @return bool
 */
function koncar_cms_is_sitemap_path($path) {
    return (bool) preg_match('#sitemap[^/]*\.xml$#i', $path);
}

/**
 * @param string $target
 * @return string
 */
function koncar_cms_force_shop_url($target) {
    if (!is_string($target) || preg_match('/[\r\n]/', $target)) {
        return 'https://koncarelektro.rs/';
    }
    $parts = parse_url($target);
    if (!is_array($parts)) {
        return 'https://koncarelektro.rs/';
    }
    $path = isset($parts['path']) && is_string($parts['path']) && $parts['path'] !== '' ? $parts['path'] : '/';
    if (preg_match('/[\r\n]/', $path)) {
        $path = '/';
    }
    $query = isset($parts['query']) && is_string($parts['query']) ? $parts['query'] : '';
    if (preg_match('/[\r\n]/', $query)) {
        $query = '';
    }
    $url = 'https://koncarelektro.rs' . $path;
    if ($query !== '') {
        $url .= '?' . $query;
    }
    return $url;
}

/**
 * @param string $target
 */
function koncar_cms_redirect($target) {
    $target = koncar_cms_force_shop_url($target);
    if (!defined('DONOTCACHEPAGE')) {
        define('DONOTCACHEPAGE', true);
    }
    if (function_exists('nocache_headers')) {
        nocache_headers();
    }
    header('Cache-Control: no-store, no-cache, must-revalidate', true);
    header('X-LiteSpeed-Cache-Control: no-cache', true);
    header('Location: ' . $target, true, 301);
    exit;
}

function koncar_cms_serve_robots() {
    if (!defined('DONOTCACHEPAGE')) {
        define('DONOTCACHEPAGE', true);
    }
    header('Content-Type: text/plain; charset=utf-8');
    header('X-LiteSpeed-Cache-Control: no-cache', true);
    echo "User-agent: *\nAllow: /\n\nSitemap: https://koncarelektro.rs/sitemap.xml\n";
    exit;
}

/**
 * Attachment landing pages should open the parent product on the shop.
 * Returns null when this request is not an attachment.
 *
 * @return string|null
 */
function koncar_cms_attachment_target() {
    $attachment_id = isset($_GET['attachment_id']) ? (int) $_GET['attachment_id'] : 0;
    if ($attachment_id <= 0 && function_exists('is_attachment') && is_attachment()) {
        $attachment_id = (int) get_queried_object_id();
    }
    if ($attachment_id <= 0) {
        return null;
    }

    $parent_id = (int) wp_get_post_parent_id($attachment_id);
    if ($parent_id > 0) {
        $permalink = get_permalink($parent_id);
        if (is_string($permalink) && $permalink !== '') {
            return koncar_cms_force_shop_url($permalink);
        }
    }

    return 'https://koncarelektro.rs/';
}

function koncar_cms_send_redirect() {
    if (!koncar_cms_is_cms_host()) {
        return;
    }

    $path = koncar_cms_request_path();
    if (koncar_cms_is_allowlisted($path)) {
        return;
    }

    if (koncar_cms_is_sitemap_path($path)) {
        koncar_cms_redirect('https://koncarelektro.rs/sitemap.xml');
    }

    $attachment = koncar_cms_attachment_target();
    if ($attachment !== null) {
        koncar_cms_redirect($attachment);
    }

    $query = isset($_SERVER['QUERY_STRING']) ? (string) $_SERVER['QUERY_STRING'] : '';
    if (preg_match('/[\r\n]/', $query)) {
        $query = '';
    }
    $target = 'https://koncarelektro.rs' . $path;
    if ($query !== '') {
        $target .= '?' . $query;
    }
    koncar_cms_redirect($target);
}

function koncar_cms_frontend_redirect() {
    if (!koncar_cms_is_cms_host()) {
        return;
    }
    if (php_sapi_name() === 'cli' || (defined('WP_CLI') && WP_CLI)) {
        return;
    }
    if ((function_exists('wp_doing_ajax') && wp_doing_ajax()) || (function_exists('wp_doing_cron') && wp_doing_cron())) {
        return;
    }
    if (isset($_GET['rest_route'])) {
        return;
    }

    $path = koncar_cms_request_path();

    if ($path === '/robots.txt') {
        add_action('do_robotstxt', 'koncar_cms_serve_robots', 0);
        return;
    }

    if (koncar_cms_is_allowlisted($path)) {
        return;
    }

    // Yoast can answer sitemap rewrites before the template loads.
    add_action('init', 'koncar_cms_redirect_sitemap_early', 0);
    add_action('template_redirect', 'koncar_cms_send_redirect', 0);
}

function koncar_cms_redirect_sitemap_early() {
    if (!koncar_cms_is_cms_host()) {
        return;
    }
    $path = koncar_cms_request_path();
    if (koncar_cms_is_sitemap_path($path)) {
        koncar_cms_redirect('https://koncarelektro.rs/sitemap.xml');
    }
}
