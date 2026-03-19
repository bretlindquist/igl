import { motion } from "framer-motion";

interface TabNavProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabNav = ({ tabs, activeTab, onTabChange }: TabNavProps) => {
  return (
    <div className="hide-scrollbar flex gap-1 p-1 bg-card rounded-xl overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className="relative shrink-0 px-3 md:px-4 py-2 text-center text-sm font-display font-medium whitespace-nowrap rounded-lg transition-colors"
        >
          {activeTab === tab && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-primary rounded-lg"
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            />
          )}
          <span className={`relative z-10 ${activeTab === tab ? "text-primary-foreground" : "text-muted-foreground"}`}>
            {tab}
          </span>
        </button>
      ))}
    </div>
  );
};

export default TabNav;
