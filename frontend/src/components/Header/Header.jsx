import "./Header.css";

const Header = () => {
  return (
    <div className="header">
      <div className="header-contents">
        <span className="header-eyebrow">Fresh from the kitchen · straight to you</span>
        <h2>Big flavor.<br />Zero fuss.</h2>
        <p>
          Your next favorite meal is only a few taps away. Find something good,
          made fresh and delivered fast.
        </p>
        <button onClick={() => document.getElementById("explore-menu")?.scrollIntoView({ behavior: "smooth" })}>Explore the menu <span aria-hidden="true">↘</span></button>
      </div>
    </div>
  );
};

export default Header;
