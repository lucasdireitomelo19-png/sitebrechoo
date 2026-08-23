import Link from "next/link";
import { InstagramIcon, WhatsappIcon } from "@/components/icons";
import type { MenuCategory } from "@/components/MobileMenu";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function Footer({ categories, t }: { categories: MenuCategory[]; t: Dictionary }) {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_URL;
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
  const hasContact = email || whatsapp || instagram;

  return (
    <footer className="mt-20 bg-sage-dark text-cream/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-5 sm:px-6">
        <div className="sm:col-span-1">
          <p className="font-extrabold text-2xl text-cream">Carcamana&apos;s</p>
          <p className="mt-3 text-sm leading-relaxed">{t.footer.tagline}</p>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-cream">
            {t.footer.shop}
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="transition hover:text-cream">
                {t.footer.allProducts}
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/?categoria=${c.slug}`} className="transition hover:text-cream">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-cream">
            {t.footer.howItWorks}
          </p>
          <p className="text-sm leading-relaxed">{t.footer.howItWorksText}</p>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-cream">
            {t.footer.institutional}
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/institucional" className="transition hover:text-cream">
                {t.footer.aboutUs}
              </Link>
            </li>
            <li>
              <Link href="/politica-de-troca" className="transition hover:text-cream">
                {t.footer.returnPolicy}
              </Link>
            </li>
          </ul>
        </div>

        {hasContact && (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-cream">
              {t.footer.contact}
            </p>
            <ul className="space-y-2 text-sm">
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="transition hover:text-cream">
                    {email}
                  </a>
                </li>
              )}
              {whatsapp && (
                <li>
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 transition hover:text-cream"
                  >
                    <WhatsappIcon className="h-4 w-4" /> WhatsApp
                  </a>
                </li>
              )}
              {instagram && (
                <li>
                  <a
                    href={instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 transition hover:text-cream"
                  >
                    <InstagramIcon className="h-4 w-4" /> Instagram
                  </a>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-cream/10 px-4 py-5 text-xs text-cream/40 sm:px-6">
        <p>{t.footer.bottomLine1}</p>
        <p className="mt-1">{t.footer.bottomLine2}</p>
      </div>
    </footer>
  );
}
