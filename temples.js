const regionalTemples = [
  {
    name: "Shree Digambar Jinalaya",
    tradition: "Digambar",
    address: "598, HUDA Layout, Nallagandla, DSR Park Ridge Lane, near Nakshatra Apartments, Hyderabad - 500019",
    phone: "+91 92815 06415 / +91 92815 06417",
    website: "index.html",
    map: "https://maps.app.goo.gl/ytVmadofco5y6Ap6A",
    image: "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlwDnqyOTQDX0kVTGzX_aIXfG6OY2T8T0FYPsEbbF25XofcslHua814-S-F8qZG2IkbYrZnBzazbYR7w-Gdf86JlGHUDmaJvvPlZdN91mNS8iAwsR07fSPKzOrNmvK2WRUkpevaF0vZQBGw=w800-h600-k-no"
  },
  { name: "Digambar Jain Temple, Aghapura", tradition: "Digambar", address: "Aghapura, Hyderabad", website: "https://jainstavan.in/temple/shri-1008-chandraprabhu-digambar-jain-mandir-aghapura-hyderabad-telangana", image: "https://lh5.googleusercontent.com/p/AF1QipNMD_MEVt9vl8oUjuqFsXaPWiWmKAgP4ma27YeC=w1080-k-no" },
  { name: "Bhagwan Shree Simandhar Swamy Digamber Jain Mandir", tradition: "Digambar", address: "Ramkote, Hyderabad", website: "https://jainstavan.in/temple/bhagwan-shree-simandhar-swamy-digamber-jain-mandir-ramkote-hyderabad-telangana", image: "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWnlc6-fOY1VZ_ySS2pPHT2eVnnBIPlsuJ6bsXBaJnJ_vUUcC0GC5R0mbGATtgziIDS0HSLXda7h_Ozyon9V87Z2U-9UZeFx64mxyF5cKOWqXdjgA-JXrS3RKLLDx5Igw_sRNTf21g=w529-h298-k-no" },
  { name: "Shri Parshvnath Digamber Jain Mandir and Gurukul", tradition: "Digambar", address: "Maharaj Gunj, Hyderabad", website: "https://jainstavan.in/temple/shri-parshvnath-digamber-jain-mandir-and-gurukul-maharaj-gunj-hyderabad-telangana", image: "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkwfuqWCLnFysTKPG75iGy4u7PnXwPTTN-z3bcFo1aRyJEwClb0irfGZaLwqlIoHQT-Qnj5sCeDMFMLQ6bymqjSEVM_5T1x4u1tpXfrs-fno5AhwQsdBPtkscC65A7Czx6t7g5qQA=w408-h544-k-no" },
  { name: "Shri 1008 Parshvnath Digamber Jain Mandir", tradition: "Digambar", address: "Begum Bazar, Hyderabad", website: "https://jainstavan.in/temple/shri-1008-parshvnath-digamber-jain-mandir-begum-bazar-hyderabad-telangana", image: "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkXXlJP-st9NdQLFOcIR9h44TQyIdP3Nmf4zy-tiBN8G6AZXeJZ4wcQfeQNtipYQvZ8wPHJgZogG0YIkkCu2u9jOvG9zx7-ufoxpkWFVPufJFqjN1pISuNepl8jDTBu82s0VDRz=w408-h544-k-no" },
  { name: "Shri 1008 Bhagwan Mahaveer Digamber Jain Mandir", tradition: "Digambar", address: "Osmanpura Colony, Azampura, Chaderghat, Hyderabad", website: "https://jainstavan.in/temple/shri-1008-bhagwan-mahaveer-digamber-jain-mandir-osmanpura-colony-azampura-chaderghat-hyderabad-telan", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Digambar_Jain_Temple,_Chadarghat,_Hyderabad.jpg?width=900" },
  { name: "Sarovar Jinalaya, Digambar Jain Center of HiTech City", tradition: "Digambar", address: "Vishali Nagar, Madinaguda, Hyderabad", website: "https://jainstavan.in/temple/sarovar-jinalaya-digambar-jain-center-of-hitech-city-hyderabad-vishali-nagar-madinaguda-hyderabad-te", image: "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkuC2SdXZgAMlSoVcV8iGa9UVe3GSOUv28lp4q2IcZnDCf_leK-1yT23RC_3GwLSwI6ko8-w3VDjwfFmIwLbZ9VOhSTtxf9SFNyLkp-21bBM_2OjEU4pUQy9IwB032w4V9DQSwoWRCdTnK3=w408-h306-k-no" },
  { name: "Shri 1008 Parshvnath Digamber Jain Mandir", tradition: "Digambar", address: "33, DV Colony Road, Krishna Nagar Colony, Ramgopalpet, Secunderabad", website: "https://jainstavan.in/temple/shri-1008-parshvnath-digamber-jain-mandir-33-dv-colony-road-krishna-nagar-colony-ramgopalpet-secunde", image: "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWnBAknXBiXNr3lmJR0L66wY7RXvCMtEWFBYe54__Nw88bBNDXNJRp1FlAcRf0nOBL7E5TJIwt7Y-h9aqEG7GFQassDOk5t13mSdEO8e_aZvke65qCzDt2sZYATxzg19nj0XYPS7QA=w408-h906-k-no" },
  { name: "Shri Digamber Jain Mandir", tradition: "Digambar", address: "Arjun Nagar, Rasoolpura, Secunderabad", website: "https://jainstavan.in/temple/shri-digamber-jain-mandir-arjun-nagar-rasoolpura-secunderabad-hyderabad-telangana", image: "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmqJzXxTuMAsA6WRSHBCo1oH9gWBPTmaVLJapQ7ojphtnFVCODH4GPkJrWpw9PBM32oVXr3Mv0_tc3gma8OP0KgcZN7UEd9p2jRgoccv59ZB5O-0IfOKlR8Mfa8VFVzV-pS099C=w800-h600-k-no" },
  { name: "Shri 1008 Vighnahar Parshwanath Digambar Jain Atishay Kshetra", tradition: "Digambar", address: "Kulcharam, Medak District, Telangana", image: "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWnCgcQD4tojar-9BJyTfe3fOUqxCIm3y-1aCGjBjxTpwGjRF_7cGsJ4qnCAvAdTn4k42JchWFu-PnuVAglkKEFx8CDPBCeDy-OpIlhpfYO6yi9g0-mql53AZ760ubXOD-tevQKV=w408-h544-k-no" },
  { name: "Shri Neminath Digamber Jain Mandir", tradition: "Digambar", address: "Shivaji Road, Jogipet, Sangareddy District, Telangana", image: "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkxJC3sGvpyQ8OEGf96PSt5vJUNIrECGxcMRsdG4fu2N5oYu3ccv33evua8QAZiyMqJEv7XMw-oB0PbJfPI2PRK3M2dvzaeQEfDld_Z9eWiPzZ0cYc_jajpYf34HbZjQsh98lI=w800-h1067-k-no" },
  { name: "Shri Digamber Jain Chaitalaya", tradition: "Digambar", address: "Rabindranath Tagore Road, Sherpura, Warangal, Telangana", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Jain_temple_warangal.jpg?width=900" },
  { name: "Shri 1008 Chandraprabhu Digamber Jain Mandir", tradition: "Digambar", address: "Shahgunj, Bidar, Karnataka", phone: "098862 85650", image: "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmuRkDrZMlKQBYI6JCljdaQCdFU6mQyiUxiB8kURV79KIq2oOyVDk73dMv_cAqaJiyCNVYtvYg6SR4yt4uu6cTCgEQE3mLZF8O9B6j6ngzXMnwvL6grLBgmPTLNOaFq_cN5RKgS=w408-h544-k-no" },
  { name: "Shri 1008 Parshvnath Bhagwan Digamber Jain Mandir", tradition: "Digambar", address: "Kamthana, Bidar District, Karnataka", image: "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmsii7tFQTKHgHLT4XrN5MnC5ylvmbZJuVhimVB4VzYYu1jsMT3zrPc6JVf62ZNenDvmEvWlPzHYXH56zYkHHWMUA0nKRdXXB-lS5qkQwqw6-eKXMyigOFQxfdprgvAsJu-lQYLETXOAZn0=w408-h725-k-no" },
  { name: "Shri 1008 Shantinath Bhagwan Digamber Jain Mandir", tradition: "Digambar", address: "Humnabad, Bidar District, Karnataka", image: "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWnUw6vUR0-cqPYuAsFu-MgdA_6UufY6chh36QS0Mnhe9eLgxn7mOlXa-u1Hdra91Qd6o_Ts8QzzTdR35qNNVjxhBpE2DCpq5Yi3JmJEtU7rDc2qJnVV15cgKOanBlWTsDhLz19eeg=w408-h724-k-no" },
  { name: "Shri 1008 Kalikund Parshwanath Digambar Jain Atishey Kshetra", tradition: "Digambar", address: "Hathnoora, Telangana 502296", image: "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlXOb0qpcmBE1YhdUB9Pl-87PwVoXJ9ZqoMzFFGZm5TnsqiWvEt2pKNpLTxoUHvdkRjXK6GX7IoYE0YIzRZcJ9vBNqG49i__jVm6-YGKdeO3B2YhroCHeD8QNbGFeWvFhCn3SoH5Q=w408-h724-k-no" },
  { name: "Karwan Jain Mandir", tradition: "Digambar", address: "Nagaraju Maydam, Subji Mandi, Karwan, Hyderabad, Telangana 500006", image: "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmlkWWUKQ0UYFBfE1gBIXF6NtmDTruyXJu_LN4Tb_RHJtNB9ru_twa671wuEAUyCgkePOAfxfZInqw-pa9dSgpZB3QM3AIiWhDF999QGYhrvZVQ5_w9AMAfP5ClxuWuntaluxnGdMYMdXY1=w529-h298-k-no" }
];

const directory = document.querySelector("#temple-directory");
const searchInput = document.querySelector("#temple-search");
const count = document.querySelector("#temple-count");
const emptyState = document.querySelector("#directory-empty");
const fallbackTempleImage = "https://placehold.co/800x450/CFB290/1a1a1a?text=Jain+Temple";

const createMapUrl = (temple) => temple.map || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${temple.name}, ${temple.address}`)}`;

const getTempleImageSources = (temple) => [...new Set([
  temple.image,
  fallbackTempleImage
].filter(Boolean))];

const loadTempleImage = (image, temple) => {
  const sources = getTempleImageSources(temple);
  const loadNextSource = () => {
    const nextSource = sources.shift();
    if (nextSource) image.src = nextSource;
  };
  image.addEventListener("error", loadNextSource);
  loadNextSource();
};

function renderTemples(temples) {
  directory.innerHTML = temples.map((temple, index) => {
    const phone = temple.phone
      ? temple.phone.split(" / ").map((number) => `<a href="tel:${number.replace(/[^+\d]/g, "")}">${number}</a>`).join("")
      : "Not available";

    return `<article class="temple-directory-card reveal" style="--reveal-delay: ${Math.min(index, 8) * 45}ms">
      <div class="temple-card-heading">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <!--<p>${temple.tradition}</p>-->
      </div>
      <h3>${temple.name}</h3>
      <div class="temple-card-details">
        <address>
          <strong>Address</strong>
          <span>${temple.address}</span>
          <strong>Contact</strong>
          <span>${phone}</span>
        </address>
        <img class="temple-card-image" alt="${temple.name}" loading="lazy" width="180" height="101">
      </div>
      <div class="temple-card-actions">
        <a class="button button-primary" href="${createMapUrl(temple)}" target="_blank" rel="noopener noreferrer">Location</a>
      </div>
    </article>`;
  }).join("");

  count.textContent = `${temples.length} ${temples.length === 1 ? "place" : "places"}`;
  emptyState.hidden = temples.length !== 0;
  document.querySelectorAll(".temple-card-image").forEach((image, index) => loadTempleImage(image, temples[index]));
  document.querySelectorAll(".temple-directory-card.reveal").forEach((card) => card.classList.add("is-visible"));
}

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLocaleLowerCase("en-IN");
  const matches = regionalTemples.filter((temple) =>
    `${temple.name} ${temple.address} ${temple.tradition}`.toLocaleLowerCase("en-IN").includes(query)
  );
  renderTemples(matches);
});

renderTemples(regionalTemples);
