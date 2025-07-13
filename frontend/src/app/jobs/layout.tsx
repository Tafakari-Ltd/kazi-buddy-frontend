import Footer from "@/component/common/Footer/Footer";
import Navbar from "@/component/common/Navbar/Navbar";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Navbar />
      <div>
        <div className="pt-[40px]">{children}</div>
      </div>
      <Footer />
    </div>
  );
};

export default layout;
