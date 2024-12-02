"use client";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface ThreeCountdownProps {}

interface Particle {
  position: THREE.Vector3;
  targetPosition: THREE.Vector3;
  velocity: THREE.Vector3;
  mesh: THREE.Mesh;
}

interface TextSettings {
  size: number;
  height: number;
  bevelSize: number;
  bevelThickness: number;
  curveSegments: number;
}

const styles = {
  container: {
    position: "relative",
    width: "100%",
    height: "100vh",
  },
  controlPanel: {
    position: "absolute",
    top: "16px",
    left: "16px",
    zIndex: 10,
    backgroundColor: "white",
    padding: "16px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  inputGroup: {
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
  },
  inputContainer: {
    display: "flex",
    flexDirection: "column" as const,
  },
  label: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "4px",
  },
  input: {
    width: "80px",
    padding: "4px 8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  colorInput: {
    width: "100%",
    height: "40px",
    marginBottom: "8px",
    padding: "0",
    border: "1px solid #ccc",
    borderRadius: "4px",
    cursor: "pointer",
  },
  button: {
    width: "100%",
    padding: "8px 16px",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
    cursor: "not-allowed",
  },
  canvas: {
    width: "100%",
    height: "100%",
  },
};

export default function ThreeCountdown({}: ThreeCountdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const textGroupRef = useRef<THREE.Group>();
  const controlsRef = useRef<OrbitControls>();
  const requestRef = useRef<number>();
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [color, setColor] = useState<string>("#00ff00");
  const [textSettings, setTextSettings] = useState<TextSettings>({
    size: 3,
    height: 1,
    bevelSize: 0.1,
    bevelThickness: 0.1,
    curveSegments: 12,
  });
  const timeRef = useRef<{ minutes: number; seconds: number }>({
    minutes: 0,
    seconds: 0,
  });
  const intervalRef = useRef<NodeJS.Timeout>();
  const particlesRef = useRef<Particle[]>([]);
  const explosionTimeRef = useRef<number>(0);
  const isExplodingRef = useRef<boolean>(false);
  const fontRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    sceneRef.current = new THREE.Scene();
    sceneRef.current.background = new THREE.Color(0xffffff);

    // Camera setup
    cameraRef.current = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current.position.z = 15;

    // Renderer setup
    rendererRef.current = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(rendererRef.current.domElement);

    // Orbit Controls setup
    if (cameraRef.current && rendererRef.current) {
      controlsRef.current = new OrbitControls(
        cameraRef.current,
        rendererRef.current.domElement
      );
      controlsRef.current.enableDamping = true;
      controlsRef.current.dampingFactor = 0.05;
    }

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 0, 1);
    sceneRef.current.add(light);
    sceneRef.current.add(new THREE.AmbientLight(0xffffff, 0.5));

    // Text group
    textGroupRef.current = new THREE.Group();
    sceneRef.current.add(textGroupRef.current);

    // Preload font
    const fontLoader = new FontLoader();
    fontLoader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
      fontRef.current = font;
      // Show initial preview when font loads
      createTimeText(formatTime(minutes, seconds));
    });

    // Animation loop
    const animate = (time: number) => {
      requestRef.current = requestAnimationFrame(animate);
      if (
        rendererRef.current &&
        sceneRef.current &&
        cameraRef.current &&
        controlsRef.current
      ) {
        if (isExplodingRef.current) {
          const elapsed = (time - explosionTimeRef.current) / 1000;

          if (elapsed < 3) {
            particlesRef.current.forEach((particle) => {
              particle.mesh.position.add(particle.velocity);
              particle.velocity.y -= 0.015;
              particle.velocity.multiplyScalar(0.99);
              particle.mesh.rotation.x += 0.1;
              particle.mesh.rotation.y += 0.1;
            });
          } else {
            isExplodingRef.current = false;
            particlesRef.current.forEach((particle) => {
              sceneRef.current?.remove(particle.mesh);
              particle.mesh.geometry.dispose();
              (particle.mesh.material as THREE.Material).dispose();
            });
            particlesRef.current = [];
          }
        }

        controlsRef.current.update();
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate(0);

    // Handle resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Update preview when settings change
  useEffect(() => {
    if (fontRef.current && !isRunning) {
      createTimeText(formatTime(minutes, seconds));
    }
  }, [minutes, seconds, color, textSettings]);

  const formatTime = (minutes: number, seconds: number): string => {
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const createParticlesFromMesh = (mesh: THREE.Mesh) => {
    const geometry = mesh.geometry;
    const positionAttribute = geometry.getAttribute("position");
    const particles: Particle[] = [];
    const particleCount = 1000;

    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const center = new THREE.Vector3();
    box.getCenter(center);

    for (let i = 0; i < particleCount; i++) {
      const x =
        THREE.MathUtils.randFloat(box.min.x, box.max.x) + mesh.position.x;
      const y =
        THREE.MathUtils.randFloat(box.min.y, box.max.y) + mesh.position.y;
      const z =
        THREE.MathUtils.randFloat(box.min.z, box.max.z) + mesh.position.z;

      const particleGeometry = new THREE.SphereGeometry(0.05);
      const particleMaterial = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.5,
      });
      const particleMesh = new THREE.Mesh(particleGeometry, particleMaterial);

      particleMesh.position.set(x, y, z);

      const speed = THREE.MathUtils.randFloat(0.1, 0.3);
      const angle = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const upwardBias = THREE.MathUtils.randFloat(0.2, 0.5);

      const particle: Particle = {
        position: new THREE.Vector3(x, y, z),
        targetPosition: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed + upwardBias,
          THREE.MathUtils.randFloat(-0.2, 0.2) * speed
        ),
        mesh: particleMesh,
      };

      particles.push(particle);
      sceneRef.current?.add(particleMesh);
    }

    return particles;
  };

  const explodeText = () => {
    if (!textGroupRef.current || !fontRef.current) return;

    const oldParticles = particlesRef.current;
    const currentMesh = textGroupRef.current.children[0] as THREE.Mesh;
    particlesRef.current = createParticlesFromMesh(currentMesh);

    textGroupRef.current.clear();
    oldParticles.forEach((particle) => {
      sceneRef.current?.remove(particle.mesh);
      particle.mesh.geometry.dispose();
      (particle.mesh.material as THREE.Material).dispose();
    });

    isExplodingRef.current = true;
    explosionTimeRef.current = performance.now();
  };

  const createTimeText = (timeString: string, clear: boolean = true) => {
    if (!fontRef.current) return;

    if (clear && textGroupRef.current) {
      textGroupRef.current.clear();
    }

    const geometry = new TextGeometry(timeString, {
      font: fontRef.current,
      size: textSettings.size,
      height: textSettings.height,
      curveSegments: textSettings.curveSegments,
      bevelEnabled: true,
      bevelThickness: textSettings.bevelThickness,
      bevelSize: textSettings.bevelSize,
      bevelOffset: 0,
      bevelSegments: 5,
    });

    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(color),
      specular: 0x555555,
      shininess: 30,
    });

    const mesh = new THREE.Mesh(geometry, material);

    geometry.computeBoundingBox();
    const textWidth = geometry.boundingBox!.max.x - geometry.boundingBox!.min.x;
    mesh.position.x = -textWidth / 2;

    textGroupRef.current?.add(mesh);
  };

  const stopCountdown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      setIsRunning(false);
      createTimeText(formatTime(minutes, seconds));
    }
  };

  const startCountdown = () => {
    if (isRunning || (minutes === 0 && seconds === 0)) return;

    if (!fontRef.current) {
      alert("Font is still loading, please try again in a moment");
      return;
    }

    timeRef.current = { minutes, seconds };
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      if (timeRef.current.seconds === 0) {
        if (timeRef.current.minutes === 0) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          explodeText();
          return;
        }
        timeRef.current.minutes--;
        timeRef.current.seconds = 59;
      } else {
        timeRef.current.seconds--;
      }

      createTimeText(
        formatTime(timeRef.current.minutes, timeRef.current.seconds)
      );
    }, 1000);
  };

  const Slider = ({
    label,
    value,
    onChange,
    min,
    max,
    step,
    disabled,
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    disabled: boolean;
  }) => (
    <div style={styles.inputContainer}>
      <label style={styles.label}>
        {label}: {value}
      </label>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{ flex: 1 }}
          disabled={disabled}
        />
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={{ ...styles.controlPanel, width: "300px" }}>
        <div style={styles.inputContainer}>
          <label style={styles.label}>Color</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={styles.colorInput}
            disabled={isRunning}
          />
        </div>
        <div style={styles.inputGroup}>
          <div style={styles.inputContainer}>
            <label style={styles.label}>Minutes</label>
            <input
              type="number"
              min="0"
              max="59"
              value={minutes || ""}
              onChange={(e) =>
                setMinutes(
                  Math.max(0, Math.min(59, e.target.valueAsNumber || 0))
                )
              }
              style={styles.input}
              disabled={isRunning}
            />
          </div>
          <div style={styles.inputContainer}>
            <label style={styles.label}>Seconds</label>
            <input
              type="number"
              min="0"
              max="59"
              value={seconds || ""}
              onChange={(e) =>
                setSeconds(
                  Math.max(0, Math.min(59, e.target.valueAsNumber || 0))
                )
              }
              style={styles.input}
              disabled={isRunning}
            />
          </div>
        </div>

        <div style={{ marginTop: "16px", marginBottom: "16px" }}>
          <div
            style={{
              ...styles.label,
              marginBottom: "8px",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Text Settings</span>
            {!isRunning && (
              <span
                style={{
                  fontSize: "12px",
                  color: "#666",
                  fontWeight: "normal",
                }}
              >
                Live Preview
              </span>
            )}
          </div>

          <Slider
            label="Size"
            value={textSettings.size}
            onChange={(value) =>
              setTextSettings({ ...textSettings, size: value })
            }
            min={1}
            max={10}
            step={0.1}
            disabled={isRunning}
          />
          <Slider
            label="Thickness"
            value={textSettings.height}
            onChange={(value) =>
              setTextSettings({ ...textSettings, height: value })
            }
            min={0.1}
            max={3}
            step={0.1}
            disabled={isRunning}
          />
          <Slider
            label="Bevel Size"
            value={textSettings.bevelSize}
            onChange={(value) =>
              setTextSettings({ ...textSettings, bevelSize: value })
            }
            min={0}
            max={0.5}
            step={0.01}
            disabled={isRunning}
          />
          <Slider
            label="Bevel Thickness"
            value={textSettings.bevelThickness}
            onChange={(value) =>
              setTextSettings({ ...textSettings, bevelThickness: value })
            }
            min={0}
            max={0.5}
            step={0.01}
            disabled={isRunning}
          />
          <Slider
            label="Curve Quality"
            value={textSettings.curveSegments}
            onChange={(value) =>
              setTextSettings({
                ...textSettings,
                curveSegments: Math.round(value),
              })
            }
            min={1}
            max={20}
            step={1}
            disabled={isRunning}
          />
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={startCountdown}
            disabled={isRunning || (minutes === 0 && seconds === 0)}
            style={{
              ...styles.button,
              backgroundColor:
                isRunning || (minutes === 0 && seconds === 0) ? "#ccc" : color,
              flex: 1,
            }}
          >
            {isRunning ? "Running..." : "Start Timer"}
          </button>
          {isRunning && (
            <button
              onClick={stopCountdown}
              style={{
                ...styles.button,
                backgroundColor: "#ff4444",
                flex: 1,
              }}
            >
              Stop
            </button>
          )}
        </div>
      </div>
      <div ref={containerRef} style={styles.canvas} />
    </div>
  );
}
