import { WhatsappIcon } from "@/components/icons";

export function WhatsAppButton() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_URL;
  if (!whatsapp) return null;

  return (
    <a
      href={whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:shadow-xl"
    >
      <WhatsappIcon className="h-7 w-7" />
    </a>
  );
}
