import DashboardNav from "./DashboardNav";
import "./DashboardLayout.css";


function DashboardLayout({ children }) {


  return (

    <div className="dashboard-page">


      {/* Floating Food */}

      <div className="dash-food food1">🥗</div>
      <div className="dash-food food2">🍅</div>
      <div className="dash-food food3">🍱</div>
      <div className="dash-food food4">🥬</div>



      {/* Top Bar */}

      <div className="dashboard-top">


        <div className="dashboard-logo">

          🍱 FoodBridge

        </div>


        <DashboardNav />


      </div>




      {/* Dashboard Content */}

      <div className="dashboard-content">

        {children}

      </div>


    </div>

  );

}


export default DashboardLayout;