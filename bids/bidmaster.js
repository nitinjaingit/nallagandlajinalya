(() => {
	const headers = ["BidMasterID", "BidName", "BidType", "StartDate", "EndDate", "StartingAmountINR", "WinnerCapacity", "DisplayOrder", "IsActive", "Status", "Description"];
	const labels = ["ID", "Bid name", "Type", "Start date", "End date", "Starting amount", "Capacity", "Order", "Active", "Status", "Description"];
	const tableHead = document.querySelector("#master-head");
	const tableBody = document.querySelector("#master-body");
	const recordCount = document.querySelector("#record-count");
	const dialog = document.querySelector("#bid-dialog");
	const form = document.querySelector("#bid-form");
	const submitButton = form.querySelector('[type="submit"]');
	const formEyebrow = document.querySelector("#form-eyebrow");
	const formHeading = document.querySelector("#form-heading");
	const typeSelect = document.querySelector("#bid-type");
	const startDate = document.querySelector("#start-date");
	const endDate = document.querySelector("#end-date");
	const formError = document.querySelector("#form-error");
	const menuButton = document.querySelector(".menu-button");
	const navigation = document.querySelector("#primary-nav");
	const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
	const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
	let records = [];
	let editingId = null;

	const escapeHtml = (value) => String(value ?? "")
		.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;").replaceAll("'", "&#039;");

	const parseCsv = (text) => {
		const rows = [];
		let row = [];
		let value = "";
		let quoted = false;
		for (let index = 0; index < text.length; index += 1) {
			const character = text[index];
			if (character === '"' && quoted && text[index + 1] === '"') { value += '"'; index += 1; }
			else if (character === '"') quoted = !quoted;
			else if (character === "," && !quoted) { row.push(value.trim()); value = ""; }
			else if ((character === "\n" || character === "\r") && !quoted) {
				if (character === "\r" && text[index + 1] === "\n") index += 1;
				row.push(value.trim());
				if (row.some(Boolean)) rows.push(row);
				row = []; value = "";
			} else value += character;
		}
		if (value || row.length) { row.push(value.trim()); if (row.some(Boolean)) rows.push(row); }
		const [sourceHeaders, ...data] = rows;
		if (!sourceHeaders || !headers.every((header) => sourceHeaders.includes(header))) throw new Error("The selected CSV does not match the bid master format.");
		return data.map((cells) => Object.fromEntries(sourceHeaders.map((header, index) => [header, cells[index] ?? ""])));
	};

	const nextId = () => {
		const highest = records.reduce((max, record) => {
			const match = /^BM-(\d+)$/.exec(record.BidMasterID);
			return match ? Math.max(max, Number(match[1])) : max;
		}, 0);
		return `BM-${String(highest + 1).padStart(3, "0")}`;
	};

	const displayValue = (header, value) => {
		if ((header === "StartDate" || header === "EndDate") && value) return dateFormat.format(new Date(`${value}T00:00:00`));
		if (header === "StartingAmountINR" && value !== "") return currency.format(Number(value));
		return value;
	};

	const render = () => {
		tableHead.innerHTML = `${labels.map((label) => `<th scope="col">${escapeHtml(label)}</th>`).join("")}<th scope="col">Action</th>`;
		tableBody.innerHTML = records.length
			? records.map((record) => `<tr>${headers.map((header) => `<td>${escapeHtml(displayValue(header, record[header]))}</td>`).join("")}<td class="action-cell"><button class="table-action" type="button" data-edit-id="${escapeHtml(record.BidMasterID)}">Edit</button></td></tr>`).join("")
			: `<tr><td colspan="${headers.length + 1}">No bid master records found.</td></tr>`;
		recordCount.textContent = `${records.length} ${records.length === 1 ? "record" : "records"}`;
	};

	const loadCsv = (text) => {
		records = parseCsv(text);
		render();
	};

	const openForm = () => {
		editingId = null;
		form.reset();
		document.querySelector("#bid-id").value = nextId();
		form.WinnerCapacity.value = "1";
		form.DisplayOrder.value = "1";
		form.IsActive.value = "Yes";
		form.Status.value = "Draft";
		endDate.min = "";
		formEyebrow.textContent = "New record";
		formHeading.textContent = "Add bid master";
		submitButton.textContent = "Add to master";
		formError.textContent = "";
		dialog.showModal();
	};

	const openEditForm = (bidMasterId) => {
		const record = records.find((candidate) => candidate.BidMasterID === bidMasterId);
		if (!record) return;
		editingId = bidMasterId;
		for (const header of headers) {
			if (form.elements[header]) form.elements[header].value = record[header];
		}
		endDate.min = startDate.value;
		formEyebrow.textContent = "Existing record";
		formHeading.textContent = "Edit bid master";
		submitButton.textContent = "Save changes";
		formError.textContent = "";
		dialog.showModal();
	};

	const closeForm = () => dialog.close();
	menuButton.addEventListener("click", () => {
		const open = menuButton.getAttribute("aria-expanded") === "true";
		menuButton.setAttribute("aria-expanded", String(!open));
		navigation.classList.toggle("is-open", !open);
	});
	document.querySelector("#open-form").addEventListener("click", openForm);
	document.querySelector("#close-form").addEventListener("click", closeForm);
	document.querySelector("#cancel-form").addEventListener("click", closeForm);
	tableBody.addEventListener("click", (event) => {
		const editButton = event.target.closest("[data-edit-id]");
		if (editButton) openEditForm(editButton.dataset.editId);
	});

	typeSelect.addEventListener("change", () => {
		if (typeSelect.value === "Special" && startDate.value) endDate.value = startDate.value;
	});
	startDate.addEventListener("change", () => {
		endDate.min = startDate.value;
		if (!endDate.value || endDate.value < startDate.value || typeSelect.value === "Special") endDate.value = startDate.value;
	});

	form.addEventListener("submit", async (event) => {
		event.preventDefault();
		const data = Object.fromEntries(new FormData(form));
		if (data.EndDate < data.StartDate) {
			formError.textContent = "End date cannot be before start date.";
			return;
		}
		if (data.BidType === "Special") data.EndDate = data.StartDate;
		formError.textContent = "";
		submitButton.disabled = true;
		submitButton.textContent = editingId ? "Saving…" : "Adding…";
		try {
			const response = await fetch(editingId ? `api/bid-master/${encodeURIComponent(editingId)}` : "api/bid-master", {
				method: editingId ? "PUT" : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data)
			});
			const result = await response.json();
			if (!response.ok) throw new Error(result.error || `Bid could not be ${editingId ? "updated" : "added"}.`);
			if (editingId) records[records.findIndex((record) => record.BidMasterID === editingId)] = result;
			else records.push(result);
			records.sort((left, right) => left.StartDate.localeCompare(right.StartDate) || Number(left.DisplayOrder) - Number(right.DisplayOrder));
			render();
			closeForm();
		} catch (error) {
			formError.textContent = error.message;
		} finally {
			submitButton.disabled = false;
			submitButton.textContent = editingId ? "Save changes" : "Add to master";
		}
	});

	fetch("bid-master.csv")
		.then((response) => { if (!response.ok) throw new Error(); return response.text(); })
		.then(loadCsv)
		.catch(() => {
			tableBody.innerHTML = `<tr><td colspan="${headers.length + 1}">Could not load bid-master.csv. Please open this page through the website server.</td></tr>`;
			recordCount.textContent = "CSV not loaded";
		});
})();