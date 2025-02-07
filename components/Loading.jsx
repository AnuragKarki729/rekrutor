import './Loading.css';

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="pinwheel">
        <div className="pinwheel__line"></div>
        <div className="pinwheel__line"></div>
        <div className="pinwheel__line"></div>
        <div className="pinwheel__line"></div>
        <div className="pinwheel__line"></div>
        <div className="pinwheel__line"></div>
        <div className="pinwheel__line"></div>
      </div>
    </div>
  );
};

export default Loading; 