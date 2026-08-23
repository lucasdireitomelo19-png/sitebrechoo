import Link from "next/link";
import { InstagramIcon, WhatsappIcon } from "@/components/icons";
import type { MenuCategory } from "@/components/MobileMenu";

export function Footer({ categories }: { categories: MenuCategory[] }) {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_URL;
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
  const hasContact = email || whatsapp || instagram;

  return (
    <footer className="mt-20 bg-espresso text-cream/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-4 sm:px-6">
        <div className="sm:col-span-1">
          <p className="font-serif text-2xl italic text-cream">Brechó</p>
          <p className="mt-3 text-sm leading-relaxed">
            Peças de segunda mão selecionadas com carinho. Moda circular, com estilo.
          </p>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-cream">Comprar</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="transition hover:text-cream">
                Todas as peças
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
            Como funciona
          </p>
          <p className="text-sm leading-relaxed">
            Cada peça é única e vendida por unidade. Escolha, adicione ao carrinho e finalize a
            compra — você recebe atualizações do pedido diretamente na página de status.
          </p>
        </div>

        {hasContact && (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-cream">
              Contato
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
        <p>Brechó Online — peças de segunda mão selecionadas com carinho.</p>
        <p className="mt-1">Pagamentos processados com segurança via PagBank.</p>
      </div>
    </footer>
  );
}
