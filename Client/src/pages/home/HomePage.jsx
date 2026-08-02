
import Hero from "../../Components/Hero/Hero";
import ProductSection from "../../Components/Home/Product";
import StorySection from "../../Components/Home/Story";
import FeaturesSection from "../../Components/Home/Features";
import Testimonials from "../../Components/Home/Testimonials";
import Newsletter from "../../Components/Home/Newsletter";

function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <ProductSection />
      <StorySection />
      <FeaturesSection />
      <Testimonials />
      <Newsletter />
    </main>
  );
}

export default HomePage;

