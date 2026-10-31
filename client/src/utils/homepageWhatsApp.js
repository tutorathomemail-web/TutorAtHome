import {buildWhatsAppUrl} from './whatsapp.js';

export const HOMEPAGE_WHATSAPP_MESSAGE = 'Hi TutorAtHome, I would like to enquire about your tutoring services.';

export function shouldShowHomepageWhatsApp(pathname, scrollY) {
  return pathname === '/' && Number.isFinite(scrollY) && scrollY <= 2;
}

export function homepageWhatsAppUrl(recipient) {
  return buildWhatsAppUrl(recipient, HOMEPAGE_WHATSAPP_MESSAGE);
}

/**
 * Use WhatsApp's universal link on touch devices so the operating system can
 * hand it to the installed app. On desktop, go directly to WhatsApp Web's
 * compose route instead of stopping at the generic wa.me landing page.
 */
export function homepageWhatsAppDestination(recipient, { userAgent = '', maxTouchPoints = 0 } = {}) {
  const universalUrl = homepageWhatsAppUrl(recipient);
  if (!universalUrl) return { href: '', target: '_blank' };

  const mobile = /Android|iPhone|iPad|iPod|IEMobile|Windows Phone|Opera Mini/i.test(userAgent)
    || (/Macintosh/i.test(userAgent) && maxTouchPoints > 1);
  if (mobile) return { href: universalUrl, target: '_self' };

  const parsed = new URL(universalUrl);
  const phone = parsed.pathname.slice(1);
  const message = parsed.searchParams.get('text') || '';
  return {
    href: `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`,
    target: '_blank',
  };
}
