export default function Loader({ isVisible }) {
  return (
    <div className="loading-animation">
      <span className="rotator" style={{ display: (isVisible ? "block" : "none") }}></span>
    </div>);
}
