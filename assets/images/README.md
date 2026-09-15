# Temple Images

You can place original image files in this folder and reference them from `content.js`.

The easier option is to open `manage-images.html`, select photos, and save the generated `gallery-data.js` file into the website root.

## Event images

Create one folder per event under `assets/images/Events`. Use the event ID as the folder name, for example:

```text
assets/images/Events/kshamavani-parv-2026/01.jpg
assets/images/Events/kshamavani-parv-2026/02.jpg
```

Then add the images to the matching event in `content.js`:

```js
{
	id: "kshamavani-parv-2026",
	date: "2026-09-16",
	title: "Kshamavani Parv",
	details: ["7:30 AM | Nitya Abhishek"],
	images: [
		{
			src: "assets/images/Events/kshamavani-parv-2026/01.jpg",
			alt: "Devotees participating in Kshamavani Pooja",
			caption: "Samuhik Pooja"
		}
	]
}
```

The Events page displays the photo button only when the `images` array contains at least one image.

For a completed event, place the same structure in `eventHistory`. Every event must have a unique `id`; the Event history link uses that ID to open `event-details.html` with the correct information and photos.