import Hero from "@/component/common/Hero/Hero";
import Featured from "@/component/Homepage/Featured/Featured";
import Getstarted from "@/component/Homepage/Getstarted/Getstarted";
import Hotjobs from "@/component/Homepage/HotJobs/Hotjobs";
import Footer from "@/component/common/Footer/Footer";
import Testimonials from "@/component/common/LatestNews/LatestNews";
const page = () => {
  return (
    <div>
      <Hero />
       <Featured />
      <Hotjobs />
      <Getstarted />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default page;
