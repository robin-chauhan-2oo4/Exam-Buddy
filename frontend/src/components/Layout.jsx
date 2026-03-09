import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* 1. Dynamic Sidebar 
         The sidebar should have its own transition-all and w-64/w-20 classes 
      */}
      <Sidebar />

      {/* 2. Main Content Wrapper
         'flex-1' is the magic here. As the sidebar width changes, 
         this container will automatically grow or shrink to fill the remaining space.
      */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden transition-all duration-300">
        
        {/* Top Navigation */}
        <Topbar />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-slate-50">
          {/* 'max-w-7xl' allows the content to grow significantly 
             when the sidebar is collapsed.
          */}
          <div className="max-w-7xl mx-auto animate-fade-in transition-all duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}