import Link from "next/link";
import { InstagramIcon, WhatsappIcon } from "@/components/icons";
import type { MenuCategory } from "@/components/MobileMenu";

export function Footer({ categories }: { categories: MenuCategory[] }) {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_URL;
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
  const hasContact = email || whatsapp || instagram;

  return (
    <footer className="mt-16 border-t border-stone-200 bg-stone-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="mb-3 text-sm font-semibold text-stone-900">Comprar</p>
          <ul className="space-y-2 text-sm text-stone-500">
            <li>
              <Link href="/" className="hover:text-stone-800">
                Todas as peças
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/?categoria=${c.slug}`} className="hover:text-stone-800">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-stone-900">Como funciona</p>
          <p className="text-sm leading-relaxed text-stone-500">
            Cada peça é única e vendida por unidade. Escolha, adicione ao carrinho e finalize a
            compra — você recebe atualizações do pedido diretamente na página de status.
          </p>
        </div>

        {hasContact && (
          <div>
            <p className="mb-3 text-sm font-semibold text-stone-900">Contato</p>
            <ul className="space-y-2 text-sm text-stone-500">
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="hover:text-stone-800">
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
                    className="flex items-center gap-2 hover:text-stone-800"
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
                    className="flex items-center gap-2 hover:text-stone-800"
                  >
                    <InstagramIcon className="h-4 w-4" /> Instagram
                  </a>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-stone-200 px-4 py-6 text-xs text-stone-400 sm:px-6">
        <p>Brechó Online — peças de segunda mão selecionadas com carinho.</p>
        <p className="mt-1">Pagamentos processados com segurança via PagBank.</p>
      </div>
    </footer>
  );
}
