import { Navbar } from "reactstrap";
import { useSelector, useDispatch } from "react-redux";

import { Link, useNavigate } from "react-router-dom";
import { logout } from "../Features/UserSlice";
import logo from "../Images/smart-job-logo.svg";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.users.user);

  const dashboardPath =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "company"
      ? "/company"
      : "/applicant";

  const handlelogout = async () => {
    dispatch(logout());
    await new Promise((resolve) => setTimeout(resolve, 100));
    navigate("/login");
  };

  return (
    <>
      <Navbar className="header">
        <Link to="/" className="brandLink">
          <img src={logo} alt="Smart Job Tracker logo" />
        </Link>
        <div className="figmaNav">
          <Link to={user?._id ? dashboardPath : "/login"}>Sign In</Link>
          <Link onClick={handlelogout}>Logout</Link>
        </div>
      </Navbar>
    </>
  );
};

export default Header;
