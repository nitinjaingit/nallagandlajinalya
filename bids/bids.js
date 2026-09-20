(() => {
	const bidList = document.querySelector("#bid-list");
	const dateInput = document.querySelector("#bid-date");
	const clearDateButton = document.querySelector("#clear-date");
	const typeButtons = [...document.querySelectorAll("[data-type]")];
	const menuButton = document.querySelector(".menu-button");
	const navigation = document.querySelector("#primary-nav");
	const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
	const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
	const monthFormat = new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" });
	const timeFormat = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" });
	let records = [];
	let selectedType = "All";

	const escapeHtml = (value) => String(value ?? "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");

	const parseCsv = (text) => {
		const rows = [];
		let row = [];
		let value = "";
		let quoted = false;

		for (let index = 0; index < text.length; index += 1) {
			const character = text[index];
			if (character === '"' && quoted && text[index + 1] === '"') {
				value += '"';
				index += 1;
			} else if (character === '"') {
				quoted = !quoted;
			} else if (character === "," && !quoted) {
				row.push(value.trim());
				value = "";
			} else if ((character === "\n" || character === "\r") && !quoted) {
				if (character === "\r" && text[index + 1] === "\n") index += 1;
				row.push(value.trim());
				if (row.some(Boolean)) rows.push(row);
				row = [];
				value = "";
			} else {
				value += character;
			}
		}

		if (value || row.length) {
			row.push(value.trim());
			if (row.some(Boolean)) rows.push(row);
		}

		const [headers, ...data] = rows;
		return data.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])));
	};

	const localDate = (value) => new Date(`${value}T00:00:00`);
	const localDateKey = (value = new Date()) => {
		const year = value.getFullYear();
		const month = String(value.getMonth() + 1).padStart(2, "0");
		const day = String(value.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	const render = () => {
		const selectedDate = dateInput.value;
		const filtered = records.filter(({ master }) =>
			(selectedType === "All" || master.BidType === selectedType)
			&& (!selectedDate || (selectedDate >= master.StartDate && selectedDate <= master.EndDate))
		);

		document.querySelector("#schedule-count").textContent = filtered.length;
		document.querySelector("#today-count").textContent = filtered.filter(({ master }) => localDateKey() >= master.StartDate && localDateKey() <= master.EndDate).length;
		document.querySelector("#capacity-count").textContent = filtered.reduce((total, { master }) => total + Number(master.WinnerCapacity || 0), 0);

		if (!filtered.length) {
			bidList.innerHTML = '<p class="bid-message">No bids match the selected filters.</p>';
			return;
		}

		bidList.innerHTML = filtered.map(({ master, occurrences }) => {
			const startDate = localDate(master.StartDate);
			const endDate = localDate(master.EndDate);
			const singleDate = master.StartDate === master.EndDate;
			const nextOccurrence = occurrences.find(({ BidDate }) => BidDate >= localDateKey()) || occurrences.at(-1);
			const status = nextOccurrence?.Status || master.Status;
			const dateLabel = singleDate
				? dateFormat.format(startDate)
				: `${dateFormat.format(startDate)}–${dateFormat.format(endDate)}`;
			const occurrenceWindow = nextOccurrence?.OpenAt && nextOccurrence?.CloseAt
				? `${timeFormat.format(new Date(nextOccurrence.OpenAt))}–${timeFormat.format(new Date(nextOccurrence.CloseAt))}`
				: "To be announced";
			return `
				<article class="bid-row">
					<time class="bid-date" datetime="${escapeHtml(master.StartDate)}">
						<strong>${startDate.getDate()}</strong><span>${escapeHtml(monthFormat.format(startDate))}</span>
					</time>
					<div class="bid-copy">
						<div class="bid-badges">
							<span class="bid-badge">${escapeHtml(master.BidType)}</span>
							<span class="bid-badge" data-status="${escapeHtml(status)}">${escapeHtml(status)}</span>
						</div>
						<h3>${escapeHtml(master.BidName)}</h3>
						<p>${escapeHtml(master.Description)}</p>
					</div>
					<div class="bid-details">
						<div><span>${singleDate ? "Date" : "Date range"}</span><strong>${escapeHtml(dateLabel)}</strong></div>
						<div><span>Bid window</span><strong>${escapeHtml(occurrenceWindow)}</strong></div>
						<div><span>Starting amount</span><strong>${escapeHtml(currency.format(Number(master.StartingAmountINR)))}</strong></div>
						<div><span>Capacity</span><strong>${escapeHtml(master.WinnerCapacity)} ${Number(master.WinnerCapacity) === 1 ? "participant" : "participants"}</strong></div>
						<div><span>Bid reference</span><strong>${escapeHtml(master.BidMasterID)}</strong></div>
					</div>
				</article>`;
		}).join("");
	};

	typeButtons.forEach((button) => button.addEventListener("click", () => {
		selectedType = button.dataset.type;
		typeButtons.forEach((item) => {
			const selected = item === button;
			item.classList.toggle("is-selected", selected);
			item.setAttribute("aria-pressed", String(selected));
		});
		render();
	}));

	dateInput.addEventListener("change", () => {
		clearDateButton.hidden = !dateInput.value;
		render();
	});
	clearDateButton.addEventListener("click", () => {
		dateInput.value = "";
		clearDateButton.hidden = true;
		render();
	});

	menuButton.addEventListener("click", () => {
		const open = menuButton.getAttribute("aria-expanded") === "true";
		menuButton.setAttribute("aria-expanded", String(!open));
		navigation.classList.toggle("is-open", !open);
	});

	Promise.all([
		fetch("bid-master.csv").then((response) => {
			if (!response.ok) throw new Error("Bid master data could not be loaded.");
			return response.text();
		}),
		fetch("bid-occurrence.csv").then((response) => {
			if (!response.ok) throw new Error("Bid occurrence data could not be loaded.");
			return response.text();
		})
	]).then(([masterText, occurrenceText]) => {
		const masters = parseCsv(masterText).filter((master) => master.IsActive === "Yes" && master.Status === "Published");
		const occurrencesByMaster = new Map();
		parseCsv(occurrenceText).forEach((occurrence) => {
			const occurrences = occurrencesByMaster.get(occurrence.BidMasterID) || [];
			occurrences.push(occurrence);
			occurrencesByMaster.set(occurrence.BidMasterID, occurrences);
		});
		records = masters
			.map((master) => ({
				master,
				occurrences: (occurrencesByMaster.get(master.BidMasterID) || []).sort((left, right) => left.BidDate.localeCompare(right.BidDate))
			}))
			.sort((left, right) => left.master.StartDate.localeCompare(right.master.StartDate) || Number(left.master.DisplayOrder) - Number(right.master.DisplayOrder));
		render();
	}).catch(() => {
		bidList.innerHTML = '<p class="bid-message" data-kind="error">Bid schedules could not be loaded. Please open this page through the website server.</p>';
		document.querySelector("#schedule-count").textContent = "—";
		document.querySelector("#today-count").textContent = "—";
		document.querySelector("#capacity-count").textContent = "—";
	});
})();