export default function ProductGrid() {
  return (
    <section className="relative z-20 px-6 md:px-20 py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm"
          >
            <img
              src="/images/product.jpg"
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
