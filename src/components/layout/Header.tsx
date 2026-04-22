import TopBar from './TopBar';
import Navbar from './Navbar';
import './Header.css';

export default function Header() {
  return (
    <div className="site-header">
      <TopBar />
      <Navbar />
    </div>
  );
}
