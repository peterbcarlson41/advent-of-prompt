import React, { useEffect, useRef } from "react";

const SnowAnimation = ({ totalSnowfall }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let accumulationPoints = [];

    const initializeAccumulationPoints = () => {
      accumulationPoints = new Array(Math.ceil(window.innerWidth)).fill(
        window.innerHeight - 10
      );
    };

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeAccumulationPoints();
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    const maxAccumulationHeight = window.innerHeight * 0.3;
    const snowflakeCount = Math.min(Math.floor(totalSnowfall * 2), 300);
    const snowColor = "#ffffff";

    const snowflakes = Array.from({ length: snowflakeCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 0.7,
      radius: Math.random() * 3 + 1,
      speed: Math.random() * 1 + 0.5,
      wind: Math.random() * 0.5 - 0.25,
    }));

    const accumulateSnow = (x) => {
      const index = Math.floor(x);
      if (index >= 0 && index < accumulationPoints.length) {
        // Increased range for smoother distribution
        const range = 100;
        // Reduced amount for gentler accumulation
        const amount = 2.5;

        // Find the average height of nearby points
        let nearbySum = 0;
        let nearbyCount = 0;
        for (
          let i = Math.max(0, index - range / 2);
          i < Math.min(accumulationPoints.length, index + range / 2);
          i++
        ) {
          nearbySum += accumulationPoints[i];
          nearbyCount++;
        }
        const averageHeight = nearbySum / nearbyCount;

        // Accumulate snow more evenly
        for (
          let i = Math.max(0, index - range);
          i < Math.min(accumulationPoints.length, index + range);
          i++
        ) {
          const distance = Math.abs(i - index);
          const decrease = amount * (1 - distance / range);

          // Use the average height to prevent peaks
          const targetHeight = Math.min(
            averageHeight - decrease,
            accumulationPoints[i] - decrease
          );

          accumulationPoints[i] = Math.max(
            window.innerHeight - maxAccumulationHeight,
            targetHeight
          );
        }
      }
    };

    let animationFrame;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth out the snow accumulation curve
      const smoothedPoints = [...accumulationPoints];
      for (let i = 1; i < smoothedPoints.length - 1; i++) {
        smoothedPoints[i] =
          (accumulationPoints[i - 1] +
            accumulationPoints[i] +
            accumulationPoints[i + 1]) /
          3;
      }

      // Draw accumulated snow
      ctx.fillStyle = snowColor;
      ctx.beginPath();
      ctx.moveTo(0, window.innerHeight);

      // Draw smooth accumulated snow with bezier curves
      for (let i = 0; i < smoothedPoints.length; i += 3) {
        if (i === 0) {
          ctx.lineTo(0, smoothedPoints[0]);
        } else {
          const x1 = i - 1;
          const x2 = i + 1;
          const x3 = i + 2;

          ctx.bezierCurveTo(
            x1,
            smoothedPoints[i - 1],
            x2,
            smoothedPoints[i],
            x3,
            smoothedPoints[Math.min(i + 2, smoothedPoints.length - 1)]
          );
        }
      }

      ctx.lineTo(canvas.width, smoothedPoints[smoothedPoints.length - 1]);
      ctx.lineTo(canvas.width, window.innerHeight);
      ctx.closePath();
      ctx.fill();

      // Draw snowflakes
      ctx.fillStyle = snowColor;
      snowflakes.forEach((flake) => {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fill();

        flake.y += flake.speed;
        flake.x += flake.wind;

        const currentSnowHeight =
          smoothedPoints[Math.floor(flake.x)] || window.innerHeight;

        if (flake.y + flake.radius >= currentSnowHeight) {
          accumulateSnow(flake.x);
          flake.y = -flake.radius;
          flake.x = Math.random() * window.innerWidth;
        }

        if (flake.x + flake.radius > window.innerWidth) {
          flake.x = flake.radius;
        } else if (flake.x - flake.radius < 0) {
          flake.x = window.innerWidth - flake.radius;
        }
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      cancelAnimationFrame(animationFrame);
    };
  }, [totalSnowfall]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
        backgroundColor: "transparent",
      }}
    />
  );
};

export default SnowAnimation;
