import Hero from "@/component/common/Hero/Hero";
import LatestNews from "@/component/common/LatestNews/LatestNews";
import Featured from "@/component/Homepage/Featured/Featured";
import Getstarted from "@/component/Homepage/Getstarted/Getstarted";
import Hotjobs from "@/component/Homepage/HotJobs/Hotjobs";
import Footer from "@/component/common/Footer/Footer";
import Testimonials from "@/component/common/LatestNews/LatestNews";
import ApplyJob from "@/component/ApplyJob/ApplyJob";
const page = () => {
  return (
    <div>
      <Hero />
      <Hotjobs />
      <Featured />
      <Getstarted />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default page;
