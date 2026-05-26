
import HomeHeader from "../../Components/Header/HomeHeader"
import Hero from "../../Components/Hero/Hero"
import HomeFooter from "../../Components/Footer/HomeFooter"
import ProductSection from "../../Components/Home/Product";
import StorySection from "../../Components/Home/Story";
import FeaturesSection from "../../Components/Home/Features";

function HomePage() {

  return (
    <>
    <HomeHeader/>
    <Hero/>
    <ProductSection/>
    <StorySection/>
    <FeaturesSection/>
    <HomeFooter/>
    </>
  )
}

export default HomePage;
