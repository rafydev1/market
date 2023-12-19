import React, { useState } from 'react';

import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import TopCountry from '../partials/dashboard/TopCountrys';
import RecentActivity from '../partials/dashboard/RecentActivity';
import SaleRefund from '../partials/dashboard/SaleRefund';
import Customers from '../partials/dashboard/Customers';

function Dashboard() {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">

        {/*  Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">


            {/* Cards */}
            <div className="grid grid-cols-12 gap-6">

              {/* Doughnut chart (Top Countries) */}
              <TopCountry />
              {/* Card (Recent Activity) */}
              <RecentActivity />
              {/* Stacked bar chart (Sales VS Refunds) */}
              <SaleRefund />
              {/* Card (Customers) */}
              <Customers />

            </div>

          </div>
        </main>

      </div>
    </div>
  );
}

export default Dashboard;