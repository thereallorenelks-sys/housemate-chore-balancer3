import React, { useMemo, useState, useEffect } from "react";

const DEFAULT_PEOPLE = [
  "Loren <thereallorenelks@gmail.com>",
  "Zach <zachlamason@gmail.com>",
  "Tristyn <tristynelks@gmail.com>"
];

const FREQS = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "twice_week", label: "Twice a Week" },
  { key: "every_2_weeks", label: "Every 2 Weeks" },
  { key: "monthly", label: "Monthly (staggered)" },
  { key: "quarterly", label: "Quarterly (group week)" },
];

const AREA_OPTIONS = [
  "All Rooms",
  "Bathroom",
  "Kitchen",
  "Laundry",
  "Laundry / Cat Area",
  "Laundry Room",
  "Living Room",
  "Stairs",
  "Upstairs",
];

// Expanded chore list with more variety + staggered frequencies
const REAL_CHORES = [
  { id: 1, name: "Sweeping & Mopping", area: "Laundry Room", weight: 4, freq: "weekly" },
  { id: 2, name: "Dusting", area: "Kitchen", weight: 3, freq: "weekly" },
  { id: 3, name: "Coffee table", area: "Living Room", weight: 1, freq: "weekly" },
  { id: 4, name: "Side tables", area: "Living Room", weight: 1, freq: "weekly" },
  { id: 5, name: "Dining room table", area: "Living Room", weight: 1, freq: "weekly" },
  { id: 6, name: "Wipe counters", area: "Kitchen", weight: 2, freq: "weekly" },
  { id: 7, name: "Clean sink", area: "Kitchen", weight: 2, freq: "weekly" },
  { id: 8, name: "Organizing fridge", area: "Kitchen", weight: 2, freq: "every_2_weeks" },
  { id: 9, name: "Wipe washer & dryer", area: "Laundry Room", weight: 2, freq: "weekly" },
  { id: 10, name: "Clean cat food bowls", area: "Laundry Room", weight: 1, freq: "daily" },
  { id: 11, name: "Sweep stairs", area: "Stairs", weight: 3, freq: "weekly" },
  { id: 12, name: "Clean windows", area: "All Rooms", weight: 5, freq: "monthly" },
  { id: 13, name: "Wipe doors", area: "All Rooms", weight: 3, freq: "monthly" },
  { id: 14, name: "Wipe down trash can", area: "Laundry", weight: 2, freq: "every_2_weeks" },
  { id: 15, name: "Deep clean fridge", area: "Kitchen", weight: 4, freq: "monthly" },
  { id: 16, name: "Organizing cabinets", area: "Kitchen", weight: 3, freq: "monthly" },
  { id: 17, name: "Downstairs bathroom", area: "Bathroom", weight: 4, freq: "weekly" },
  { id: 18, name: "Clean cat room floor", area: "Laundry / Cat Area", weight: 3, freq: "weekly" },
  { id: 19, name: "Clean dishwasher gasket", area: "Kitchen", weight: 2, freq: "monthly" },
  { id: 20, name: "Clean dishwasher drain", area: "Kitchen", weight: 3, freq: "monthly" },
  { id: 21, name: "Change Filter", area: "Upstairs", weight: 3, freq: "quarterly" },
  { id: 22, name: "Clean baseboards", area: "All Rooms", weight: 4, freq: "quarterly" },
  { id: 23, name: "Wash curtains", area: "Living Room", weight: 4, freq: "quarterly" },
  { id: 24, name: "Vacuum Living Room", area: "Living Room", weight: 3, freq: "weekly" },
  { id: 25, name: "Vacuum Bedrooms", area: "Upstairs", weight: 3, freq: "weekly" },
  { id: 26, name: "Vacuum Stairs", area: "Stairs", weight: 3, freq: "weekly" },
  { id: 27, name: "Mop Kitchen", area: "Kitchen", weight: 3, freq: "weekly" },
  { id: 28, name: "Litter Box", area: "Laundry / Cat Area", weight: 2, freq: "daily" },
  { id: 29, name: "Clean Microwave", area: "Kitchen", weight: 2, freq: "monthly" },
  { id: 30, name: "Clean Oven", area: "Kitchen", weight: 4, freq: "monthly" },
  { id: 31, name: "Dust Shelves", area: "Living Room", weight: 2, freq: "weekly" },
  { id: 32, name: "Water Plants", area: "Living Room", weight: 1, freq: "weekly" },
  { id: 33, name: "Empty Trash Cans", area: "All Rooms", weight: 2, freq: "weekly" },
  { id: 34, name: "Vacuum Couch", area: "Living Room", weight: 3, freq: "every_2_weeks" },
  { id: 35, name: "Polish Furniture", area: "Living Room", weight: 2, freq: "monthly" },
  { id: 36, name: "Clean Shower", area: "Bathroom", weight: 4, freq: "weekly" },
  { id: 37, name: "Scrub Toilet", area: "Bathroom", weight: 4, freq: "weekly" },
  { id: 38, name: "Clean Bathroom Mirror", area: "Bathroom", weight: 2, freq: "weekly" },
  { id: 39, name: "Wipe Light Switches", area: "All Rooms", weight: 2, freq: "monthly" },
  { id: 40, name: "Dust Ceiling Fans", area: "All Rooms", weight: 3, freq: "every_2_weeks" },
  { id: 41, name: "Clean Garage Floor", area: "Laundry", weight: 4, freq: "monthly" },
  { id: 42, name: "Sweep Porch", area: "All Rooms", weight: 2, freq: "weekly" },
  { id: 43, name: "Clean Windowsills", area: "All Rooms", weight: 2, freq: "every_2_weeks" },
  { id: 44, name: "Wash Bedding", area: "Upstairs", weight: 3, freq: "weekly" },
  { id: 45, name: "Flip Mattress", area: "Upstairs", weight: 3, freq: "quarterly" },
  { id: 46, name: "Clean Fridge Shelves", area: "Kitchen", weight: 3, freq: "monthly" },
  { id: 47, name: "Organize Pantry", area: "Kitchen", weight: 3, freq: "every_2_weeks" },
  { id: 48, name: "Clean Coffee Maker", area: "Kitchen", weight: 2, freq: "monthly" },
  { id: 49, name: "Vacuum Hallway", area: "Upstairs", weight: 2, freq: "weekly" },
  { id: 50, name: "Mop Entryway", area: "All Rooms", weight: 2, freq: "weekly" },
];

// --- rest of your full App.tsx logic (unchanged from your working version) ---
