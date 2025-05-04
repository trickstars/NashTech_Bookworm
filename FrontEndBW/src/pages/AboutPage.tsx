// src/pages/AboutPage.tsx
// Không cần import Separator nữa

const AboutPage = () => {
  return (
    // Container chính của trang
    <div className="container mx-auto px-4 pb-8 md:pb-12">

      {/* Page Title Section */}
      <div className="mb-8 md:mb-10">
        {/* Tiêu đề trang "About Us" */}
        <h1 className="text-xl font-medium text-left mb-4">
          About Us
        </h1>
        {/* Đường kẻ dưới đơn giản */}
        <div className="border-b border-border"></div>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Phần chào mừng */}
        <section className="mb-12 md:mb-16">
          {/* Heading căn trái */}
          <h2 className="text-3xl font-semibold text-center mb-6">
            Welcome to Bookworm
          </h2>
          {/* Paragraph căn trái, giới hạn chiều rộng */}
          <p className="text-lg text-left text-muted-foreground leading-relaxed">
            "Bookworm is an independent New York bookstore and language school with
            locations in Manhattan and Brooklyn. We specialize in travel books and language
            classes."
          </p>
        </section>
  
        {/* Phần Our Story và Our Vision - 2 cột */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
            {/* Cột Our Story */}
            <div className="space-y-4">
              {/* Heading không có border dưới */}
              <h3 className="text-2xl font-semibold">
                Our Story
              </h3>
               {/* Paragraph dùng màu text mặc định */}
              <p className="leading-relaxed">
                The name Bookworm was taken from the original name for New York International Airport,
                which was renamed JFK in December 1963.
              </p>
              <p className="leading-relaxed">
                Our Manhattan store has just moved to the West Village. Our new location is 170 7th
                Avenue South, at the corner of Perry Street.
              </p>
              <p className="leading-relaxed">
                From March 2008 through May 2016, the store was located in the Flatiron District.
              </p>
            </div>
  
            {/* Cột Our Vision */}
            <div className="space-y-4">
              {/* Heading không có border dưới */}
              <h3 className="text-2xl font-semibold">
                Our Vision
              </h3>
               {/* Paragraph dùng màu text mặc định */}
              <p className="leading-relaxed">
                One of the last travel bookstores in the country, our Manhattan store carries a range of
                guidebooks (all 10% off) to suit the needs and tastes of every traveler and budget.
              </p>
              <p className="leading-relaxed">
                We believe that a novel or travelogue can be just as valuable a key to a place as any
                guidebook, and our well-read, well-traveled staff is happy to make reading recommendations for
                any traveler, book lover, or gift giver.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;