import Sidebar from "@/component/employee/Sidebar/Sidebar";
import Navbar from "@/component/employee/Navbar/Navbar";
const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <div>
        <div>
          <Navbar />
          <div>
            <div className="py-10">{children}</div>
          </div>
          <Sidebar />
        </div>
      </div>
    </div>
  );
};

export default layout;
