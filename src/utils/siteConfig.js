// Central business configuration — single source of truth for the
// storefront. Admin-only secrets live in .env and are never imported here.

export const WHATSAPP_NUMBER = (
  import.meta.env.VITE_WHATSAPP_NUMBER || "923472886228"
).replace(/\D/g, "");

export const whatsappUrl = (text) =>
  `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
