import { useNavigate } from "react-router-dom";

function DashboardNav() {

  const navigate = useNavigate();


  const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");

  };


  return (

    <div
      style={{
        display:"flex",
        justifyContent:"flex-end",
        gap:"15px",
        padding:"20px",
        position:"relative",
        zIndex:10
      }}
    >


      <button

        onClick={() => navigate("/impact")}

        style={{

          padding:"10px 22px",

          borderRadius:"25px",

          border:"none",

          background:"#27ae60",

          color:"white",

          cursor:"pointer",

          fontSize:"15px",

          fontWeight:"600"

        }}

      >

        🌍 Impact

      </button>



      <button

        onClick={logout}

        style={{

          padding:"10px 22px",

          borderRadius:"25px",

          border:"none",

          background:"#e74c3c",

          color:"white",

          cursor:"pointer",

          fontSize:"15px",

          fontWeight:"600"

        }}

      >

        Logout

      </button>


    </div>

  );

}


export default DashboardNav;