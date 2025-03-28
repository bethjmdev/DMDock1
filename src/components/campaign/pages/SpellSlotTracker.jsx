import React, { useState } from "react";

const SpellSlotTracker = () => {
  // Initialize spell slots for levels 1-9
  const [spellSlots, setSpellSlots] = useState([
    { level: 1, max: 4, current: 4 },
    { level: 2, max: 3, current: 3 },
    { level: 3, max: 3, current: 3 },
    { level: 4, max: 3, current: 3 },
    { level: 5, max: 2, current: 2 },
    { level: 6, max: 1, current: 1 },
    { level: 7, max: 1, current: 1 },
    { level: 8, max: 1, current: 1 },
    { level: 9, max: 1, current: 1 },
  ]);

  const updateSlots = (level, increment) => {
    setSpellSlots((slots) =>
      slots.map((slot) =>
        slot.level === level
          ? {
              ...slot,
              current: Math.min(
                Math.max(slot.current + increment, 0),
                slot.max
              ),
            }
          : slot
      )
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Spell Slot Tracker</h1>
      <div className="grid gap-4">
        {spellSlots.map(({ level, max, current }) => (
          <div key={level} className="flex items-center gap-4">
            <span className="font-bold w-24">Level {level}</span>
            <button
              onClick={() => updateSlots(level, -1)}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              -
            </button>
            <span className="w-16 text-center">
              {current} / {max}
            </span>
            <button
              onClick={() => updateSlots(level, 1)}
              className="px-3 py-1 bg-green-500 text-white rounded"
            >
              +
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpellSlotTracker;
