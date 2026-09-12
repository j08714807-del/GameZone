import { Link } from 'react-router-dom';
import { Gamepad2, Twitter, Youtube, Instagram, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <Gamepad2 size={24} />
              <span>GAME<span>ZONE</span></span>
            </Link>
            <p className="footer__tagline">Discover your next favorite game. Best prices, biggest collection.</p>
            <div className="footer__socials">
              <a href="#" aria-label="Discord" className="footer__social"><MessageCircle size={18} /></a>
              <a href="#" aria-label="Instagram" className="footer__social"><Instagram size={18} /></a>
              <a href="#" aria-label="Twitter" className="footer__social"><Twitter size={18} /></a>
              <a href="#" aria-label="YouTube" className="footer__social"><Youtube size={18} /></a>
            </div>
          </div>

          {/* Navigation */}
          <div className="footer__col">
            <h4 className="footer__col-title">Navigation</h4>
            <ul className="footer__links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/games">Games</Link></li>
              <li><Link to="/games?sort=discount">Deals</Link></li>
              <li><Link to="/news">News</Link></li>
              <li><Link to="/">Community</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer__col">
            <h4 className="footer__col-title">Support</h4>
            <ul className="footer__links">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Terms</a></li>
              <li><a href="#">Privacy</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer__col">
            <h4 className="footer__col-title">Categories</h4>
            <ul className="footer__links">
              <li><Link to="/games?category=Action">Action</Link></li>
              <li><Link to="/games?category=RPG">RPG</Link></li>
              <li><Link to="/games?category=Shooter">Shooter</Link></li>
              <li><Link to="/games?category=Racing">Racing</Link></li>
              <li><Link to="/games?category=Indie">Indie</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© 2026 GAMEZONE. All rights reserved.</p>
          <p>Made with ❤️ for gamers</p>
        </div>
      </div>
    </footer>
  );
}
