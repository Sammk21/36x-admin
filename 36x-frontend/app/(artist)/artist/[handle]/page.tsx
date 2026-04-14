import Image from "next/image";
import { notFound } from "next/navigation";
import { strapi, strapiImage } from "@/lib/strapi";
import { Masonry } from "@/components/home/Masonry";
import type { StrapiSocialLinks } from "@/lib/types/strapi";

interface ArtistPageProps {
  params: Promise<{ handle: string }>;
}

// ─── Social link icons ────────────────────────────────────────────────────────

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function SocialLinks({ links }: { links: StrapiSocialLinks }) {
  const items: { href: string; label: string; icon: React.ReactNode }[] = [];

  if (links.instagram)
    items.push({ href: links.instagram, label: "Instagram", icon: <InstagramIcon /> });
  if (links.twitter)
    items.push({ href: links.twitter, label: "X / Twitter", icon: <TwitterIcon /> });
  if (links.youtube)
    items.push({ href: links.youtube, label: "YouTube", icon: <YouTubeIcon /> });
  if (links.facebook)
    items.push({ href: links.facebook, label: "Facebook", icon: <FacebookIcon /> });
  if (links.Whatsapp)
    items.push({
      href: `https://wa.me/${links.Whatsapp}`,
      label: "WhatsApp",
      icon: <WhatsappIcon />,
    });

  if (items.length === 0) return null;

  return (
    <div className="flex items-center gap-3">
      {items.map(({ href, label, icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/60 transition-all duration-200"
        >
          {icon}
        </a>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { handle } = await params;

  const artist = await strapi.artists.findOne(handle).catch(() => null);
  if (!artist) notFound();

  const coverUrl = strapiImage(artist.cover_image);
  const bannerUrls = (artist.bannerImages ?? [])
    .map((img) => strapiImage(img))
    .filter(Boolean) as string[];

  const products = (artist.products ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    thumbnailUrl: strapiImage(p.thumbnail),
  }));

  return (
    <div className="min-h-screen bg-[#111111] text-white">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative w-full h-[85vh] overflow-hidden">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={artist.title}
            fill
            priority
            className="object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-neutral-900" />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-[#111111] via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-14 md:px-16 md:pb-20 max-w-5xl">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-3 font-body">
            Artist Collaboration
          </p>
          <h1 className="font-display text-6xl md:text-8xl lg:text-[9rem] uppercase leading-[0.9] tracking-tight">
            {artist.title}
          </h1>
          {artist.subtitle && (
            <p className="mt-4 text-lg md:text-xl text-white/70 font-body max-w-xl">
              {artist.subtitle}
            </p>
          )}
          {artist.socialLinks && (
            <div className="mt-6">
              <SocialLinks links={artist.socialLinks} />
            </div>
          )}
        </div>
      </section>

      {/* ── Bio ──────────────────────────────────────────────────────── */}
      {artist.bio && (
        <section className="px-6 py-16 md:px-16 md:py-24 max-w-4xl">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-6 font-body">
            About
          </p>
          <div
            className="text-xl md:text-2xl font-body text-white/80 leading-relaxed prose prose-invert prose-neutral max-w-none"
            dangerouslySetInnerHTML={{ __html: artist.bio }}
          />
        </section>
      )}

      {/* ── Banner images ─────────────────────────────────────────────── */}
      {bannerUrls.length > 0 && (
        <section className="px-6 md:px-16 pb-16 md:pb-24">
          <div
            className={`grid gap-3 ${
              bannerUrls.length === 1
                ? "grid-cols-1"
                : bannerUrls.length === 2
                ? "grid-cols-2"
                : "grid-cols-2 md:grid-cols-3"
            }`}
          >
            {bannerUrls.map((url, i) => (
              <div key={i} className="relative aspect-3/4 overflow-hidden rounded-2xl">
                <Image
                  src={url}
                  alt={`${artist.title} — ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Products ──────────────────────────────────────────────────── */}
      {products.length > 0 && (
        <Masonry
          title={<>Works by {artist.title}</>}
          description={`${products.length} piece${products.length > 1 ? "s" : ""} in this collaboration`}
          products={products}
          columns={3}
          className="border-t border-white/10"
        />
      )}
    </div>
  );
}
