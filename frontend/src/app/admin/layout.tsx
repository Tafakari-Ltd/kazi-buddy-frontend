import Navbar from "@/component/Admin/Navbar/Navbar";

import Sidebar from "@/component/Admin/Sidebar/Sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Navbar />
      <Sidebar />
      <div className="pt-12">{children}</div>
    </div>
  );
};

export default Layout;
