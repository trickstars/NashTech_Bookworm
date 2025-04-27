// src/pages/AboutPage.tsx

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Tiêu đề chính của trang */}
      <h1 className="text-3xl font-bold tracking-tight text-center mb-8 md:mb-12">
        About Us
      </h1>

      {/* Phần chào mừng */}
      <section className="mb-12 md:mb-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-6">
          Welcome to Bookworm
        </h2>
        <p className="text-center text-muted-foreground max-w-prose mx-auto leading-relaxed">
          "Bookworm is an independent New York bookstore and language school with
          locations in Manhattan and Brooklyn. We specialize in travel books and language
          classes."
        </p>
      </section>

      {/* Phần Our Story và Our Vision - 2 cột */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
        {/* Cột Our Story */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold border-b pb-2">
            Our Story
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            The name Bookworm was taken from the original name for New York International Airport,
            which was renamed JFK in December 1963.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Our Manhattan store has just moved to the West Village. Our new location is 170 7th
            Avenue South, at the corner of Perry Street.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            From March 2006 through May 2016, the store was located in the Flatiron District.
          </p>
        </div>

        {/* Cột Our Vision */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold border-b pb-2">
            Our Vision
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            One of the last travel bookstores in the country, our Manhattan store carries a range of
            guidebooks (all 10% off) to suit the needs and tastes of every traveler and budget.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            We believe that a novel or travelogue can be just as valuable a key to a place as any
            guidebook, and our well-read, well-traveled staff is happy to make reading recommendations for
            any traveler, book lover, or gift giver.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;