let socket;

function updateClock() {
const timeString = new Date().toLocaleTimeString("en-US", { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" });
const clockElement = document.getElementById("time-clock");
if (clockElement) {
clockElement.textContent = timeString;
}
}

setInterval(updateClock, 1000);
updateClock();

const softwareItems = [
{ url: "https://heroicgameslauncher.com/", logo: "heroic_logo.webp", name: "Heroic", desc: "Alternative open-source epic games launcher" },
{ url: "https://fmhy.net/", logo: "fmhy_logo.webp", name: "FMHY", desc: "The largest collection of free stuff on the internet!" },
{ url: "https://xprime.su/", logo: "xprime_logo.webp", name: "Xprime", desc: "Watch your favorite shows and movies for free!" },
{ url: "https://cherax.menu/", logo: "cherax_logo.webp", name: "Cherax", desc: "Powerful GTA V mod menu since 2019" },
{ url: "https://vencord.dev", logo: "vencord_logo.webp", name: "Vencord", desc: "Discord client modification." },
{ url: "https://massgrave.dev", logo: "massgrave_logo.webp", name: "Massgrave", desc: "Open-source Windows activator." }
];

function updateScrollWidth() {
const track = document.getElementById("software-track");
if (track) {
const gap = 24; 
const scrollWidth = (track.scrollWidth / 2) + (gap / 2);
track.style.setProperty("--scroll-end", `-${scrollWidth}px`);
}
}

function initSoftwareTrack() {
const track = document.getElementById("software-track");
if (!track) return;

const cardsHtml = softwareItems.map(item => `
<a href="${item.url}" target="_blank" rel="noopener" class="interactive-element rounded-xl software-card" style="padding:1.25rem; gap:0.75rem">
<div class="flex items-center" style="gap:1rem">
<img src="./assets/images/${item.logo}" width="40" height="40" style="width:2.2rem; height:auto; border-radius:8px" alt="${item.name}">
<span style="font-weight:700">${item.name}</span>
</div>
<p style="font-size:0.8rem; color:#d1d5db; margin:0">${item.desc}</p>
</a>
`).join("");

track.innerHTML = cardsHtml + cardsHtml;
updateScrollWidth();
track.style.animation = "scrollAnim 40s linear infinite";
}

function toggleSocials() {
const overlay = document.getElementById("socials-overlay");
overlay.classList.toggle("active");
document.body.style.overflow = overlay.classList.contains("active") ? "hidden" : "auto";
history.replaceState(null, null, window.location.pathname);
}

function updateStatusUI(data) {
const colors = { online: "#22c55e", idle: "#eab308", dnd: "#ef4444", offline: "#64748b" };
const dot = document.getElementById("status-dot");
const text = document.getElementById("status-text");

if (!data) return;

let currentStatus = data.discord_status || "offline";
let statusText = currentStatus;

if (statusText === "dnd") {
statusText = "Do Not Disturb";
}

if (data.listening_to_spotify) {
statusText = "Listening to Spotify";
} else if (data.activities && data.activities.length > 0) {
const activity = data.activities.find(act => act.type === 0);
if (activity) {
statusText = `Playing ${activity.name}`;
}
}

if (dot) dot.style.backgroundColor = colors[currentStatus] || colors.offline;
if (text) text.textContent = `Status: ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`;
}

function connectLanyard() {
if (socket) return;

socket = new WebSocket("wss://api.lanyard.rest/socket");

socket.onmessage = event => {
const message = JSON.parse(event.data);

if (message.op === 1) { 
socket.send(JSON.stringify({ op: 3 }));
socket.send(JSON.stringify({ op: 2, d: { subscribe_to_id: "1483670658977370415" } }));
setInterval(() => {
if (socket && socket.readyState === 1) {
socket.send(JSON.stringify({ op: 3 }));
}
}, message.d.heartbeat_interval);
}

if (message.t === "INIT_STATE" || message.t === "PRESENCE_UPDATE") {
updateStatusUI(message.d);
}
};

socket.onclose = () => {
socket = null;
setTimeout(connectLanyard, 5000);
};
}

window.addEventListener("load", () => {
initSoftwareTrack();
connectLanyard();
document.body.classList.add("loaded");

const observer = new IntersectionObserver(entries => {
entries.forEach(entry => {
if (entry.isIntersecting) {
entry.target.classList.add("active");
observer.unobserve(entry.target);
}
});
}, { threshold: 0.1 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

document.querySelectorAll(".js-social-toggle").forEach(btn => {
btn.onclick = (e) => {
e.preventDefault();
toggleSocials();
}
});

document.querySelectorAll(".js-scroll").forEach(btn => {
btn.onclick = (e) => {
e.preventDefault();
const targetId = btn.getAttribute("href").substring(1);
const targetEl = document.getElementById(targetId);
if (targetEl) {
targetEl.scrollIntoView({ behavior: "smooth" });
history.replaceState(null, null, window.location.pathname);
}
}
});

const homeBtn = document.querySelector(".js-home");
if (homeBtn) {
homeBtn.onclick = (e) => {
e.preventDefault();
window.scrollTo({ top: 0, behavior: "smooth" });
history.replaceState(null, null, window.location.pathname);
};
}
});

window.addEventListener("resize", updateScrollWidth);

window.addEventListener("pagehide", () => { 
if (socket) { 
socket.close(); 
socket = null; 
} 
});

window.addEventListener("pageshow", (e) => { 
if (e.persisted) {
connectLanyard(); 
}
});