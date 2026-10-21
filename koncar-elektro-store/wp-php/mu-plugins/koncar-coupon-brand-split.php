<?php
/**
 * Plugin Name: Končar kupon koncar10
 * Description: Kod koncar10 daje 10% na INGCO i SUPER INGCO, a 5% na ostale proizvode. Važi i na već sniženu cenu.
 *
 * Must-use plugin. Upload to the CMS document root:
 *   wp-content/mu-plugins/koncar-coupon-brand-split.php
 *
 * In WooCommerce → Kuponi create a coupon with code koncar10, type Percentage.
 * The amount on that screen is only a fallback. This file sets the real rate
 * per product when WooCommerce applies the coupon. Headless checkout also
 * writes the same rates onto the order, so both sides stay aligned.
 *
 * Delete this file to restore WooCommerce's single coupon percentage.
 */

if (!defined('ABSPATH')) {
    exit;
}

add_filter('woocommerce_coupon_get_discount_amount', 'koncar_coupon_brand_split_amount', 10, 5);

/**
 * @param float        $discount
 * @param float        $discounting_amount
 * @param mixed        $cart_item
 * @param bool         $single
 * @param WC_Coupon    $coupon
 * @return float
 */
function koncar_coupon_brand_split_amount($discount, $discounting_amount, $cart_item, $single, $coupon) {
    unset($single);
    if (!is_object($coupon) || !is_callable(array($coupon, 'get_code'))) {
        return $discount;
    }
    if (strtolower((string) $coupon->get_code()) !== 'koncar10') {
        return $discount;
    }

    $product = koncar_coupon_brand_split_product($cart_item);
    $rate = koncar_coupon_brand_split_is_ingco($product) ? 0.10 : 0.05;
    return (float) $discounting_amount * $rate;
}

/**
 * Cart discounts pass the cart line. Order discounts pass the order item.
 *
 * @param mixed $cart_item
 * @return object|null
 */
function koncar_coupon_brand_split_product($cart_item) {
    if (is_object($cart_item) && is_a($cart_item, 'WC_Product')) {
        return $cart_item;
    }
    if (is_array($cart_item) && isset($cart_item['data']) && is_object($cart_item['data']) && is_a($cart_item['data'], 'WC_Product')) {
        return $cart_item['data'];
    }
    if (is_object($cart_item) && is_callable(array($cart_item, 'get_product'))) {
        $product = $cart_item->get_product();
        if (is_object($product) && is_a($product, 'WC_Product')) {
            return $product;
        }
    }
    return null;
}

/**
 * @param object|null $product
 * @return bool
 */
function koncar_coupon_brand_split_is_ingco($product) {
    if (!is_object($product) || !is_callable(array($product, 'get_attribute'))) {
        return false;
    }
    $brand = (string) $product->get_attribute('pa_proizvodjac');
    if ($brand === '') {
        $brand = (string) $product->get_attribute('pa_brend');
    }
    if ($brand === '') {
        $brand = (string) $product->get_attribute('proizvodjac');
    }
    return stripos($brand, 'ingco') !== false;
}
