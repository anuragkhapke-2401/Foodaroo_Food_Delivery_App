import './Sidebar.css'
import { assets } from '../../assets/assets'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <p className="sidebar-label">Workspace</p>
      <div className="sidebar-options">
        <NavLink to='add' className="sidebar-option">
          <img src={assets.add_icon} alt="" />
          <p>Add dish</p>
        </NavLink>
        <NavLink to='list' className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>Menu items</p>
        </NavLink>
        <NavLink to='orders' className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>Orders</p>
        </NavLink>
      </div>
    </div>
  )
}

export default Sidebar
