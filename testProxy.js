import fetch from "node-fetch";

async function run() {
  const res = await fetch("https://api.allorigins.win/raw?url=" + encodeURIComponent("https://api.hackertarget.com/hostsearch/?q=google.com"));
  const text = await res.text();
  console.log("HT Length:", text.length);
}
run();
