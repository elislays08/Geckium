// ==UserScript==
// @name        Geckium - Appearance
// @author		AngelBruni
// @description	Settings the desired appearance chosen by the user accordingly.
// @loadorder   2
// ==/UserScript==

var { AppConstants } = ChromeUtils.importESModule("resource://gre/modules/AppConstants.sys.mjs");

const forkName = AppConstants.MOZ_APP_NAME;
const unsupportedForks = {
	"superfox": true,
	"r3dfox": true
}

const appearanceChanged = new CustomEvent("appearanceChanged");

class gkVisualStyles {

	/**
	 * getVisualStyles - Gets a list of the available visual styles.
	 * 
	 * @style: If specified, it gets a list of visual styles of only a specific thing.
	 */

	static getVisualStyles(style) {
		const visualStyles = {
			/**
			 * int	  - The number used in the preference.
			 * 
			 * number - The identifier used in the style attribute.
			 * 
			 * styles - "chrome": browser UI
			 * 		    "page":   browser internal pages. Examples: "about:newtab", "about:flags", etc...
			 */

			/*0: {
				int: 2,
				year: [2008, 2010],
				number: "two",
				styles: ["chrome", "page"],
			},
			0: {
				int: 3,
				year: [2008, 2010],
				number: "three",
				styles: ["page"],
			},*/
			0: {
				int: 5,
				year: [2008, 2010],
				number: "five",
				styles: ["chrome", "page"],
			},
			1: {
				int: 6,
				year: [2010],
				number: "six",
				styles: ["chrome"],
			},
			2: {
				int: 11,
				year: [2010, 2011],
				number: "eleven",
				styles: ["chrome", "page"],
			},
			3: {
				int: 21,
				year: [2011, 2012],
				number: "twentyone",
				styles: ["chrome", "page"],
			},
			4: {
				int: 25,
				year: [2012, 2013],
				number: "twentyfive",
				styles: ["chrome"],
			},
			/*0: {
				int: 30,
				year: [2012, 2013],
				number: "thirty",
				styles: ["chrome"],
			},*/
			5: {
				int: 47,
				year: [2013, 2015],
				number: "fortyseven",
				styles: ["chrome", "page"],
			},
			6: {
				int: 68,
				number: "sixtyeight",
				year: [2015, 2018],
				styles: ["chrome", "page"],
			},
		}

		if (style == "chrome" || style == "page")
			return Object.values(visualStyles).filter(item => item.styles.includes(style));
		else
			return visualStyles;
	}


	/**
	 * setVisualStyle - Sets the specified visual styles.
	 * 
	 * @vSInt: If not null it sets the specified visual styles, otherwise, it default to 0.
	 */

	static setVisualStyle(vSInt) {
		let prefChoice = pref("Geckium.appearance.choice").tryGet.int();

		if (document.URL == "about:newtab" || document.URL == "about:home" || document.url == "about:apps") {
			switch (pref("Geckium.newTabHome.styleMode").tryGet.string()) {
				case "forced":
					prefChoice = pref("Geckium.newTabHome.style").tryGet.int();
					break;
				default:
					prefChoice = pref("Geckium.appearance.choice").tryGet.int();
					break;
			}
		} else {
			prefChoice = pref("Geckium.appearance.choice").tryGet.int();
		}

		if (!prefChoice)
			prefChoice = 0;

		if (isBrowserWindow) {
			if (prefChoice == previousChoice) {
				console.log("Choice same as previous choice, ignoring.", prefChoice, previousChoice)
				return;
			} else {
				console.log("Choice not the same as previous choice, continuing.", prefChoice, previousChoice)
			}
		}

		// bruni: We get the first and last available keys so
		//		  we don't hardcode the values in the code.
		const mapKeys = Object.keys(gkVisualStyles.getVisualStyles()).map(Number);
		const firstKey = Math.min(...mapKeys);
		const lastKey = Math.max(...mapKeys);

		// bruni: Let's remove all appearance attributes first.
		const pastAttrs = docElm.getAttributeNames();
		pastAttrs.forEach((attr) => {
			if (attr.startsWith("geckium-") && !attr.includes("crflag"))
				docElm.removeAttribute(attr);
		});

		// bruni: Let's apply the correct appearance attributes.
		if (typeof vSInt === "number") {
			if (prefChoice > lastKey) {
				vSInt = lastKey;
			} else if (prefChoice < firstKey || prefChoice == null) {
				vSInt = firstKey;
			}
			console.log(vSInt)
		} else {
			vSInt = prefChoice;
		}

		for (let i = 0; i <= vSInt; i++) {
			if (gkVisualStyles.getVisualStyles()[i]) {
				const attr = "geckium-" + gkVisualStyles.getVisualStyles()[i].number;
				docElm.setAttribute(attr, "");
			}
		}

		// bruni: Let's also apply the attribute specific to the
		//		  user choice so we can make unique styles for it.
		docElm.setAttribute("geckium-choice", gkVisualStyles.getVisualStyles()[vSInt].number);

		previousChoice = prefChoice;
		
		if (isBrowserWindow)
			dispatchEvent(appearanceChanged);	
	}
}

let previousChoice;

if (unsupportedForks[forkName]) {
	_ucUtils.showNotification(
		{
		  	label : "The " + forkName.charAt(0).toUpperCase() + forkName.slice(1) + " browser will receive no support from the Geckium team. Please download a recommended fork.",  // text shown in the notification
		  	type : "unsupported-fork",         // opt identifier for this notification
		  	priority: "critical",           // opt one of ["system","critical","warning","info"]
		  	buttons: [{
				label: "Recommended forks",
				callback: (notification) => {
				  	notification.ownerGlobal.openWebLinkIn(
						"https://github.com/MrOtherGuy/fx-autoconfig#startup-error",
						"tab"
				  	);
				  	return false
				}
		  	}],
		}
	);

	docElm.setAttribute("unsupported-fork", true);
}

window.addEventListener("load", gkVisualStyles.setVisualStyle);

// FIXME: Find the correct event instead of using a timeout initially.
setTimeout(() => {
	gkVisualStyles.setVisualStyle();
}, 50);

class gkLWTheme {
	static get classicWindowFrame() {
		return {
			enable() {
				if (isBrowserWindow) {
					docElm.setAttribute("chromemargin", "0,0,0,0");
				}
			},
			disable() {
				if (isBrowserWindow) {
					if (pref("Geckium.appearance.forceClassicTheme").tryGet.bool()) {
						docElm.setAttribute("chromemargin", "0,0,0,0");
						return;
					}

					if (!window.matchMedia("(-moz-windows-compositor: 1)").matches) {
						docElm.setAttribute("chromemargin", "0,0,0,0");
					} else {
						docElm.setAttribute("chromemargin", "0,3,3,3");
					}
				}
			},
			setCaptionButtonsStyle(style) {
				const preference = "Geckium.appearance.classicCaptionButtonsStyle";

				if (style == "auto" || style == "windows" || style == "linux" || style == "macos")
					pref(preference).set.string(style);
				else if (!pref(preference).tryGet.string())
					pref(preference).set.string("auto");

				docElm.setAttribute("gkforcecaptionbuttonstyle", pref(preference).tryGet.string());
			}
		}
	}

	static get getCustomThemeMode() {
		const customThemeModePref = pref("Geckium.customtheme.mode").tryGet.int();
		let customThemeMode;

		if (customThemeModePref <= 0)
			customThemeMode = 0;
		else if (customThemeModePref == 1)
			customThemeMode = 1;
		else if (customThemeModePref >= 2)
			customThemeMode = 2;

		return customThemeMode;
	}

	static setCustomThemeModeAttrs() {
		if (typeof docElm !== "undefined") {	
			setTimeout(() => {
				docElm.setAttribute("lwtheme-id", pref("extensions.activeThemeID").tryGet.string());

				console.log("b", pref("extensions.activeThemeID").tryGet.string())

				const isChromeTheme = pref("Geckium.chrTheme.status").tryGet.bool();
				if (!isChromeTheme) {
					const customThemeModePref = gkLWTheme.getCustomThemeMode;
					switch (customThemeModePref) {
						case 0:
							gkLWTheme.classicWindowFrame.enable();
							break;
						case 1:
							gkLWTheme.classicWindowFrame.disable();
							break;
						case 2:
							gkLWTheme.classicWindowFrame.enable();
							break;
					}
					docElm.setAttribute("customthememode", customThemeModePref);

					const isDefaultLWTheme = pref("extensions.activeThemeID").tryGet.string().includes("default-theme");
					const isDefaultLightDarkLWTheme = pref("extensions.activeThemeID").tryGet.string().includes("firefox-compact");
					const isGTKPlus = pref("extensions.activeThemeID").tryGet.string().includes("{9fe1471f-0c20-4756-bb5d-6e857a74cf9e}");

					if (isDefaultLWTheme || isDefaultLightDarkLWTheme || isGTKPlus) {
						gkLWTheme.classicWindowFrame.disable();
						return
					}
				}
			}, 0);
		}
	}
}

window.addEventListener("load", gkLWTheme.setCustomThemeModeAttrs);
Services.obs.addObserver(gkLWTheme.setCustomThemeModeAttrs, "lightweight-theme-styling-update");

/* bruni: Automatically apply appearance and theme
		  attributes when it detecs changes in the pref. */
const appearanceObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			gkVisualStyles.setVisualStyle();
			gkLWTheme.setCustomThemeModeAttrs();
		}
	},
};
Services.prefs.addObserver("Geckium.appearance.choice", appearanceObserver, false);
Services.prefs.addObserver("Geckium.appearance.forceClassicTheme", appearanceObserver, false);

function changePrivateBadgePos() {
	if (typeof docElm !== "undefined") {
		if (docElm.hasAttribute("privatebrowsingmode")) {
			const privateBrowsingIndicatorWithLabel = document.getElementById("private-browsing-indicator-with-label");
			const titlebarSpacer = document.querySelector(".titlebar-spacer");
	
			insertBefore(privateBrowsingIndicatorWithLabel, titlebarSpacer);
		}
	}
}
window.addEventListener("load", changePrivateBadgePos);

function customThemeColorizeTabGlare() {
	docElm.setAttribute("customthemecolorizetabglare", pref("Geckium.appearance.customThemeColorizeTabGlare").tryGet.bool())
}
const customThemeModeObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			gkLWTheme.setCustomThemeModeAttrs();
			customThemeColorizeTabGlare();
		}
	},
};
window.addEventListener("load", gkLWTheme.setCustomThemeModeAttrs);
window.addEventListener("load", customThemeColorizeTabGlare);
Services.prefs.addObserver("Geckium.customtheme.mode", customThemeModeObserver, false);
Services.prefs.addObserver("Geckium.appearance.customThemeColorizeTabGlare", customThemeModeObserver, false);

function enableMoreGTKIcons() {
	docElm.setAttribute("moregtkicons", pref("Geckium.appearance.moreGTKIcons").tryGet.bool());
}
window.addEventListener("load", enableMoreGTKIcons);
const moreGTKIconsObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			enableMoreGTKIcons();
		}
	},
};
Services.prefs.addObserver("Geckium.appearance.moreGTKIcons", moreGTKIconsObserver, false);

window.addEventListener("load", gkLWTheme.classicWindowFrame.setCaptionButtonsStyle);
const classicCaptionBtnsStyleObs = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			gkLWTheme.classicWindowFrame.setCaptionButtonsStyle();
		}
	},
};
Services.prefs.addObserver("Geckium.appearance.classicCaptionButtonsStyle", classicCaptionBtnsStyleObs, false);