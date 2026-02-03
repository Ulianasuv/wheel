import { useRef, useState } from "react";

const prizes = [
  {
    text: "Скидка 10%",
    color: "hsl(197 30% 43%)",
    isWin: true,
  },
  {
    text: "Дизайн в подарок",
    color: "hsl(173 58% 39%)",
    isWin: true,
  },
  {
    text: "Второй сайт бесплатно",
    color: "hsl(43 74% 66%)",
    isWin: true,
  },
  {
    text: "Скидка 50%",
    color: "hsl(27 87% 67%)",
    isWin: true,
  },
  {
    text: "Блог в подарок",
    color: "hsl(12 76% 61%)",
    isWin: true,
  },
  {
    text: "Скидок нет",
    color: "hsl(350 60% 52%)",
    isWin: false,
  },
  {
    text: "Таргет в подарок",
    color: "hsl(91 43% 54%)",
    isWin: true,
  },
  {
    text: "Скидка 30% на всё",
    color: "hsl(140 36% 74%)",
    isWin: true,
  },
];

const Wheel = ({ onSpinComplete, attemptsLeft, isSpinning, setIsSpinning, showNotification,
  onSpinAttempt }) => {
  const spinnerRef = useRef(null);
  const tickerRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [currentSlice, setCurrentSlice] = useState(0);
  const tickerAnimRef = useRef(null);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const prizeSlice = 360 / prizes.length;
  const prizeOffset = Math.floor(180 / prizes.length);

  const createPrizeNodes = () => {
    return prizes.map(({ text, color }, i) => {
      const rotation = prizeSlice * i * -1 - prizeOffset;

      return (
        <li
          key={i}
          className={`prize ${selectedPrize === i ? "selected" : ""}`}
          style={{ "--rotate": `${rotation}deg`, "--color": color }}
        >
          <span className="text">{text}</span>
        </li>
      );
    });
  };

  const createConicGradient = () => {
    const gradient = prizes
      .map(
        ({ color }, i) =>
          `${color} 0 ${(100 / prizes.length) * (prizes.length - i)}%`,
      )
      .reverse()
      .join(", ");

    return {
      background: `conic-gradient(from -90deg, ${gradient})`,
    };
  };

  const spinertia = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const runTickerAnimation = () => {
    const spinnerStyles = window.getComputedStyle(spinnerRef.current);

    const values = spinnerStyles.transform
      .split("(")[1]
      .split(")")[0]
      .split(",");

    const a = values[0];
    const b = values[1];

    let rad = Math.atan2(b, a);

    if (rad < 0) rad += 2 * Math.PI;

    const angle = Math.round(rad * (180 / Math.PI));

    const slice = Math.floor(angle / prizeSlice);

    if (currentSlice != slice) {
      tickerRef.current.style.animation = "none";

      setTimeout(() => {
        tickerRef.current.style.animation = null;
      }, 3);

      setCurrentSlice(slice);
    }

    tickerAnimRef.current = requestAnimationFrame(runTickerAnimation);
  };

  const selectPrize = (finalRotation) => {
    const selected = Math.floor(finalRotation / prizeSlice) % prizes.length;

    setSelectedPrize(selected);

    return selected;
  };

  const handleSpin = () => {
     if (onSpinAttempt && !onSpinAttempt()) {
      return;
    }

    if (attemptsLeft <= 0) {
      showNotification('Дневной лимит попыток исчерпан. Ждем вас завтра!', 'info');
      return;
    }

    if (isSpinning) return;

    setIsSpinning(true);

    setSelectedPrize(null);


    const spinRotation = Math.floor(Math.random() * 360 + spinertia(2000, 5000));
    setRotation(spinRotation);

    spinnerRef.current.style.transform = `rotate(${spinRotation}deg)`;
    tickerRef.current.style.animation = 'none';

    runTickerAnimation();


    setTimeout(() => {
      if (tickerAnimRef.current) {
        cancelAnimationFrame(tickerAnimRef.current);
      }

      const finalRotation = spinRotation % 360;

      const selectedIndex = selectPrize(finalRotation);

      setRotation(finalRotation);

      setIsSpinning(false);

      if (onSpinComplete) {
        onSpinComplete(prizes[selectedIndex], selectedIndex);
      }

      spinnerRef.current.style.transition = "none";

      spinnerRef.current.style.transform = `rotate(${finalRotation}deg)`;

      setTimeout(() => {
        spinnerRef.current.style.transition =
          "transform 8s cubic-bezier(0.1, -0.01, 0, 1)";
      }, 10);
    }, 8000);

    
  };
  return (
      <div className="deal-wheel">
        <div
          ref={spinnerRef}
          className={`spinner ${isSpinning ? "is-spinning" : ""}`}
          style={createConicGradient() }
        >
          {createPrizeNodes()}
        </div>
        <div ref={tickerRef} className="ticker"></div>
        <button
          className="btn-spin"
          onClick={handleSpin}
          disabled={isSpinning || attemptsLeft <= 0}
        >
          {isSpinning
          ? "Крутится..."
          : attemptsLeft <= 0
            ? "Попытки закончились"
            : `Испытай удачу (осталось: ${attemptsLeft})`}
        </button>
      </div>
    );
};
export default Wheel;
