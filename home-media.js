// =========================================================
// Glaz Studios — what the home page shows.
// Change this file only: photos, films and links all live here.
// Photos go in the "media" folder on GitHub.
// Size: about 1600 px on the long side, under 400 KB each.
//
// ⚠️ The photos in media/temp are TEMPORARY stand-ins for the design.
//    Replace every one of them with your own work before launch.
// =========================================================

// The printed photos on top of the page (5 photos). The first one is the biggest.
// To make the big one a moving film later: add  video: 'media/hero.mp4'  (8–12 s, no sound, under 8 MB).
export const HERO_PRINTS = [
  { src: 'media/temp/17.jpg', alt: 'The couple holding each other in the garden' },
  { src: 'media/temp/18.jpg', alt: 'The bride looking back over her shoulder' },
  { src: 'media/temp/16.jpg', alt: 'The bride lifting her dress, laughing with friends' },
  { src: 'media/temp/04.jpg', alt: 'Mother and sister helping the bride into her dress' },
  { src: 'media/temp/19.jpg', alt: 'A long candlelit dinner table' },
];

// One wedding day, told in chapters. Each photo: src, alt, and shape: 'wide' or 'tall'.
export const DAY = [
  { title: 'Getting ready', line: 'Mum’s hands, the dress, the nerves and the laughing.', photos: [
    { src: 'media/temp/04.jpg', alt: 'Mother and sister fastening the dress', shape: 'wide' },
    { src: 'media/temp/03.jpg', alt: 'Hands fastening a necklace', shape: 'wide' },
    { src: 'media/temp/02.jpg', alt: 'The bride in the mirror', shape: 'wide' },
  ] },
  { title: 'The first look', line: 'The people who see you first, and their faces when they do.', photos: [
    { src: 'media/temp/06.jpg', alt: 'Her father clapping when he sees her', shape: 'wide' },
    { src: 'media/temp/07.jpg', alt: 'Bridesmaids reacting', shape: 'wide' },
    { src: 'media/temp/05.jpg', alt: 'The groom seeing her for the first time', shape: 'wide' },
  ] },
  { title: 'I do', line: 'Every face in the front row.', photos: [
    { src: 'media/temp/14.jpg', alt: 'Her father giving her away', shape: 'wide' },
    { src: 'media/temp/08.jpg', alt: 'The ceremony in the garden', shape: 'tall' },
    { src: 'media/temp/09.jpg', alt: 'Flowers along the guests’ chairs', shape: 'tall' },
  ] },
  { title: 'The celebration', line: 'Hands in the air, dress in hand.', photos: [
    { src: 'media/temp/15.jpg', alt: 'The couple celebrating after the ceremony', shape: 'wide' },
    { src: 'media/temp/16.jpg', alt: 'The bride running with friends', shape: 'wide' },
    { src: 'media/temp/10.jpg', alt: 'The groom and his friends toasting', shape: 'wide' },
  ] },
  { title: 'Just the two of you', line: 'Ten quiet minutes, away from everyone.', photos: [
    { src: 'media/temp/17.jpg', alt: 'The couple in the garden', shape: 'wide' },
    { src: 'media/temp/18.jpg', alt: 'Portrait of the bride', shape: 'tall' },
    { src: 'media/temp/11.jpg', alt: 'The bride by the window', shape: 'tall' },
  ] },
  { title: 'Dinner by candlelight', line: 'Toasts, stories and the last candle on the table.', photos: [
    { src: 'media/temp/19.jpg', alt: 'The candlelit dinner table', shape: 'wide' },
  ] },
];

// Films: upload to YouTube (can be "Unlisted") and paste the video ID
// (youtube.com/watch?v=AbC123xyz → 'AbC123xyz'). The first film is shown big.
export const FILMS = [
  { title: 'Highlight film', couple: 'Coming soon', youtube: '', poster: 'media/temp/15.jpg' },
  { title: 'Highlight film', couple: 'Coming soon', youtube: '', poster: 'media/temp/13.jpg' },
  { title: 'Highlight film', couple: 'Coming soon', youtube: '', poster: 'media/temp/05.jpg' },
];

// Next to "For planners, venues and hotels" (a venue or decor photo works best)
export const PLANNERS_PHOTO = 'media/temp/08.jpg';

// Behind "Your date is the one thing we can't move" (a wide, happy photo)
export const CLOSING_PHOTO = 'media/temp/15.jpg';

// What couples said. Only real words from real clients, with their permission.
// Leave the list empty and this part stays hidden.
export const KIND_WORDS = [
  // { text: 'Write what they said here.', who: 'Sara & Omar', when: 'June 2026' },
];

// Links in the menu and at the bottom. Leave '' to hide.
export const LINKS = {
  instagram: '',   // e.g. 'https://instagram.com/glazstudios'
  email: 'info@glazstudios.com',
};
