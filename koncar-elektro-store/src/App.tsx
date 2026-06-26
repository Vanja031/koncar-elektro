import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { CartProvider } from "@/context/CartContext";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import CategoryPage from "./pages/CategoryPage.tsx";
import ProductPage from "./pages/ProductPage.tsx";
import ProductCategoryRoute from "./pages/ProductCategoryRoute.tsx";
import { LegacyCategoryRedirect, LegacyProductRedirect } from "./pages/LegacyRedirects.tsx";
import CartPage from "./pages/CartPage.tsx";
import CheckoutPage from "./pages/CheckoutPage.tsx";
import OrderConfirmationPage from "./pages/OrderConfirmationPage.tsx";
import SalePage from "./pages/SalePage.tsx";
import AboutPage from "./pages/AboutPage.tsx";
import ContactPage from "./pages/ContactPage.tsx";
import FaqPage from "./pages/FaqPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import { ROUTES } from "@/lib/catalogUrls";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/akcija" element={<SalePage />} />
            <Route path="/o-nama" element={<AboutPage />} />
            <Route path="/kontakt" element={<ContactPage />} />
            <Route path={ROUTES.faq} element={<FaqPage />} />
            <Route path={ROUTES.cart} element={<CartPage />} />
            <Route path={ROUTES.checkout} element={<CheckoutPage />} />
            <Route path={`${ROUTES.checkoutThanks}/*`} element={<OrderConfirmationPage />} />
            {/* Legacy dev checkout paths */}
            <Route path="/placanje" element={<Navigate to={ROUTES.checkout} replace />} />
            <Route path="/placanje/hvala" element={<Navigate to={ROUTES.checkoutThanks} replace />} />
            {/* WooCommerce canonical URLs */}
            <Route path="/proizvodi" element={<CategoryPage programSlug="alati" />} />
            <Route path="/product-category/*" element={<ProductCategoryRoute />} />
            <Route path="/prodavnica/*" element={<ProductPage />} />
            {/* Dev-era paths → canonical (client redirect) */}
            <Route path="/proizvod/:slug" element={<LegacyProductRedirect />} />
            <Route path="/kategorija/*" element={<LegacyCategoryRedirect />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
