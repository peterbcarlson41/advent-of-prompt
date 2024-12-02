# Day 1: 3D Countdown Timer - Advent of Prompt 2024

An interactive 3D countdown timer built with Three.js and React. Features customizable 3D text that explodes into particles when the countdown reaches zero.

![Countdown Timer Demo](demo.gif)

## Features

- Real-time 3D text customization
  - Adjustable size
  - Controllable thickness
  - Customizable bevel size and thickness
  - Variable curve quality
  - Color picker
- Interactive countdown controls
  - Set minutes and seconds
  - Start/Stop functionality
- Particle explosion effect when timer completes
- Orbital camera controls for 3D viewing
- Live preview of text changes

## Technical Details

### Built With

- Three.js for 3D rendering
- React for UI
- TypeScript for type safety
- Next.js framework

### Key Components

- FontLoader for 3D text rendering
- TextGeometry for 3D text mesh creation
- OrbitControls for camera manipulation
- Custom particle system for explosion effects

## Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Dependencies

```json
{
  "three": "^0.160.0",
  "@types/three": "^0.160.0",
  "react": "^18.2.0",
  "next": "14.0.0",
  "typescript": "^5.0.0"
}
```

## Usage

1. Set your desired countdown time using the minutes and seconds inputs
2. Customize the text appearance using the sliders:
   - Size: Changes overall text scale
   - Thickness: Adjusts text depth
   - Bevel Size: Controls edge rounding
   - Bevel Thickness: Sets depth of rounded edges
   - Curve Quality: Adjusts text smoothness
3. Choose a color using the color picker
4. Click "Start Timer" to begin countdown
5. Use orbit controls to view the 3D text from different angles
6. Watch the particle explosion when the timer reaches zero!

## Known Issues/Limitations

- Font must be loaded before timer can start
- High curve quality settings may impact performance
- Text preview updates may have slight delay on slower devices

## Future Improvements

- [ ] Add more particle effects options
- [ ] Implement sound effects
- [ ] Add preset text styles
- [ ] Save custom settings
- [ ] Add animation transitions between number changes

## Credits

- Uses the Helvetiker font for 3D text
- Inspired by Three.js examples and documentation
