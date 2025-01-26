const presence = new Presence({
	clientId: "1330265935948550165",
});

const enum Assets { // Other default assets can be found at index.d.ts
	Logo = "https://raw.githubusercontent.com/iuriineves/premid-assets/refs/heads/main/RTP%20Player/logo.png",
}

let oldpath = "",
	pageVars: Record<string, unknown>;

presence.on("UpdateData", async () => {
	const { pathname, href } = document.location,
		path = pathname.split("/").filter(x => x);
	if (oldpath !== pathname) {
		pageVars = await presence.getPageVariable(
			"player1",
			"player1.metadata.season.number",
			"player1.metadata.episode.number",
			"player1.metadata.program.title",
			"player1.metadata.episode.title",
			"player1.instance.contentMetadata.poster[0]",
			"player1.gaCategory",
			"playerlive",
			"playerlive.metadata.channel.name",
			"playerlive.metadata.program.title",
			"playerlive.instance.contentMetadata.poster[0]"
		);
	}

	oldpath = pathname;

	if (path[0] === "play") {
		if (path[1] === "direto" || path[2] === "direto") {
			return presence.setActivity({
				type: ActivityType.Watching,
				name: pageVars["playerlive.metadata.channel.name"] as string,
				state: pageVars["playerlive.metadata.program.title"] as string,
				largeImageKey: pageVars[
					"playerlive.instance.contentMetadata.poster[0]"
				] as string,
				smallImageKey: Assets.Live,
				smallImageText: "Live",
				buttons: [
					{
						label: "Watch Along",
						url: href,
					},
				],
			});
		}

		if (pageVars.player1) {
			const { currentTime, duration, paused } = document.querySelector(
				"video.rmp-video"
			) as HTMLVideoElement;
			return presence.setActivity({
				type:
					pageVars["player1.gaCategory"] === "ondemand video"
						? ActivityType.Watching
						: ActivityType.Listening,
				largeImageKey: pageVars[
					"player1.instance.contentMetadata.poster[0]"
				] as string,
				largeImageText: `Season ${
					pageVars["player1.metadata.season.number"] === ""
						? 1
						: pageVars["player1.metadata.season.number"]
				}, Episode ${
					pageVars["player1.metadata.episode.number"] === ""
						? 1
						: pageVars["player1.metadata.episode.number"]
				}`,
				name: pageVars["player1.metadata.program.title"] as string,
				state: pageVars["player1.metadata.episode.title"] as string,
				...(!paused && {
					startTimestamp: presence.getTimestamps(currentTime, duration)[0],
					endTimestamp: presence.getTimestamps(currentTime, duration)[1],
				}),
				smallImageKey: paused ? Assets.Pause : Assets.Play,
				smallImageText: paused ? "Paused" : "Playing",
				buttons: [
					{
						label: "Watch Along",
						url: href,
					},
				],
			});
		}
	}
});
