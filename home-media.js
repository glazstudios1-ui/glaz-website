// =========================================================
// Glaz Studios — what the home page shows.
// Change this file only: add your photos, films and links here.
// Photos go in the "media" folder on GitHub (see the paths below).
// =========================================================

// The film at the top of the page: 8–12 seconds, NO sound, under ~8 MB.
// The poster is the photo people see while the film loads (and on phones in low-power mode).
export const HERO = {
  video: 'media/hero.mp4',
  poster: 'media/hero.jpg',
};

// Weddings shown under "Recent weddings". The first one is shown biggest.
// cover = the photo on the page. photos = what opens when someone clicks it.
// Photos: JPG, about 2000 px on the long side, under 600 KB each.
export const WEDDINGS = [
  { names: 'Couple one', place: 'Cairo', year: 2026, cover: 'media/w1/cover.jpg', photos: ['media/w1/1.jpg', 'media/w1/2.jpg', 'media/w1/3.jpg', 'media/w1/4.jpg', 'media/w1/5.jpg', 'media/w1/6.jpg'] },
  { names: 'Couple two', place: 'Sahel', year: 2025, cover: 'media/w2/cover.jpg', photos: ['media/w2/1.jpg', 'media/w2/2.jpg', 'media/w2/3.jpg', 'media/w2/4.jpg'] },
  { names: 'Couple three', place: 'Giza', year: 2025, cover: 'media/w3/cover.jpg', photos: ['media/w3/1.jpg', 'media/w3/2.jpg', 'media/w3/3.jpg', 'media/w3/4.jpg'] },
  { names: 'Couple four', place: 'El Gouna', year: 2025, cover: 'media/w4/cover.jpg', photos: ['media/w4/1.jpg', 'media/w4/2.jpg', 'media/w4/3.jpg', 'media/w4/4.jpg'] },
  { names: 'Couple five', place: 'Cairo', year: 2024, cover: 'media/w5/cover.jpg', photos: ['media/w5/1.jpg', 'media/w5/2.jpg', 'media/w5/3.jpg', 'media/w5/4.jpg'] },
  { names: 'Couple six', place: 'Alexandria', year: 2024, cover: 'media/w6/cover.jpg', photos: ['media/w6/1.jpg', 'media/w6/2.jpg', 'media/w6/3.jpg', 'media/w6/4.jpg'] },
];

// Films: upload them to YouTube (can be "Unlisted") and paste the video ID
// (the letters after "v=" in the link, e.g. youtube.com/watch?v=AbC123xyz → 'AbC123xyz').
// The first film is shown big.
export const FILMS = [
  { title: 'Highlight film', couple: 'Couple one', youtube: '', poster: 'media/film1.jpg' },
  { title: 'Highlight film', couple: 'Couple two', youtube: '', poster: 'media/film2.jpg' },
  { title: 'Highlight film', couple: 'Couple three', youtube: '', poster: 'media/film3.jpg' },
];

// The photo next to "For planners, venues and hotels" (a wide venue / decor shot works best).
export const PLANNERS_PHOTO = 'media/planners.jpg';

// What couples said. Only real words from real clients, with their permission.
// Leave the list empty and this part of the page stays hidden.
export const KIND_WORDS = [
  // { text: 'Write what they said here.', who: 'Sara & Omar', when: 'June 2026' },
];

// Links in the menu and at the bottom of the page. Leave '' to hide.
export const LINKS = {
  instagram: '',   // e.g. 'https://instagram.com/glazstudios'
  email: 'info@glazstudios.com',
};
