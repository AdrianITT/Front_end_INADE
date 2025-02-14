import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {  Button} from "antd";


const Button1 = () => {
     const navigate = useNavigate();
  return (
     <Button type="text" className="back-button" onClick={()=>navigate(-1)}><ArrowLeftOutlined /></Button>
  );
}

export default Button1;